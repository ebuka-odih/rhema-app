<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DailyVerseInteraction extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'daily_verse_id', 'type'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dailyVerse()
    {
        return $this->belongsTo(DailyVerse::class);
    }
}
