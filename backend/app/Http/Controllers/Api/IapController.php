<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class IapController extends Controller
{
    public function iosReceipt(Request $request)
    {
        $request->validate([
            'receipt' => 'required|string',
            'product_id' => 'required|string',
        ]);

        $sharedSecret = config('services.apple.shared_secret');
        if (!$sharedSecret) {
            return response()->json(['message' => 'Server not configured for App Store receipts'], 500);
        }

        $payload = [
            'receipt-data' => $request->receipt,
            'password' => $sharedSecret,
            'exclude-old-transactions' => true,
        ];

        $result = $this->verifyReceipt($payload, false);
        if (($result['status'] ?? null) === 21007) {
            $result = $this->verifyReceipt($payload, true);
        }

        if (($result['status'] ?? null) !== 0) {
            Log::warning('Apple receipt verification failed', [
                'status' => $result['status'] ?? null,
            ]);
            return response()->json(['message' => 'Receipt verification failed'], 422);
        }

        $receiptItems = $result['latest_receipt_info'] ?? $result['receipt']['in_app'] ?? [];
        $productId = $request->product_id;

        $latest = collect($receiptItems)
            ->where('product_id', $productId)
            ->sortByDesc('expires_date_ms')
            ->first();

        if (!$latest) {
            return response()->json(['message' => 'No matching subscription found'], 422);
        }

        $expiresMs = (int) ($latest['expires_date_ms'] ?? 0);
        $isActive = $expiresMs > (int) (now()->valueOf());

        if (!$isActive) {
            return response()->json(['message' => 'Subscription expired'], 422);
        }

        $user = $request->user();
        $user->is_pro = true;
        $user->save();

        return response()->json([
            'active' => true,
            'expires_date_ms' => $expiresMs,
        ]);
    }

    private function verifyReceipt(array $payload, bool $sandbox): array
    {
        $url = $sandbox
            ? 'https://sandbox.itunes.apple.com/verifyReceipt'
            : 'https://buy.itunes.apple.com/verifyReceipt';

        try {
            $client = new \GuzzleHttp\Client;
            $response = $client->post($url, [
                'json' => $payload,
                'timeout' => 15,
            ]);
            return json_decode($response->getBody()->getContents(), true) ?? [];
        } catch (\Throwable $e) {
            Log::warning('Apple receipt verification error', ['error' => $e->getMessage()]);
            return ['status' => -1];
        }
    }
}
