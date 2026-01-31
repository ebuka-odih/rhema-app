<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Models\DailyVerse;
use App\Models\DailyVerseInteraction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BibleController extends Controller
{
    protected $ot_books = [
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", 
        "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", 
        "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", 
        "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zechariah", "Malachi"
    ];

    protected $nt_books = [
        "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", 
        "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", 
        "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
    ];

    public function __construct()
    {
        $this->data_path = database_path('data');
    }

    public function search(Request $request)
    {
        $query = strtolower($request->query('query', ''));
        $version = $request->query('version', 'NEW KING JAMES VERSION');
        $testament = $request->query('testament', 'all'); // all, old, new
        $bookFilter = $request->query('book');
        $limit = $request->query('limit', 50);
        $page = $request->query('page', 1);

        if (strlen($query) < 2 && !$bookFilter) {
            return response()->json(['results' => [], 'total' => 0]);
        }

        $path = $this->data_path . '/' . $version . '.json';
        if (!File::exists($path)) {
            return response()->json(['error' => 'Version not found'], 404);
        }

        $content = json_decode(File::get($path), true);
        $results = [];
        
        $booksToSearch = array_keys($content);
        
        if ($testament === 'old') {
            $booksToSearch = array_intersect($booksToSearch, $this->ot_books);
        } elseif ($testament === 'new') {
            $booksToSearch = array_intersect($booksToSearch, $this->nt_books);
        }

        if ($bookFilter) {
            $booksToSearch = array_intersect($booksToSearch, [$bookFilter]);
        }

        foreach ($booksToSearch as $book) {
            $lowBook = strtolower($book);
            foreach ($content[$book] as $chapter => $verses) {
                foreach ($verses as $verseNum => $text) {
                    $ref = "$book $chapter:$verseNum";
                    $lowRef = strtolower($ref);
                    $lowText = strtolower($text);
                    
                    $score = 0;
                    $matched = false;

                    // 1. Reference matches (Highest priority)
                    if (str_starts_with($lowRef, $query)) {
                        $score += 100;
                        $matched = true;
                    } elseif (str_contains($lowRef, $query)) {
                        $score += 50;
                        $matched = true;
                    }

                    // 2. Text matches
                    if (str_contains($lowText, $query)) {
                        $score += 20;
                        // Boost for whole word matches
                        if (preg_match("/\b" . preg_quote($query, '/') . "\b/i", $text)) {
                            $score += 10;
                        }
                        $matched = true;
                    }

                    if ($matched) {
                        $results[] = [
                            'book' => $book,
                            'chapter' => (int)$chapter,
                            'verse' => (int)$verseNum,
                            'text' => $text,
                            'reference' => $ref,
                            'score' => $score
                        ];
                        
                        if (count($results) >= 1000) break 3; // Hard limit for safety
                    }
                }
            }
        }

        // Sort by score descending
        usort($results, function ($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        $total = count($results);
        $offset = ($page - 1) * $limit;
        $paginatedResults = array_slice($results, $offset, $limit);

        return response()->json([
            'results' => $paginatedResults,
            'total' => $total,
            'page' => (int)$page,
            'limit' => (int)$limit
        ]);
    }

    protected $curatedEntries = [
        ['theme' => 'Faith', 'reference' => 'Hebrews 11:1', 'text' => 'Now faith is the substance of things hoped for, the evidence of things not seen.', 'version' => 'NKJV', 'affirmation' => 'I walk by faith and not by sight, trusting in God\'s promises.'],
        ['theme' => 'Faith', 'reference' => 'Romans 10:17', 'text' => 'So then faith comes by hearing, and hearing by the word of God.', 'version' => 'NKJV', 'affirmation' => 'My faith grows as I immerse myself in the Word of God daily.'],
        ['theme' => 'Faith', 'reference' => 'Matthew 21:22', 'text' => 'And whatever things you ask in prayer, believing, you will receive.', 'version' => 'NKJV', 'affirmation' => 'I pray with confidence, knowing God hears and answers my faith.'],
        ['theme' => 'Healing', 'reference' => 'Psalm 103:2-3', 'text' => 'Bless the LORD, O my soul, and forget not all His benefits: Who forgives all your iniquities, Who heals all your diseases.', 'version' => 'NKJV', 'affirmation' => 'I am blessed; my sins are forgiven and my body is restored by God.'],
        ['theme' => 'Healing', 'reference' => '1 Peter 2:24', 'text' => '...by whose stripes you were healed.', 'version' => 'NKJV', 'affirmation' => 'By the stripes of Jesus, I walk in divine health and wholeness.'],
        ['theme' => 'Healing', 'reference' => 'Jeremiah 17:14', 'text' => 'Heal me, O Lord, and I shall be healed; Save me, and I shall be saved, For You are my praise.', 'version' => 'NKJV', 'affirmation' => 'God is my healer; His saving power restores my strength today.'],
        ['theme' => 'Healing', 'reference' => 'Exodus 15:26', 'text' => '...For I am the Lord who heals you.', 'version' => 'NKJV', 'affirmation' => 'The Lord is my personal healer; His life flows through my body.'],
        ['theme' => 'Healing', 'reference' => 'Psalm 147:3', 'text' => 'He heals the brokenhearted And binds up their wounds.', 'version' => 'NKJV', 'affirmation' => 'God heals my heart and brings peace to my soul.'],
        ['theme' => 'Healing', 'reference' => 'Matthew 8:17', 'text' => 'He Himself took our infirmities And bore our sicknesses.', 'version' => 'NKJV', 'affirmation' => 'Jesus carried my pain so I could live in His freedom and health.'],
        ['theme' => 'Peace', 'reference' => 'Philippians 4:6-7', 'text' => 'Be anxious for nothing... the peace of God will guard your hearts.', 'version' => 'NKJV', 'affirmation' => 'I release my worries and receive God\'s peace that guards my mind.'],
        ['theme' => 'Peace', 'reference' => 'John 14:27', 'text' => 'Peace I leave with you, My peace I give to you...', 'version' => 'NKJV', 'affirmation' => 'I have the peace of Christ; my heart is calm and untroubled.'],
        ['theme' => 'Peace', 'reference' => 'Isaiah 26:3', 'text' => 'You will keep him in perfect peace, Whose mind is stayed on You.', 'version' => 'NKJV', 'affirmation' => 'My mind is fixed on God, and I walk in perfect peace today.'],
        ['theme' => 'Strength', 'reference' => 'Isaiah 41:10', 'text' => 'Fear not, for I am with you... I will strengthen you, Yes, I will help you.', 'version' => 'NKJV', 'affirmation' => 'I am strong and courageous because God is my helper and strength.'],
        ['theme' => 'Strength', 'reference' => 'Philippians 4:13', 'text' => 'I can do all things through Christ who strengthens me.', 'version' => 'NKJV', 'affirmation' => 'There is no task too great for me, for Christ empowers me.'],
        ['theme' => 'Provision', 'reference' => 'Philippians 4:19', 'text' => 'And my God shall supply all your need according to His riches in glory.', 'version' => 'NKJV', 'affirmation' => 'All my needs are met by God\'s abundant and unlimited riches.'],
        ['theme' => 'Love', 'reference' => '1 John 4:19', 'text' => 'We love Him because He first loved us.', 'version' => 'NKJV', 'affirmation' => 'I am deeply loved by God, and I share that love with everyone.'],
        ['theme' => 'Love', 'reference' => 'John 15:13', 'text' => 'Greater love has no one than this, than to lay down one’s life for his friends.', 'version' => 'NKJV', 'affirmation' => 'I walk in the selfless, sacrificial love of Christ.'],
        ['theme' => 'Guidance', 'reference' => 'Proverbs 3:5-6', 'text' => 'Trust in the Lord with all your heart... He shall direct your paths.', 'version' => 'NKJV', 'affirmation' => 'God leads my steps; I trust His wisdom more than my own.'],
    ];

    public function dailyVerse(Request $request)
    {
        try {
            $user = auth('sanctum')->user();
            $userId = $user ? $user->id : null;
            $today = $request->query('date') ?: Carbon::today()->toDateString();
            
            // 1. Return existing if already generated for today
            $verse = DailyVerse::where('date', $today)
                ->where('user_id', $userId)
                ->first();
            
            if ($verse) {
                // Fix broken images on the fly
                if (!$verse->background_image || str_contains($verse->background_image, 'source.unsplash.com')) {
                    $verse->background_image = $this->generateBackgroundImage($verse->theme, $today, $userId);
                    $verse->save();
                }

                $verse->user_liked = $userId ? $verse->interactions()->where('user_id', $userId)->where('type', 'like')->exists() : false;
                return response()->json($verse);
            }

            // 2. Identify Theme (I See You Logic)
            $suggestedTheme = $this->detectTheme($userId);

            // 3. Selection Logic (Rotation-friendly)
            $possibleEntries = array_filter($this->curatedEntries, fn($e) => !$suggestedTheme || $e['theme'] === $suggestedTheme);
            if (empty($possibleEntries)) $possibleEntries = $this->curatedEntries;

            $seed = abs(crc32($today . ($userId ?: 'guest')));
            $index = $seed % count($possibleEntries);
            $entry = array_values($possibleEntries)[$index];

            // 4. Create and Return
            $verse = DailyVerse::create([
                'user_id' => $userId,
                'date' => $today,
                'reference' => $entry['reference'],
                'text' => $entry['text'],
                'version' => $entry['version'] ?? 'NKJV',
                'affirmation' => $entry['affirmation'],
                'theme' => $entry['theme'],
                'background_image' => $this->generateBackgroundImage($entry['theme'], $today, $userId)
            ]);
            
            $verse->user_liked = false;
            return response()->json($verse);

        } catch (\Exception $e) {
            \Log::error("dailyVerse Error: " . $e->getMessage());
            return response()->json(['error' => 'Sync failed: ' . $e->getMessage()], 500);
        }
    }

    protected function detectTheme($userId)
    {
        if (!$userId) return null;

        $combinedText = strtolower(
            \App\Models\Prayer::where('user_id', $userId)->orderBy('created_at', 'desc')->limit(5)->pluck('request')->join(' ') . ' ' .
            \App\Models\Reflection::where('user_id', $userId)->orderBy('created_at', 'desc')->limit(3)->get()->map(fn($r) => $r->title . ' ' . $r->content)->join(' ')
        );

        $keywords = [
            'Peace' => ['anxiety', 'worried', 'stress', 'fear', 'scared', 'trouble', 'peace', 'calm', 'rest'],
            'Strength' => ['weak', 'tired', 'weary', 'battle', 'struggle', 'hard', 'difficult', 'overcome', 'strength'],
            'Guidance' => ['direction', 'choice', 'decision', 'confused', 'way', 'path', 'lead', 'guide', 'future', 'what to do'],
            'Provision' => ['money', 'finance', 'job', 'need', 'lack', 'bill', 'rent', 'business', 'provide', 'supply'],
            'Healing' => ['sick', 'pain', 'disease', 'illness', 'body', 'health', 'hospital', 'doctor', 'heal', 'stripe'],
            'Faith' => ['believe', 'trust', 'doubt', 'faith', 'promise', 'hope'],
            'Love' => ['relationship', 'lonely', 'marriage', 'friend', 'family', 'love', 'hated', 'rejected']
        ];

        foreach ($keywords as $theme => $list) {
            foreach ($list as $word) if (str_contains($combinedText, $word)) return $theme;
        }
        return null;
    }

    protected function generateBackgroundImage($theme, $date, $userId)
    {
        $themeImages = [
            'Peace' => ['1501854140801-50d01698950b', '1499346030926-f4f4daac6ce5', '1470252649378-9c29740c9fa8'],
            'Strength' => ['1464822759023-fed622ff2c3b', '1448375240586-dfd8d395ea6c', '1506905911220-21f8e025812b'],
            'Guidance' => ['1441974231531-c6227db76b6e', '1471922638179-380be51719a4', '1501854140801-50d01698950b'],
            'Provision' => ['1500382017468-9049fed747ef', '1470071459604-3b5ec3a7fe05', '1472214103451-9374bd1c798e'],
            'Healing' => ['1505118380757-91f5f5631fc0', '1469474968028-56623f02e42e', '1518495973542-4542c06a5843'],
            'Faith' => ['1439405326854-01517489c73b', '1501854140801-50d01698950b', '1519681393784-d120267933ba'],
            'Love' => ['1518131149504-115eab4eca3a', '1476514525535-07fb3b4ae5f1', '1431733303041-1c39c85b42d4']
        ];
        
        $ids = $themeImages[$theme] ?? $themeImages['Faith'];
        $seed = abs(crc32($date . $userId));
        $id = $ids[$seed % count($ids)];
        
        return "https://images.unsplash.com/photo-{$id}?auto=format&fit=crop&w=800&q=80";
    }

    public function interact(Request $request)
    {
        $request->validate([
            'daily_verse_id' => 'required|uuid|exists:daily_verses,id',
            'type' => 'required|in:like,share,download'
        ]);

        $user = auth('sanctum')->user();
        $userId = $user ? $user->id : null;
        
        if (!$userId) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $type = $request->type;
        $verseId = $request->daily_verse_id;

        try {
            return DB::transaction(function () use ($userId, $verseId, $type) {
                $interaction = DailyVerseInteraction::where('user_id', $userId)
                    ->where('daily_verse_id', $verseId)
                    ->where('type', $type)
                    ->first();

                $verse = DailyVerse::findOrFail($verseId);

                if ($type === 'like') {
                    if ($interaction) {
                        $interaction->delete();
                        $verse->decrement('likes_count');
                        $liked = false;
                    } else {
                        DailyVerseInteraction::create([
                            'user_id' => $userId,
                            'daily_verse_id' => $verseId,
                            'type' => 'like'
                        ]);
                        $verse->increment('likes_count');
                        $liked = true;
                    }
                    return response()->json([
                        'likes_count' => $verse->likes_count,
                        'user_liked' => $liked
                    ]);
                } else {
                    // For share/download, we just record it and increment
                    DailyVerseInteraction::create([
                        'user_id' => $userId,
                        'daily_verse_id' => $verseId,
                        'type' => $type
                    ]);
                    
                    $column = $type . 's_count'; // shares_count or downloads_count
                    $verse->increment($column);
                    
                    return response()->json([
                        $column => $verse->$column
                    ]);
                }
            });
        } catch (\Exception $e) {
            \Log::error("Interaction error: " . $e->getMessage());
            return response()->json(['error' => 'Failed to process interaction'], 500);
        }
    }

    public function dailyAffirmation(Request $request)
    {
        $user = auth('sanctum')->user();
        $userId = $user ? $user->id : null;
        $today = Carbon::today()->toDateString();
        
        // Always try to get or create the daily verse first to ensure sync
        $verseResponse = $this->dailyVerse($request);
        $verse = json_decode($verseResponse->getContent());

        if (isset($verse->error)) {
            return response()->json([
                'affirmation' => 'I walk in God\'s grace today.',
                'scripture' => 'Psalm 23:1',
                'text' => 'The Lord is my shepherd; I shall not want.'
            ]);
        }
        
        return response()->json([
            'affirmation' => $verse->affirmation,
            'scripture' => $verse->reference,
            'text' => $verse->text
        ]);
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
