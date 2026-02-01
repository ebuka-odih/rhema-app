<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FastingGroup extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'description',
        'created_by',
        'code',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'fasting_group_users')
            ->using(FastingGroupUser::class)
            ->withPivot('role')
            ->withTimestamps();
    }
}
