<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reflection extends Model
{
    protected $fillable = ['user_id', 'title', 'content', 'category'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
