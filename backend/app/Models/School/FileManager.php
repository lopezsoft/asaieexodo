<?php

namespace App\Models\School;

use App\Core\CoreModel;

/**
 * @method static create(array $array)
 */
class FileManager extends CoreModel
{
    protected $fillable = [
        'school_id', 'user_id', 'file_name', 'extension_file', 'mime_type', 'size_file', 'last_modified', 'state', 'file_path'
    ];
}
