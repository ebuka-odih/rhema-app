<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\FastingSession;
use Carbon\Carbon;

class FastingController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->fastingSessions()->latest()->get());
    }

    protected $fastingVerses = [
        ['text' => 'But when you fast, put oil on your head and wash your face, so that it will not be obvious to others that you are fasting, but only to your Father, who is unseen; and your Father, who sees what is done in secret, will reward you.', 'ref' => 'Matthew 6:17-18'],
        ['text' => 'Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke, to set the oppressed free and break every yoke?', 'ref' => 'Isaiah 58:6'],
        ['text' => 'Even now,” declares the Lord, “return to me with all your heart, with fasting and weeping and mourning.', 'ref' => 'Joel 2:12'],
        ['text' => 'Man shall not live by bread alone, but by every word that comes from the mouth of God.', 'ref' => 'Matthew 4:4'],
        ['text' => 'I humbled myself with fasting; and my prayer returned into mine own bosom.', 'ref' => 'Psalm 35:13'],
    ];

    public function active(Request $request)
    {
        $active = $request->user()->fastingSessions()
            ->where('status', 'active')
            ->first();

        if ($active && $active->recommend_verses) {
            $active->recommended_verse = $this->fastingVerses[array_rand($this->fastingVerses)];
        }

        return response()->json($active);
    }

    public function store(Request $request)
    {
        $request->validate([
            'duration_hours' => 'required|integer|min:1|max:100',
            'recommend_verses' => 'boolean',
            'reminder_interval' => 'nullable|integer',
        ]);

        // Check if there's already an active fast
        $active = $request->user()->fastingSessions()
            ->where('status', 'active')
            ->first();

        if ($active) {
            return response()->json(['message' => 'You already have an active fast.'], 422);
        }

        $session = $request->user()->fastingSessions()->create([
            'duration_hours' => $request->duration_hours,
            'start_time' => now(),
            'recommend_verses' => $request->recommend_verses ?? false,
            'reminder_interval' => $request->reminder_interval,
            'status' => 'active',
        ]);

        return response()->json($session, 201);
    }

    public function update(Request $request, FastingSession $fastingSession)
    {
        if ($fastingSession->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:completed,cancelled',
        ]);

        $fastingSession->update([
            'status' => $request->status,
            'end_time' => now(),
        ]);

        return response()->json($fastingSession);
    }
}
