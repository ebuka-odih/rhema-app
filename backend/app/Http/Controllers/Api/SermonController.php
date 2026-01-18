<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Sermon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SermonController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->sermons()->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'audio' => 'required|file',
            'title' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $file = $request->file('audio');
        
        // Save locally first
        $path = $file->store('sermons', 'public');

        try {
            $apiKey = config('services.gemini.key');
            if (!$apiKey) {
                return response()->json(['error' => 'Gemini API key not configured on server'], 500);
            }

            // Encode file for Gemini
            $audioData = base64_encode(file_get_contents($file->getPathname()));
            $mimeType = $file->getMimeType();

            // Normalize mime type for Gemini
            if (str_contains($mimeType, 'm4a') || str_contains($mimeType, 'x-m4a')) {
                $mimeType = 'audio/mp4'; // Gemini prefers audio/mp4 for m4a
            }

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $audioData
                                ]
                            ],
                            ['text' => "You are an expert theological assistant. 
                                        1. Transcribe the provided sermon audio accurately.
                                        2. Provide a concise summary of the key theological takeaways in bullet points.
                                        
                                        Output format strictly JSON:
                                        {
                                          \"transcription\": \"Full text here...\",
                                          \"summary\": \"• Point 1\\n• Point 2...\"
                                        }"]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                ]
            ]);

            if ($response->failed()) {
                $errorBody = $response->json();
                Log::error('Gemini API Error: ', $errorBody ?? []);
                return response()->json([
                    'error' => 'Gemini AI processing failed',
                    'details' => $errorBody['error']['message'] ?? 'Unknown Gemini Error'
                ], 500);
            }

            $resultText = $response->json('candidates.0.content.parts.0.text');
            $data = json_decode($resultText, true);

            if (!$data) {
                return response()->json(['error' => 'Failed to parse AI response', 'raw' => $resultText], 500);
            }

            $sermon = Sermon::create([
                'user_id' => $user->id,
                'title' => $request->title,
                'audio_path' => $path,
                'transcription' => $data['transcription'] ?? 'Transcription failed',
                'summary' => $data['summary'] ?? 'Summary failed',
            ]);

            return response()->json($sermon);

        } catch (\Exception $e) {
            Log::error('Sermon Processing Error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }
}
