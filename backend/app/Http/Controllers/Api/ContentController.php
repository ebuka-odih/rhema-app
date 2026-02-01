<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\Verse;

class ContentController extends Controller
{
    public function verses()
    {
        return Verse::all();
    }

    public function notes()
    {
        return Note::with('user')->get();
    }
}
