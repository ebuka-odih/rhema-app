<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Prayer;

class PrayerController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->prayers()->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'request' => 'required|string',
            'time' => 'nullable|string',
            'reminder_enabled' => 'nullable|boolean',
            'status' => 'nullable|in:active,done',
        ]);

        $prayer = $request->user()->prayers()->create($validated);

        return response()->json($prayer);
    }

    public function update(Request $request, Prayer $prayer)
    {
        if ($prayer->user_id != $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'request' => 'sometimes|string',
            'time' => 'sometimes|string',
            'reminder_enabled' => 'sometimes|boolean',
            'status' => 'sometimes|in:active,done',
        ]);

        $prayer->update($validated);

        return response()->json($prayer);
    }

    public function destroy(Request $request, Prayer $prayer)
    {
        if ($prayer->user_id != $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $prayer->delete();

        return response()->json(['message' => 'Prayer deleted successfully']);
    }
}
