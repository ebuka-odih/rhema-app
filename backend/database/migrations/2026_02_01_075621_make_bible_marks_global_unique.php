<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Deduplicate Bookmarks
        $this->deduplicate('bible_bookmarks');

        Schema::table('bible_bookmarks', function (Blueprint $table) {
            // Drop old unique constraint
            // Note: In Laravel/MySQL, the name is usually table_column1_column2_unique
            $table->dropUnique(['user_id', 'version_id', 'book', 'chapter', 'verse']);
            
            // Add new global unique constraint
            $table->unique(['user_id', 'book', 'chapter', 'verse'], 'user_verse_bookmark_global_unique');
        });

        // 2. Deduplicate Highlights
        $this->deduplicate('bible_highlights');

        Schema::table('bible_highlights', function (Blueprint $table) {
            // Drop old unique constraint (this one has a custom name)
            $table->dropUnique('user_verse_highlight_unique');
            
            // Add new global unique constraint
            $table->unique(['user_id', 'book', 'chapter', 'verse'], 'user_verse_highlight_global_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bible_bookmarks', function (Blueprint $table) {
            $table->dropUnique('user_verse_bookmark_global_unique');
            $table->unique(['user_id', 'version_id', 'book', 'chapter', 'verse']);
        });

        Schema::table('bible_highlights', function (Blueprint $table) {
            $table->dropUnique('user_verse_highlight_global_unique');
            $table->unique(['user_id', 'version_id', 'book', 'chapter', 'verse'], 'user_verse_highlight_unique');
        });
    }

    private function deduplicate(string $tableName): void
    {
        // Keep the latest record for each (user, book, chapter, verse) combo
        $duplicates = DB::table($tableName)
            ->select('user_id', 'book', 'chapter', 'verse', DB::raw('MAX(created_at) as latest'))
            ->groupBy('user_id', 'book', 'chapter', 'verse')
            ->having(DB::raw('COUNT(*)'), '>', 1)
            ->get();

        foreach ($duplicates as $dup) {
            // Delete all but the latest
            DB::table($tableName)
                ->where('user_id', $dup->user_id)
                ->where('book', $dup->book)
                ->where('chapter', $dup->chapter)
                ->where('verse', $dup->verse)
                ->where('created_at', '<', $dup->latest)
                ->delete();
        }
    }
};
