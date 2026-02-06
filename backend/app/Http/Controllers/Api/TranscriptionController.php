<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OpenRouter;
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
            'model' => 'sometimes|string',
            'models' => 'sometimes|array',
            'models.*' => 'string',
            'prompt' => 'sometimes|string',
        ]);

        $file = $request->file('audio');
        $path = $file->store('temp_transcriptions', 'public');
        $filePath = storage_path('app/public/'.$path);

        try {
            $openrouterKey = OpenRouter::key();
            if (! $openrouterKey) {
                return response()->json(['error' => 'OpenRouter API key not configured on server'], 500);
            }

            $models = $request->input('models');
            if (! is_array($models) || count($models) === 0) {
                $singleModel = $request->input('model') ?: OpenRouter::transcriptionModel();
                $models = $singleModel ? [$singleModel] : [];
            }

            if (count($models) === 0) {
                return response()->json(['error' => 'No transcription model configured'], 500);
            }

            $baseUrl = OpenRouter::baseUrl();
            $headers = OpenRouter::headers();
            $results = [];
            $errors = [];

            foreach ($models as $model) {
                $payload = ['model' => $model];
                if ($request->filled('prompt')) {
                    $payload['prompt'] = $request->input('prompt');
                }

                $response = Http::withToken($openrouterKey)
                    ->withHeaders($headers)
                    ->timeout(300)
                    ->attach('file', file_get_contents($filePath), $file->getClientOriginalName() ?: 'audio.m4a')
                    ->post($baseUrl.'/audio/transcriptions', $payload);

                if ($response->failed()) {
                    $errors[$model] = $response->body();
                    Log::error('OpenRouter transcription error ('.$model.'): '.$response->body());
                    continue;
                }

                $results[$model] = $response->json('text');
            }

            // Clean up
            Storage::disk('public')->delete($path);

            if (count($results) === 0) {
                return response()->json([
                    'error' => 'Failed to transcribe audio',
                    'details' => $errors,
                ], 500);
            }

            if (count($results) === 1 && count($errors) === 0) {
                $model = array_key_first($results);

                return response()->json([
                    'text' => $results[$model],
                    'model' => $model,
                ]);
            }

            return response()->json([
                'results' => $results,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }
            Log::error('Transcription Error: '.$e->getMessage());
            Log::error('Stack trace: '.$e->getTraceAsString());

            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }
}
