<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prayer extends Model
{
    protected $fillable = ['user_id', 'request', 'time', 'reminder_enabled', 'status'];

    protected $casts = [
        'reminder_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
