<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FastingSession extends Model
{
    use HasUuids;
    protected $fillable = [
        'user_id',
        'duration_hours',
        'start_time',
        'end_time',
        'recommend_verses',
        'reminder_interval',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'recommend_verses' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
