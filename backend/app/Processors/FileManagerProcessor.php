<?php

namespace App\Processors;

use App\Contracts\FileManagerContract;
use App\Contracts\FileManagerProcessorContract;
use App\Enums\ProfileFileManagerEnum;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FileManagerProcessor implements FileManagerProcessorContract
{
    /**
     * @throws \Exception
     */
    public static function upload(Request $request, FileManagerContract $object): JsonResponse
    {
        $fileProfile    = $request->input('fileProfile') ?? 'School';
        $profileEnum    = ProfileFileManagerEnum::getProfile($fileProfile);
        $path           = Str::lower($profileEnum)."/".$request->input('belongToId')."/documents";
        return $object::upload($request, $path);
    }
    public static function get(Request $request, FileManagerContract $object): JsonResponse
    {
        return $object::get($request);
    }
    public static function delete(Request $request, FileManagerContract $object, mixed $id): JsonResponse
    {
        return $object::delete($request, $id);
    }
}
