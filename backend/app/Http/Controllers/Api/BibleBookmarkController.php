<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
            ->where('book', $request->book)
            ->where('chapter', $request->chapter)
            ->get();

        return response()->json($bookmarks);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'version_id' => 'required|string',
                'book' => 'required|string',
                'chapter' => 'required|integer',
                'verse' => 'required|integer',
                'text' => 'nullable|string',
            ]);

            $bookmark = $request->user()->bibleBookmarks()->updateOrCreate(
                [
                    'book' => $validated['book'],
                    'chapter' => $validated['chapter'],
                    'verse' => $validated['verse'],
                ],
                [
                    'version_id' => $validated['version_id'],
                    'text' => $validated['text'] ?? null,
                ]
            );

            \Log::info('Bookmark Saved Successfully', ['id' => $bookmark->id]);

            return response()->json($bookmark);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Bookmark Validation Failed', ['errors' => $e->errors()]);
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Bookmark Save Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Failed to save bookmark', 'message' => $e->getMessage()], 500);
        }
    }

    public function deleteByVerse(Request $request)
    {
        \Log::info('Bookmark Remove Request', [
            'user' => $request->user()->id,
            'data' => $request->all(),
        ]);

        $validated = $request->validate([
            'version_id' => 'required|string',
            'book' => 'required|string',
            'chapter' => 'required|integer',
            'verse' => 'required|integer',
        ]);

        $deleted = $request->user()->bibleBookmarks()
            ->where('book', $validated['book'])
            ->where('chapter', $validated['chapter'])
            ->where('verse', $validated['verse'])
            ->delete();

        \Log::info('Bookmark Removed', ['count' => $deleted]);

        return response()->json(['message' => 'Bookmark removed']);
    }
}
