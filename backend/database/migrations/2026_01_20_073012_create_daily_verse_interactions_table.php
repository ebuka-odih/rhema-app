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
        Schema::create('daily_verse_interactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->uuid('daily_verse_id');
            $table->enum('type', ['like', 'share', 'download']);
            $table->timestamps();

            $table->foreign('daily_verse_id')->references('id')->on('daily_verses')->onDelete('cascade');
            $table->unique(['user_id', 'daily_verse_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_verse_interactions');
    }
};
