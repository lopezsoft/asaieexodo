<?php

namespace App\Processors;

use App\Contracts\FileManagerContract;
use App\Contracts\FileManagerProcessorContract;
use Illuminate\Http\Request;

class FileManagerProcessor implements FileManagerProcessorContract
{
    public static function upload(Request $request, FileManagerContract $object): \Illuminate\Http\JsonResponse
    {
        return $object::upload($request);
    }
    public static function get(Request $request, FileManagerContract $object): \Illuminate\Http\JsonResponse
    {
        return $object::get($request);
    }
    public static function delete(Request $request, FileManagerContract $object, $id): \Illuminate\Http\JsonResponse
    {
        return $object::delete($request, $id);
    }
}
