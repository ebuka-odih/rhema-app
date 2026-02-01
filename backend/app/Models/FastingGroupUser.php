<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\Pivot;

class FastingGroupUser extends Pivot
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'fasting_group_users';

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
