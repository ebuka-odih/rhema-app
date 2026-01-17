<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DevSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Verse::create([
            'text' => 'The Lord is near to all who call upon Him, to all who call upon Him in truth.',
            'reference' => 'Psalms 145:18',
            'version' => 'ESV'
        ]);

        \App\Models\Verse::create([
            'text' => 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
            'reference' => 'John 3:16',
            'version' => 'ESV'
        ]);

        $user = \App\Models\User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        \App\Models\Note::create([
            'user_id' => $user->id,
            'title' => 'Sunday Service: Grace',
            'content' => 'Grace is not just unmerited favor, it is the empowering presence of God...',
        ]);

        \App\Models\Note::create([
            'user_id' => $user->id,
            'title' => 'Morning Devotional',
            'content' => 'Focusing on gratitude today. List of 5 things...',
        ]);
    }
}
