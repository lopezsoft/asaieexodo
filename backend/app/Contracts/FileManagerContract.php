<?php

namespace App\Contracts;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

interface FileManagerContract
{
    public static function get(Request $request): JsonResponse;
    public static function upload(Request $request,string $path, string $disk = 's3'): JsonResponse;
    public static function delete(Request $request, mixed $id): JsonResponse;
}
