<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sermon extends Model
{
    protected $fillable = ['user_id', 'title', 'duration_seconds', 'audio_path', 'transcription', 'summary'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
