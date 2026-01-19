<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@wordflow.com',
            'password' => 'Password123!',
            'is_pro' => true,
        ]);

        User::factory()->create([
            'name' => 'Apple Reviewer',
            'email' => 'reviewer@wordflow.com',
            'password' => 'Rhema2026!',
            'is_pro' => true,
        ]);
    }
}
