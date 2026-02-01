<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sermon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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
                'details' => "You have reached your limit of {$maxDailyRecordings} recordings per day.",
            ], 403);
        }

        // 2. Check duration
        if ($request->duration_seconds > $maxDurationSeconds) {
            $limitMins = $maxDurationSeconds / 60;

            return response()->json([
                'error' => 'Recording too long',
                'details' => "Your recording exceeds the {$limitMins} minute limit for your account.",
            ], 403);
        }

        $file = $request->file('audio');

        // Save locally first
        $path = $file->store('sermons', 'public');
        $filePath = storage_path('app/public/'.$path);

        // 3. Create Sermon record IMMEDIATELY to preserve the audio
        $sermon = Sermon::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'duration_seconds' => $request->duration_seconds,
            'audio_path' => $path,
            'status' => 'processing',
        ]);

        try {
            $this->performProcessing($sermon, $filePath);
            return response()->json($sermon->fresh());
        } catch (\Exception $e) {
            Log::error('Sermon Processing Error: '.$e->getMessage());
            $sermon->update(['status' => 'failed']);
            // Still return the sermon object so the user can retry or at least see it in their list
            return response()->json($sermon->fresh(), 202); 
        }
    }

    public function reprocess(Request $request, Sermon $sermon)
    {
        if ($sermon->user_id != $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $filePath = storage_path('app/public/'.$sermon->audio_path);
        if (!file_exists($filePath)) {
            return response()->json(['error' => 'Audio file missing'], 404);
        }

        try {
            $sermon->update(['status' => 'processing']);
            $this->performProcessing($sermon, $filePath);
            return response()->json($sermon->fresh());
        } catch (\Exception $e) {
            Log::error('Sermon Reprocessing Error: '.$e->getMessage());
            $sermon->update(['status' => 'failed']);
            return response()->json(['error' => 'Reprocessing failed: '.$e->getMessage()], 500);
        }
    }

    protected function performProcessing(Sermon $sermon, string $filePath)
    {
        $openaiKey = config('services.openai.key');
        if (!$openaiKey) {
            throw new \Exception('OpenAI API key missing');
        }

        // 1. Transcription using Whisper (Increased timeout to 5 mins for long sermons)
        $transcriptionResponse = Http::withToken($openaiKey)
            ->timeout(300) 
            ->attach('file', file_get_contents($filePath), 'sermon.m4a')
            ->post('https://api.openai.com/v1/audio/transcriptions', [
                'model' => 'whisper-1',
                'prompt' => 'A faithful and accurate transcript of a sermon, capturing the message, scripture references, and spiritual insights clearly.',
            ]);

        if ($transcriptionResponse->failed()) {
            throw new \Exception('Whisper API Error: '.$transcriptionResponse->body());
        }

        $transcription = $transcriptionResponse->json('text');

        // 2. Summarization using GPT-4o-mini
        $summaryResponse = Http::withToken($openaiKey)
            ->timeout(120)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a helpful assistant. Provided is a sermon transcription. Create a clear, structured summary using key takeaways. 

CRITICAL PRIORITY: Identify and include EVERY Bible scripture reference mentioned (e.g., Hebrews 11, John 3:16). Ensure these references are integrated into the relevant takeaway points.

Format rules:
1. Use bullet points (e.g., - **Header**: Explanation).
2. Each point must have a bolded header.
3. Use exactly ONE line break (no empty lines) between each bullet point to keep it compact.
4. For every teaching point, explicitly mention the supporting Bible verse(s) the speaker used.
5. Be thorough but capture every distinct key point—do not omit scripture.
6. Proportional Detail: 
   - For very short recordings (< 2 mins): 2-3 points with scriptures.
   - For medium recordings (2-10 mins): 5-8 points with scriptures.
   - For long sermons (> 10 mins): 8-12 points with scriptures.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Sermon Transcription:\n\n".$transcription,
                    ],
                ],
                'temperature' => 0.5,
            ]);

        $summary = $summaryResponse->ok() ? $summaryResponse->json('choices.0.message.content') : 'Summary generation failed.';

        $sermon->update([
            'transcription' => $transcription,
            'summary' => $summary,
            'status' => 'completed'
        ]);
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
