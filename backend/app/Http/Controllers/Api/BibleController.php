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
    protected $data_path;

    public function __construct()
    {
        $this->data_path = database_path('data');
    }

    protected $curatedEntries = [
        [
            'theme' => 'Faith',
            'reference' => 'Hebrews 11:1',
            'text' => 'Now faith is the substance of things hoped for, the evidence of things not seen.',
            'version' => 'NKJV',
            'affirmation' => 'I walk by faith and not by sight, trusting in God\'s promises for my life.'
        ],
        [
            'theme' => 'Faith',
            'reference' => 'Romans 10:17',
            'text' => 'So then faith comes by hearing, and hearing by the word of God.',
            'version' => 'NKJV',
            'affirmation' => 'My faith is strengthened as I listen to and meditate on the Word of God daily.'
        ],
        [
            'theme' => 'Faith',
            'reference' => 'Matthew 21:22',
            'text' => 'And whatever things you ask in prayer, believing, you will receive.',
            'version' => 'NKJV',
            'affirmation' => 'I believe that whatever I ask in prayer, I shall receive according to God\'s will.'
        ],
        [
            'theme' => 'Faith',
            'reference' => 'Mark 9:23',
            'text' => 'Jesus said to him, "If you can believe, all things are possible to him who believes."',
            'version' => 'NKJV',
            'affirmation' => 'All things are possible for me because I believe in the power of Christ within me.'
        ],
        [
            'theme' => 'Faith',
            'reference' => 'Ephesians 2:8',
            'text' => 'For by grace you have been saved through faith, and that not of yourselves; it is the gift of God.',
            'version' => 'NKJV',
            'affirmation' => 'I am saved by grace through faith; my trust is in God\'s unfailing love and gift.'
        ],
        [
            'theme' => 'Faith',
            'reference' => '2 Corinthians 5:7',
            'text' => 'For we walk by faith, not by sight.',
            'version' => 'NKJV',
            'affirmation' => 'Today, I choose to walk by faith, confident in God\'s guidance even when I cannot see the path.'
        ],
        [
            'theme' => 'Love',
            'reference' => '1 Corinthians 13:4-5',
            'text' => 'Love suffers long and is kind; love does not envy; love does not parade itself, is not puffed up; does not behave rudely, does not seek its own, is not provoked, thinks no evil.',
            'version' => 'NKJV',
            'affirmation' => 'I choose to love others with patience and kindness, reflecting God\'s character in my interactions.'
        ],
        [
            'theme' => 'Love',
            'reference' => '1 John 4:8',
            'text' => 'He who does not love does not know God, for God is love.',
            'version' => 'NKJV',
            'affirmation' => 'I am a child of God, and because God is love, I have the capacity to love others unconditionally.'
        ],
        [
            'theme' => 'Love',
            'reference' => '1 John 4:18',
            'text' => 'There is no fear in love; but perfect love casts out fear, because fear involves torment.',
            'version' => 'NKJV',
            'affirmation' => 'Perfect love casts out all my fears; I am secure in the overwhelming love of God.'
        ],
        [
            'theme' => 'Love',
            'reference' => 'John 13:34',
            'text' => 'A new commandment I give to you, that you love one another; as I have loved you, that you also love one another.',
            'version' => 'NKJV',
            'affirmation' => 'I love others just as Christ has loved me, bringing light and hope to the world.'
        ],
        [
            'theme' => 'Love',
            'reference' => 'Romans 8:38-39',
            'text' => 'For I am persuaded that neither death nor life... shall be able to separate us from the love of God which is in Christ Jesus our Lord.',
            'version' => 'NKJV',
            'affirmation' => 'Nothing can separate me from the love of God which is in Christ Jesus my Lord.'
        ],
        [
            'theme' => 'Love',
            'reference' => '1 Corinthians 16:14',
            'text' => 'Let all that you do be done with love.',
            'version' => 'NKJV',
            'affirmation' => 'Everything I do today will be done in love, for the glory of God.'
        ],
        [
            'theme' => 'Faith',
            'reference' => 'Philippians 4:13',
            'text' => 'I can do all things through Christ who strengthens me.',
            'version' => 'NKJV',
            'affirmation' => 'I am capable of overcoming any challenge because Christ strengthens me from within.'
        ],
        [
            'theme' => 'Love',
            'reference' => 'John 3:16',
            'text' => 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
            'version' => 'NKJV',
            'affirmation' => 'I am deeply loved by God, and through faith in His Son, I have eternal life.'
        ],
        [
            'theme' => 'Faith',
            'reference' => 'James 1:6',
            'text' => 'But let him ask in faith, with no doubting, for he who doubts is like a wave of the sea driven and tossed by the wind.',
            'version' => 'NKJV',
            'affirmation' => 'I ask in faith without wavering, knowing that God is faithful to His Word.'
        ],
        [
            'theme' => 'Love',
            'reference' => 'Colossians 3:14',
            'text' => 'But above all these things put on love, which is the bond of perfection.',
            'version' => 'NKJV',
            'affirmation' => 'I put on love today, which binds everything together in perfect harmony.'
        ],
        [
            'theme' => 'Faith',
            'reference' => 'Proverbs 3:5-6',
            'text' => 'Trust in the LORD with all your heart, And lean not on your own understanding; In all your ways acknowledge Him, And He shall direct your paths.',
            'version' => 'NKJV',
            'affirmation' => 'I trust God with all my heart, knowing He directs my path and makes my way straight.'
        ],
        [
            'theme' => 'Faith',
            'reference' => 'Isaiah 40:31',
            'text' => 'But those who wait on the LORD Shall renew their strength; They shall mount up with wings like eagles, They shall run and not be weary, They shall walk and not faint.',
            'version' => 'NKJV',
            'affirmation' => 'As I wait on the Lord, my strength is renewed and I soar above every challenge.'
        ],
        [
            'theme' => 'Faith',
            'reference' => 'Joshua 1:9',
            'text' => 'Have I not commanded you? Be strong and of good courage; do not be afraid, nor be dismayed, for the LORD your God is with you wherever you go.',
            'version' => 'NKJV',
            'affirmation' => 'I am strong and courageous because God is with me everywhere I go today.'
        ],
        [
            'theme' => 'Faith',
            'reference' => 'Romans 8:28',
            'text' => 'And we know that all things work together for good to those who love God, to those who are the called according to His purpose.',
            'version' => 'NKJV',
            'affirmation' => 'I believe that everything is working together for my good because I love God and follow His purpose.'
        ],
        [
            'theme' => 'Love',
            'reference' => 'Ephesians 3:17-19',
            'text' => '...that you, being rooted and grounded in love, may be able to comprehend... the width and length and depth and height— to know the love of Christ which passes knowledge;',
            'version' => 'NKJV',
            'affirmation' => 'I am rooted and grounded in God\'s love, which is deeper and wider than I can ever imagine.'
        ],
        [
            'theme' => 'Love',
            'reference' => '1 Peter 4:8',
            'text' => 'And above all things have fervent love for one another, for "love will cover a multitude of sins."',
            'version' => 'NKJV',
            'affirmation' => 'I choose to walk in fervent love, extending grace and forgiveness to everyone I meet.'
        ],
        [
            'theme' => 'Love',
            'reference' => '1 John 3:1',
            'text' => 'Behold what manner of love the Father has bestowed on us, that we should be called children of God!',
            'version' => 'NKJV',
            'affirmation' => 'I am a beloved child of God, honored by the Father\'s incredible love for me.'
        ],
        [
            'theme' => 'Love',
            'reference' => 'Zephaniah 3:17',
            'text' => 'The LORD your God in your midst, The Mighty One, will save; He will rejoice over you with gladness, He will quiet you with His love.',
            'version' => 'NKJV',
            'affirmation' => 'God is in my midst, rejoicing over me with singing and quieting my soul with His love.'
        ],
        [
            'theme' => 'Peace',
            'reference' => 'Philippians 4:6-7',
            'text' => 'Be anxious for nothing, but in everything by prayer and supplication... the peace of God, which surpasses all understanding, will guard your hearts and minds through Christ Jesus.',
            'version' => 'NKJV',
            'affirmation' => 'I release all anxiety to God and receive His peace that guards my heart and mind today.'
        ],
        [
            'theme' => 'Peace',
            'reference' => 'John 14:27',
            'text' => 'Peace I leave with you, My peace I give to you; not as the world gives do I give to you. Let not your heart be troubled, neither let it be afraid.',
            'version' => 'NKJV',
            'affirmation' => 'I have the very peace of Jesus within me; I refuse to let my heart be troubled or afraid.'
        ],
        [
            'theme' => 'Strength',
            'reference' => 'Isaiah 41:10',
            'text' => 'Fear not, for I am with you; be not dismayed, for I am your God. I will strengthen you, yes, I will help you, I will uphold you with My righteous right hand.',
            'version' => 'NKJV',
            'affirmation' => 'I am not afraid because God is with me, strengthening me and upholding me with His power.'
        ],
        [
            'theme' => 'Guidance',
            'reference' => 'Psalm 32:8',
            'text' => 'I will instruct you and teach you in the way you should go; I will guide you with My eye.',
            'version' => 'NKJV',
            'affirmation' => 'God is teaching me and guiding me in the best way for my life. I am sensitive to His leading.'
        ],
        [
            'theme' => 'Guidance',
            'reference' => 'Isaiah 30:21',
            'text' => 'Your ears shall hear a word behind you, saying, "This is the way, walk in it," whenever you turn to the right hand or whenever you turn to the left.',
            'version' => 'NKJV',
            'affirmation' => 'I hear the voice of the Spirit clearly, showing me exactly which path to take.'
        ],
        [
            'theme' => 'Provision',
            'reference' => 'Philippians 4:19',
            'text' => 'And my God shall supply all your need according to His riches in glory by Christ Jesus.',
            'version' => 'NKJV',
            'affirmation' => 'All my needs are met according to God\'s unlimited riches. I lack no good thing.'
        ],
        [
            'theme' => 'Provision',
            'reference' => 'Psalm 34:10',
            'text' => 'The young lions lack and suffer hunger; but those who seek the LORD shall not lack any good thing.',
            'version' => 'NKJV',
            'affirmation' => 'Because I seek the Lord, I will never lack the resources or good things I need.'
        ],
        [
            'theme' => 'Healing',
            'reference' => '1 Peter 2:24',
            'text' => '...who Himself bore our sins in His own body on the tree, that we, having died to sins, might live for righteousness—by whose stripes you were healed.',
            'version' => 'NKJV',
            'affirmation' => 'By the stripes of Jesus, I was healed. Health and vitality flow through my body today.'
        ],
        [
            'theme' => 'Healing',
            'reference' => 'Psalm 103:2-3',
            'text' => 'Bless the LORD, O my soul, and forget not all His benefits: Who forgives all your iniquities, Who heals all your diseases.',
            'version' => 'NKJV',
            'affirmation' => 'I celebrate the benefits of God today: my sins are forgiven and my body is healed.'
        ]
    ];

    public function dailyVerse(Request $request)
    {
        try {
            $user = auth('sanctum')->user();
            $userId = $user ? $user->id : null;
            $today = Carbon::today()->toDateString();
            
            // Check if we already have a verse for today for this user
            $verse = DailyVerse::where('date', $today)
                ->where('user_id', $userId)
                ->first();
            
            if ($verse) {
                if ($userId) {
                    $verse->user_liked = $verse->interactions()->where('user_id', $userId)->where('type', 'like')->exists();
                } else {
                    $verse->user_liked = false;
                }
                return response()->json($verse);
            }

            // --- "I SEE YOU" LOGIC ---
            $suggestedTheme = null;
            if ($user && $userId) {
                // Analyze recent prayers and reflections
                $prayers = \App\Models\Prayer::where('user_id', $userId)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->pluck('request')
                    ->join(' ');
                    
                $reflections = \App\Models\Reflection::where('user_id', $userId)
                    ->orderBy('created_at', 'desc')
                    ->limit(3)
                    ->get()
                    ->map(fn($r) => $r->title . ' ' . $r->content)
                    ->join(' ');

                $combinedText = strtolower($prayers . ' ' . $reflections);
                
                // Map keywords to themes
                $themeKeywords = [
                    'Peace' => ['anxiety', 'worried', 'stress', 'fear', 'scared', 'trouble', 'peace', 'calm', 'rest'],
                    'Strength' => ['weak', 'tired', 'weary', 'battle', 'struggle', 'hard', 'difficult', 'overcome', 'strength'],
                    'Guidance' => ['direction', 'choice', 'decision', 'confused', 'way', 'path', 'lead', 'guide', 'future', 'what to do'],
                    'Provision' => ['money', 'finance', 'job', 'need', 'lack', 'bill', 'rent', 'business', 'provide', 'supply'],
                    'Healing' => ['sick', 'pain', 'disease', 'illness', 'body', 'health', 'hospital', 'doctor', 'heal', 'stripe'],
                    'Faith' => ['believe', 'trust', 'doubt', 'faith', 'promise', 'hope'],
                    'Love' => ['relationship', 'lonely', 'marriage', 'friend', 'family', 'love', 'hated', 'rejected']
                ];

                foreach ($themeKeywords as $theme => $keywords) {
                    foreach ($keywords as $keyword) {
                        if (str_contains($combinedText, $keyword)) {
                            $suggestedTheme = $theme;
                            break 2;
                        }
                    }
                }
            }

            // Filter curated entries by theme if found
            $possibleEntries = $suggestedTheme 
                ? array_filter($this->curatedEntries, fn($e) => $e['theme'] === $suggestedTheme)
                : $this->curatedEntries;

            // If no entries for that theme, fallback to all
            if (empty($possibleEntries)) {
                $possibleEntries = $this->curatedEntries;
            }

            // Pick one based on day of year + user id for consistency
            $userSeed = $userId ? (int)abs(crc32((string)$userId)) : 0;
            $dayOfYear = (int)Carbon::today()->dayOfYear;
            $seed = $dayOfYear + $userSeed;
            
            $entriesCount = count($possibleEntries);
            $index = $entriesCount > 0 ? ($seed % $entriesCount) : 0;
            $entry = array_values($possibleEntries)[$index];

            // Define themed background keywords
            $themeImages = [
                'Peace' => 'nature,calm,sunset,ocean',
                'Strength' => 'mountain,mountain-peak,climb,path',
                'Guidance' => 'light,stars,forest,path',
                'Provision' => 'wheat,harvest,sunrise,field',
                'Healing' => 'water,flower,soft-light,garden',
                'Faith' => 'prayer,hands,cross,clouds',
                'Love' => 'family,kids,heart,warmth'
            ];

            $keywords = $themeImages[$entry['theme']] ?? 'landscape,abstract,spiritual';
            $bgImage = "https://source.unsplash.com/featured/800x1100?{$keywords}&sig={$seed}";

            // Store it so it stays the same for 24h for this user
            $verse = DailyVerse::create([
                'user_id' => $userId,
                'date' => $today,
                'reference' => $entry['reference'],
                'text' => $entry['text'],
                'version' => $entry['version'] ?? 'NKJV',
                'affirmation' => $entry['affirmation'],
                'theme' => $entry['theme'],
                'background_image' => $bgImage
            ]);

            $verse->user_liked = false;
            return response()->json($verse);
        } catch (\Exception $e) {
            \Log::error("Error in dailyVerse: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
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
        
        $verse = DailyVerse::where('date', $today)
            ->where('user_id', $userId)
            ->first();

        if (!$verse || !$verse->affirmation) {
            // Create the daily verse if it doesn't exist yet (this will trigger the logic)
            $verseJson = $this->dailyVerse($request);
            $verseData = json_decode($verseJson->getContent(), true);
            
            return response()->json([
                'affirmation' => $verseData['affirmation'] ?? 'I walk in God\'s grace today.',
                'scripture' => $verseData['reference'] ?? '',
                'text' => $verseData['text'] ?? ''
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
