<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FastingGroup extends Model
{
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
            ->withPivot('role')
            ->withTimestamps();
    }
}
