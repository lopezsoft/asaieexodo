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
        Schema::create('watermark_files', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->bigInteger('school_id')->unsigned();
            $table->string('file_name',255);
            $table->string('file_description',255);
            $table->string('file_path',255);
            $table->string('url',255);
            $table->string('extension_file',10);
            $table->string('mime_type',120);
            $table->string('size_file',30);
            $table->dateTime('last_modified');
            $table->smallInteger('state')->default(1);
            $table->json('metadata');
            $table->json('settings');
            $table->timestamps();
            $table->foreign('school_id')->references('id')->on('schools');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('watermark_files');
    }
};
