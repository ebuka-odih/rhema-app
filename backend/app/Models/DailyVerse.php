<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DailyVerse extends Model
{
    use HasUuids;
    protected $fillable = ['user_id', 'date', 'reference', 'text', 'version', 'affirmation', 'theme'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
