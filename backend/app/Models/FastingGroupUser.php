<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FastingGroupUser extends Model
{
    protected $fillable = [
        'fasting_group_id',
        'user_id',
        'role',
    ];

    public function group()
    {
        return $this->belongsTo(FastingGroup::class, 'fasting_group_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
