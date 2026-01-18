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
                throw new \Exception('Gemini API key not configured');
            }

            // Encode file for Gemini
            $audioData = base64_encode(file_get_contents($file->getPathname()));
            $mimeType = $file->getMimeType();

            // Note: If mimetype is not audio, Gemini might complain. 
            // Most mobile recordings are audio/m4a or audio/aac.
            
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => "You are an expert theological assistant. 
                                        1. Transcribe the provided sermon audio accurately.
                                        2. Provide a concise summary of the key theological takeaways in bullet points.
                                        
                                        Output format strictly JSON:
                                        {
                                          \"transcription\": \"Full text here...\",
                                          \"summary\": \"• Point 1\\n• Point 2...\"
                                        }"],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $audioData
                                ]
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                ]
            ]);

            if ($response->failed()) {
                Log::error('Gemini API Error: ' . $response->body());
                throw new \Exception('Failed to process audio with AI');
            }

            $result = $response->json('candidates.0.content.parts.0.text');
            $data = json_decode($result, true);

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
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
