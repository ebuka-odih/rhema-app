<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyVerse extends Model
{
    protected $fillable = ['date', 'reference', 'text', 'version'];
}
