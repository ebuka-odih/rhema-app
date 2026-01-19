<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BibleHighlight extends Model
{
    use HasUuids;
    protected $fillable = [
        'user_id',
        'version_id',
        'book',
        'chapter',
        'verse',
        'color',
        'note',
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
