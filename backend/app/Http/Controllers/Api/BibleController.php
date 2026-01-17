<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class BibleController extends Controller
{
    protected $data_path;

    public function __construct()
    {
        $this->data_path = database_path('data');
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
