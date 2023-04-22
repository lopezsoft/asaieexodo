<?php

namespace App\Contracts;

use Illuminate\Http\Request;

interface FileManagerContract
{
    public static function get(Request $request): \Illuminate\Http\JsonResponse;
    public static function upload(Request $request): \Illuminate\Http\JsonResponse;
    public static function delete(Request $request, $id): \Illuminate\Http\JsonResponse;
}
