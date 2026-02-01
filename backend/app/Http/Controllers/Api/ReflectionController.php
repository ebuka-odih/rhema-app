<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reflection;
use Illuminate\Http\Request;

class ReflectionController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->reflections()->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string',
        ]);

        $reflection = $request->user()->reflections()->create($validated);

        return response()->json($reflection);
    }

    public function update(Request $request, Reflection $reflection)
    {
        if ($reflection->user_id != $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'category' => 'nullable|string',
        ]);

        $reflection->update($validated);

        return response()->json($reflection);
    }

    public function destroy(Request $request, Reflection $reflection)
    {
        if ($reflection->user_id != $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $reflection->delete();

        return response()->json(['message' => 'Reflection deleted successfully']);
    }
}
