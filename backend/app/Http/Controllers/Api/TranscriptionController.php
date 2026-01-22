<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TranscriptionController extends Controller
{
    public function transcribe(Request $request)
    {
        $request->validate([
            'audio' => 'required|file',
        ]);

        $file = $request->file('audio');
        $path = $file->store('temp_transcriptions', 'public');
        $filePath = storage_path('app/public/' . $path);

        try {
            $openaiKey = config('services.openai.key');
            if (!$openaiKey) {
                return response()->json(['error' => 'OpenAI API key not configured on server'], 500);
            }

            $response = Http::withToken($openaiKey)
                ->attach('file', file_get_contents($filePath), 'audio.m4a')
                ->post('https://api.openai.com/v1/audio/transcriptions', [
                    'model' => 'whisper-1',
                ]);

            // Clean up
            Storage::disk('public')->delete($path);

            if ($response->failed()) {
                Log::error('Whisper API Error: ' . $response->body());
                return response()->json(['error' => 'Failed to transcribe audio'], 500);
            }

            return response()->json([
                'text' => $response->json('text')
            ]);

        } catch (\Exception $e) {
            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }
            Log::error('Transcription Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }
}
