<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Verse extends Model
{
    use HasUuids;

    protected $fillable = ['text', 'reference', 'version'];
}
