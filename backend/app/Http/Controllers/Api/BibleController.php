<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Models\DailyVerse;
use Carbon\Carbon;

class BibleController extends Controller
{
    protected $data_path;

    public function __construct()
    {
        $this->data_path = database_path('data');
    }

    public function dailyVerse()
    {
        $today = Carbon::today()->toDateString();
        
        // Check if we already have a verse for today
        $verse = DailyVerse::where('date', $today)->first();
        
        if ($verse) {
            return response()->json($verse);
        }

        // Generate a random verse for today if none exists
        // 1. Get a random version
        $versions = ['NEW KING JAMES VERSION', 'NEW LIVING TRANSLATION'];
        $version = $versions[array_rand($versions)];
        $path = $this->data_path . '/' . $version . '.json';

        if (!File::exists($path)) {
            // Fallback if file doesn't exist
            return response()->json([
                'reference' => 'Psalms 23:1',
                'text' => 'The Lord is my shepherd; I shall not want.',
                'version' => 'NKJV',
                'date' => $today
            ]);
        }

        $content = json_decode(File::get($path), true);
        
        // 2. Pick a random book
        $books = array_keys($content);
        $book = $books[array_rand($books)];
        
        // 3. Pick a random chapter
        $chapters = array_keys($content[$book]);
        $chapter = $chapters[array_rand($chapters)];
        
        // 4. Pick a random verse
        $verses = array_keys($content[$book][$chapter]);
        $verseNum = $verses[array_rand($verses)];
        $verseText = $content[$book][$chapter][$verseNum];

        // 5. Store it so it stays the same for 24h
        $verse = DailyVerse::create([
            'date' => $today,
            'reference' => "{$book} {$chapter}:{$verseNum}",
            'text' => $verseText,
            'version' => $this->getShortName($version)
        ]);

        return response()->json($verse);
    }

    public function versions()
    {
        $files = File::files($this->data_path);
        $versions = [];

        foreach ($files as $file) {
            if ($file->getExtension() === 'json') {
                $name = $file->getFilenameWithoutExtension();
                $versions[] = [
                    'id' => $name,
                    'name' => $name,
                    'short_name' => $this->getShortName($name)
                ];
            }
        }

        return response()->json($versions);
    }

    public function books(Request $request)
    {
        $version = $request->query('version', 'NEW KING JAMES VERSION');
        $path = $this->data_path . '/' . $version . '.json';

        if (!File::exists($path)) {
            return response()->json(['error' => 'Version not found'], 404);
        }

        $content = json_decode(File::get($path), true);
        $books = [];

        foreach ($content as $bookName => $chapters) {
            $books[] = [
                'name' => $bookName,
                'chapters' => count($chapters)
            ];
        }

        return response()->json($books);
    }

    public function chapter(Request $request)
    {
        $version = $request->query('version', 'NEW KING JAMES VERSION');
        $book = $request->query('book', 'Genesis');
        $chapter = $request->query('chapter', '1');

        $path = $this->data_path . '/' . $version . '.json';

        if (!File::exists($path)) {
            return response()->json(['error' => 'Version not found'], 404);
        }

        $content = json_decode(File::get($path), true);

        if (!isset($content[$book])) {
            return response()->json(['error' => 'Book not found'], 404);
        }

        if (!isset($content[$book][$chapter])) {
            return response()->json(['error' => 'Chapter not found'], 404);
        }

        return response()->json([
            'version' => $version,
            'book' => $book,
            'chapter' => $chapter,
            'verses' => $content[$book][$chapter]
        ]);
    }

    protected function getShortName($name)
    {
        $mapping = [
            'NEW KING JAMES VERSION' => 'NKJV',
            'NEW LIVING TRANSLATION' => 'NLT'
        ];

        return $mapping[$name] ?? $name;
    }
}
