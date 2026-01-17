<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Verse extends Model
{
    protected $fillable = ['text', 'reference', 'version'];
}
