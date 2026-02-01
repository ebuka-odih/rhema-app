<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BibleHighlightController extends Controller
{
    public function index(Request $request)
    {
        $highlights = $request->user()->bibleHighlights()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($highlights);
    }

    public function getForChapter(Request $request)
    {
        $request->validate([
            'version_id' => 'required|string',
            'book' => 'required|string',
            'chapter' => 'required|integer',
        ]);

        $highlights = $request->user()->bibleHighlights()
            ->where('book', $request->book)
            ->where('chapter', $request->chapter)
            ->get();

        return response()->json($highlights);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'version_id' => 'required|string',
            'book' => 'required|string',
            'chapter' => 'required|integer',
            'verse' => 'required|integer',
            'color' => 'required|string',
            'note' => 'nullable|string',
        ]);

        $highlight = $request->user()->bibleHighlights()->updateOrCreate(
            [
                'book' => $validated['book'],
                'chapter' => $validated['chapter'],
                'verse' => $validated['verse'],
            ],
            [
                'version_id' => $validated['version_id'],
                'color' => $validated['color'],
                'note' => $validated['note'] ?? null,
            ]
        );

        return response()->json($highlight);
    }

    public function destroy(Request $request, $id)
    {
        $highlight = $request->user()->bibleHighlights()->findOrFail($id);
        $highlight->delete();

        return response()->json(['message' => 'Highlight deleted successfully']);
    }

    public function deleteByVerse(Request $request)
    {
        $validated = $request->validate([
            'version_id' => 'required|string',
            'book' => 'required|string',
            'chapter' => 'required|integer',
            'verse' => 'required|integer',
        ]);

        $request->user()->bibleHighlights()
            ->where('book', $validated['book'])
            ->where('chapter', $validated['chapter'])
            ->where('verse', $validated['verse'])
            ->delete();

        return response()->json(['message' => 'Highlight removed']);
    }
}
