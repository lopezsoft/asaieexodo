<?php

namespace App\Processors;

use App\Contracts\FileManageContract;
use Illuminate\Http\Request;

class FileManagerProcessor
{
    public static function uploadFile(Request $request, FileManageContract $object): \Illuminate\Http\JsonResponse
    {
        return $object::uploadFile($request);
    }
    public static function getFiles(Request $request, FileManageContract $object): \Illuminate\Http\JsonResponse
    {
        return $object::getFiles($request);
    }
}
