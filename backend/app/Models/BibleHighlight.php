<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BibleHighlight extends Model
{
    protected $fillable = [
        'user_id',
        'version_id',
        'book',
        'chapter',
        'verse',
        'color',
        'note',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
