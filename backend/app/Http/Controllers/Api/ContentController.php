<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Verse;
use App\Models\Note;

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
