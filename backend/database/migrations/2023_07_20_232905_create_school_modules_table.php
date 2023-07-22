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
        Schema::create('school_modules', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('school_id')->unsigned();
            $table->bigInteger('system_module_id')->unsigned();
            $table->boolean('is_active')->default(true);
            $table->smallInteger('status')->default(1);
            $table->timestamps();
            $table->foreign('school_id')->references('id')->on('schools');
            $table->foreign('system_module_id')->references('id')->on('system_modules');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_modules');
    }
};
