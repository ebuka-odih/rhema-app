<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Sermon extends Model
{
    use HasUuids;
    protected $fillable = ['user_id', 'title', 'duration_seconds', 'audio_path', 'transcription', 'summary'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
