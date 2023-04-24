<?php

namespace App\Models\School;

use App\Core\CoreModel;
use Illuminate\Support\Str;

/**
 * @method static create(array $array)
 */
class FileManager extends CoreModel
{
    protected $fillable = [
        'school_id', 'user_id', 'file_name', 'extension_file', 'mime_type', 'size_file',
        'last_modified', 'state', 'file_path', 'file_description', 'uuid', 'url'
    ];

    protected static function boot() {
        parent::boot();

        static::creating(function ($fileManager) {
            $fileManager->uuid =  Str::uuid();
        });
    }
}
