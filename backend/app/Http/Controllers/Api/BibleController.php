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

    public function dailyAffirmation()
    {
        $today = Carbon::today()->toDateString();
        
        // This is a placeholder. You could also store affirmations in a table
        // or generate them using AI on the fly.
        $affirmations = [
            [
                'affirmation' => 'I am strong and courageous because the Lord my God is with me.',
                'scripture' => 'Joshua 1:9',
                'text' => 'Have I not commanded you? Be strong and of good courage; do not be afraid, nor be dismayed, for the LORD your God is with you wherever you go.'
            ],
            [
                'affirmation' => 'I have peace that surpasses all understanding.',
                'scripture' => 'Philippians 4:7',
                'text' => 'and the peace of God, which surpasses all understanding, will guard your hearts and minds through Christ Jesus.'
            ],
            [
                'affirmation' => 'I can do all things through Christ who strengthens me.',
                'scripture' => 'Philippians 4:13',
                'text' => 'I can do all things through Christ who strengthens me.'
            ],
            [
                'affirmation' => 'I am a new creation in Christ; the old is gone, the new has come.',
                'scripture' => '2 Corinthians 5:17',
                'text' => 'Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new.'
            ],
            [
                'affirmation' => 'God has not given me a spirit of fear, but of power, love, and a sound mind.',
                'scripture' => '2 Timothy 1:7',
                'text' => 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.'
            ]
        ];

        // Pick one based on the day (consistent for 24h)
        $dayOfYear = Carbon::parse($today)->dayOfYear;
        $index = $dayOfYear % count($affirmations);
        
        return response()->json($affirmations[$index]);
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
