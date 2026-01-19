<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bible_highlights', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->string('version_id');
            $table->string('book');
            $table->integer('chapter');
            $table->integer('verse');
            $table->string('color'); // Hex color code
            $table->string('note')->nullable(); // Optional note for bookmarks
            $table->timestamps();

            // Ensure a user can only have one highlight per verse per version
            $table->unique(['user_id', 'version_id', 'book', 'chapter', 'verse'], 'user_verse_highlight_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bible_highlights');
    }
};
