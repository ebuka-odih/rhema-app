<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\BibleBookmark;

class BibleBookmarkController extends Controller
{
    public function index(Request $request)
    {
        $bookmarks = $request->user()->bibleBookmarks()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookmarks);
    }

    public function getForChapter(Request $request)
    {
        $request->validate([
            'version_id' => 'required|string',
            'book' => 'required|string',
            'chapter' => 'required|integer',
        ]);

        $bookmarks = $request->user()->bibleBookmarks()
            ->where('version_id', $request->version_id)
            ->where('book', $request->book)
            ->where('chapter', $request->chapter)
            ->get();

        return response()->json($bookmarks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'version_id' => 'required|string',
            'book' => 'required|string',
            'chapter' => 'required|integer',
            'verse' => 'required|integer',
            'text' => 'nullable|string',
        ]);

        $bookmark = $request->user()->bibleBookmarks()->updateOrCreate(
            [
                'version_id' => $validated['version_id'],
                'book' => $validated['book'],
                'chapter' => $validated['chapter'],
                'verse' => $validated['verse'],
            ],
            [
                'text' => $validated['text'] ?? null,
            ]
        );

        return response()->json($bookmark);
    }

    public function deleteByVerse(Request $request)
    {
        $validated = $request->validate([
            'version_id' => 'required|string',
            'book' => 'required|string',
            'chapter' => 'required|integer',
            'verse' => 'required|integer',
        ]);

        $request->user()->bibleBookmarks()
            ->where('version_id', $validated['version_id'])
            ->where('book', $validated['book'])
            ->where('chapter', $validated['chapter'])
            ->where('verse', $validated['verse'])
            ->delete();

        return response()->json(['message' => 'Bookmark removed']);
    }
}
