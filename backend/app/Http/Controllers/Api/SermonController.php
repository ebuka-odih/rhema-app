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
            'duration_seconds' => 'required|integer',
        ]);

        $user = $request->user();
        
        // Limits
        $maxDailyRecordings = $user->is_pro ? 5 : 3;
        $maxDurationSeconds = $user->is_pro ? 3000 : 600; // 50 mins vs 10 mins

        // 1. Check daily count
        $todayCount = $user->sermons()->whereDate('created_at', now()->today())->count();
        if ($todayCount >= $maxDailyRecordings) {
            return response()->json([
                'error' => 'Daily limit reached',
                'details' => "You have reached your limit of {$maxDailyRecordings} recordings per day."
            ], 403);
        }

        // 2. Check duration
        if ($request->duration_seconds > $maxDurationSeconds) {
            $limitMins = $maxDurationSeconds / 60;
            return response()->json([
                'error' => 'Recording too long',
                'details' => "Your recording exceeds the {$limitMins} minute limit for your account."
            ], 403);
        }

        $file = $request->file('audio');
        
        // Save locally first
        $path = $file->store('sermons', 'public');
        $filePath = storage_path('app/public/' . $path);

        try {
            $openaiKey = config('services.openai.key');
            if (!$openaiKey) {
                return response()->json(['error' => 'OpenAI API key not configured on server'], 500);
            }

            // 1. Transcription using Whisper
            $transcriptionResponse = Http::withToken($openaiKey)
                ->attach('file', file_get_contents($filePath), 'sermon.m4a')
                ->post('https://api.openai.com/v1/audio/transcriptions', [
                    'model' => 'whisper-1',
                ]);

            if ($transcriptionResponse->failed()) {
                Log::error('Whisper API Error: ' . $transcriptionResponse->body());
                throw new \Exception('Failed to transcribe audio with Whisper');
            }

            $transcription = $transcriptionResponse->json('text');

            // 2. Summarization using GPT-4o-mini
            $summaryResponse = Http::withToken($openaiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an expert theological assistant. Summarize the provided sermon transcription into concise bullet points highlighting the key theological takeaways.'
                        ],
                        [
                            'role' => 'user',
                            'content' => "Sermon Transcription:\n\n" . $transcription
                        ]
                    ],
                    'temperature' => 0.7
                ]);

            if ($summaryResponse->failed()) {
                Log::error('OpenAI Chat Error: ' . $summaryResponse->body());
                $summary = "Summary generation failed.";
            } else {
                $summary = $summaryResponse->json('choices.0.message.content');
            }

            Log::info('Saving sermon with summary length: ' . strlen($summary ?? ''));
            
            $sermon = Sermon::create([
                'user_id' => $user->id,
                'title' => $request->title,
                'duration_seconds' => $request->duration_seconds,
                'audio_path' => $path,
                'transcription' => $transcription,
                'summary' => $summary,
            ]);

            return response()->json($sermon);

        } catch (\Exception $e) {
            Log::error('Sermon Processing Error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Sermon $sermon)
    {
        if ($sermon->user_id != $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'transcription' => 'sometimes|string',
            'summary' => 'sometimes|string',
        ]);

        $sermon->update($validated);

        return response()->json($sermon->fresh());
    }

    public function destroy(Request $request, Sermon $sermon)
    {
        if ($sermon->user_id != $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete audio file if it exists
        if ($sermon->audio_path) {
            Storage::disk('public')->delete($sermon->audio_path);
        }

        $sermon->delete();

        return response()->json(['message' => 'Sermon deleted successfully']);
    }
}
