<?php

namespace App\Contracts;

use Illuminate\Http\Request;

interface FileManageContract
{
    public static function uploadFile(Request $request): \Illuminate\Http\JsonResponse;
    public static function getFiles(Request $request): \Illuminate\Http\JsonResponse;
}
