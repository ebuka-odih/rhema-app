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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_pro')->default(false)->after('password');
        });

        Schema::table('sermons', function (Blueprint $table) {
            $table->integer('duration_seconds')->default(0)->after('title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_pro');
        });

        Schema::table('sermons', function (Blueprint $table) {
            $table->dropColumn('duration_seconds');
        });
    }
};
