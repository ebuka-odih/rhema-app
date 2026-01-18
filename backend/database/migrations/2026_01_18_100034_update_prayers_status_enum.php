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
        // Update existing data first
        Schema::table('prayers', function (Blueprint $table) {
            $table->string('status')->default('praying')->change();
        });

        DB::table('prayers')->where('status', 'answered')->update(['status' => 'prayed']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('prayers')->where('status', 'prayed')->update(['status' => 'answered']);

        Schema::table('prayers', function (Blueprint $table) {
            $table->enum('status', ['praying', 'answered'])->default('praying')->change();
        });
    }
};
