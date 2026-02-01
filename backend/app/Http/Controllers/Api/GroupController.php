<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FastingGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        // Return groups the user is member of
        return $request->user()->fastingGroups()->withCount('members')->get();
    }

    public function all(Request $request)
    {
        // Return all groups (maybe for discovery)
        return FastingGroup::withCount('members')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group = FastingGroup::create([
            'name' => $request->name,
            'description' => $request->description,
            'created_by' => $request->user()->id,
            'code' => strtoupper(Str::random(6)),
        ]);

        // Automatically join the creator as admin
        $group->members()->attach($request->user()->id, ['role' => 'admin']);

        return response()->json($group->load('members'), 201);
    }

    public function join(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $group = FastingGroup::where('code', strtoupper($request->code))->first();

        if (! $group) {
            return response()->json(['message' => 'Group not found.'], 404);
        }

        if ($group->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'You are already a member of this group.'], 422);
        }

        $group->members()->attach($request->user()->id, ['role' => 'member']);

        return response()->json($group->load('members'));
    }

    public function show(FastingGroup $group)
    {
        return $group->load(['members', 'creator']);
    }

    public function leave(Request $request, FastingGroup $group)
    {
        $group->members()->detach($request->user()->id);

        return response()->json(['message' => 'Left group successfully.']);
    }
}
