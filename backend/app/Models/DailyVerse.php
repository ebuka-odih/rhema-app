<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DailyVerse extends Model
{
    use HasUuids;
    protected $fillable = ['date', 'reference', 'text', 'version'];
}
