<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BibleBookmark extends Model
{
    protected $fillable = [
        'user_id',
        'version_id',
        'book',
        'chapter',
        'verse',
        'text',
    ];

    protected $casts = [
        'chapter' => 'integer',
        'verse' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
