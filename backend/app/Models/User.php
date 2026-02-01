<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'is_pro',
        'settings',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_pro' => 'boolean',
            'settings' => 'array',
        ];
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function sermons()
    {
        return $this->hasMany(Sermon::class);
    }

    public function reflections()
    {
        return $this->hasMany(Reflection::class);
    }

    public function prayers()
    {
        return $this->hasMany(Prayer::class);
    }

    public function bibleHighlights()
    {
        return $this->hasMany(BibleHighlight::class);
    }

    public function bibleBookmarks()
    {
        return $this->hasMany(BibleBookmark::class);
    }

    public function fastingSessions()
    {
        return $this->hasMany(FastingSession::class);
    }

    public function fastingGroups()
    {
        return $this->belongsToMany(FastingGroup::class, 'fasting_group_users')
            ->using(FastingGroupUser::class)
            ->withPivot('role')
            ->withTimestamps();
    }
}
