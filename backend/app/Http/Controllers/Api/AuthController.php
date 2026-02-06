<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Notifications\PasswordResetOtp;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function googleLogin(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $googleUser = $this->verifyGoogleToken($request->token);

        if (! $googleUser) {
            return response()->json(['message' => 'Invalid Google token'], 401);
        }

        $user = User::where('email', $googleUser['email'])->first();

        if (! $user) {
            $user = User::create([
                'name' => $googleUser['name'],
                'email' => $googleUser['email'],
                'password' => Hash::make(uniqid()), // Random password
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function appleLogin(Request $request)
    {
        $request->validate([
            'identity_token' => 'required|string',
            'full_name' => 'nullable|string|max:255',
            'email' => 'nullable|email',
        ]);

        $payload = $this->verifyAppleIdentityToken($request->identity_token);
        if (! $payload) {
            return response()->json(['message' => 'Invalid Apple token'], 401);
        }

        $appleId = $payload['sub'] ?? null;
        $email = $payload['email'] ?? $request->email;
        $emailVerified = ($payload['email_verified'] ?? 'false') === 'true';

        if (! $appleId) {
            return response()->json(['message' => 'Invalid Apple token'], 401);
        }

        $user = User::where('apple_id', $appleId)->first();

        if (! $user && $email) {
            $user = User::where('email', $email)->first();
        }

        if (! $user && ! $email) {
            return response()->json(['message' => 'Apple email not available'], 422);
        }

        if (! $user) {
            $user = User::create([
                'name' => $request->full_name ?: 'Apple User',
                'email' => $email,
                'apple_id' => $appleId,
                'password' => Hash::make(uniqid()),
                'email_verified_at' => $emailVerified ? now() : null,
            ]);
        } else {
            $updates = [];
            if (! $user->apple_id) $updates['apple_id'] = $appleId;
            if (! $user->email && $email) $updates['email'] = $email;
            if ($emailVerified && ! $user->email_verified_at) $updates['email_verified_at'] = now();
            if ($request->full_name && $user->name === 'Apple User') $updates['name'] = $request->full_name;
            if (! empty($updates)) $user->update($updates);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    private function verifyGoogleToken($token)
    {
        try {
            $client = new \GuzzleHttp\Client;
            $response = $client->get('https://www.googleapis.com/oauth2/v3/userinfo', [
                'headers' => [
                    'Authorization' => 'Bearer '.$token,
                ],
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'settings' => 'sometimes|array',
        ]);

        $user->update($request->only(['name', 'phone', 'settings']));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match our records.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        // Delete stored sermon audio before removing the user
        $user->sermons()->each(function ($sermon) {
            if ($sermon->audio_path) {
                Storage::disk('public')->delete($sermon->audio_path);
            }
        });

        DB::table('sessions')->where('user_id', $user->id)->delete();
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }
    
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // 1. Throttling: Check if a token was recently created for this email (60 second cooldown)
        $existingRecord = DB::table('password_reset_tokens')->where('email', $request->email)->first();
        if ($existingRecord && now()->parse($existingRecord->created_at)->addSeconds(60)->isFuture()) {
            return response()->json([
                'message' => 'Please wait ' . now()->parse($existingRecord->created_at)->addSeconds(60)->diffInSeconds(now()) . ' seconds before requesting another code.'
            ], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // We return success even if user not found for security reasons
            return response()->json(['message' => 'If your email is in our system, you will receive a reset code shortly.']);
        }

        // Generate 6-digit OTP
        $otp = sprintf("%06d", mt_rand(1, 999999));

        // Store OTP in password_reset_tokens table (hashed for security, just like normal tokens)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($otp),
                'created_at' => now()
            ]
        );

        // Send Custom OTP Notification
        $user->notify(new PasswordResetOtp($otp));

        return response()->json(['message' => 'Reset code sent successfully.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string|size:6', // This is now the 6-digit OTP
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            throw ValidationException::withMessages([
                'token' => ['The reset code is invalid.'],
            ]);
        }

        // Check expiry (60 minutes)
        if (now()->parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ValidationException::withMessages([
                'token' => ['The reset code has expired.'],
            ]);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['User not found.'],
            ]);
        }

        // Update password
        $user->forceFill([
            'password' => Hash::make($request->password)
        ]);
        
        $user->setRememberToken(\Illuminate\Support\Str::random(60));
        $user->save();

        // Delete the token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Your password has been reset successfully.']);
    }

    private function verifyAppleIdentityToken(string $identityToken): ?array
    {
        $parts = explode('.', $identityToken);
        if (count($parts) !== 3) return null;

        $header = json_decode($this->base64UrlDecode($parts[0]), true);
        $payload = json_decode($this->base64UrlDecode($parts[1]), true);

        if (! is_array($header) || ! is_array($payload)) return null;

        if (($payload['iss'] ?? null) !== 'https://appleid.apple.com') return null;

        $clientId = config('services.apple.client_id', 'com.odih.wordflow');
        $aud = $payload['aud'] ?? null;
        if (is_array($aud)) {
            if (! in_array($clientId, $aud, true)) return null;
        } else {
            if ($aud !== $clientId) return null;
        }

        if (($payload['exp'] ?? 0) < time()) return null;

        $kid = $header['kid'] ?? null;
        if (! $kid) return null;

        $keys = $this->getApplePublicKeys();
        if (! isset($keys[$kid])) return null;

        $signature = $this->base64UrlDecode($parts[2]);
        $data = $parts[0] . '.' . $parts[1];
        $publicKey = openssl_pkey_get_public($keys[$kid]);
        if (! $publicKey) return null;

        $verified = openssl_verify($data, $signature, $publicKey, OPENSSL_ALGO_SHA256);
        if ($verified !== 1) return null;

        return $payload;
    }

    private function getApplePublicKeys(): array
    {
        return Cache::remember('apple_signin_public_keys', 3600, function () {
            try {
                $client = new \GuzzleHttp\Client;
                $response = $client->get('https://appleid.apple.com/auth/keys', [
                    'timeout' => 10,
                ]);
                $data = json_decode($response->getBody()->getContents(), true);
                $keys = [];

                foreach ($data['keys'] ?? [] as $key) {
                    if (! empty($key['kid']) && ! empty($key['x5c'][0])) {
                        $cert = "-----BEGIN CERTIFICATE-----\n"
                            . chunk_split($key['x5c'][0], 64, "\n")
                            . "-----END CERTIFICATE-----\n";
                        $keys[$key['kid']] = $cert;
                    }
                }

                return $keys;
            } catch (\Throwable $e) {
                return [];
            }
        });
    }

    private function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;
        if ($remainder) {
            $value .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }
}
