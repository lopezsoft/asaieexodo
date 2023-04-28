<?php

namespace App\Processors;

use App\Contracts\CreateContract;
use App\Contracts\ReadContract;
use Illuminate\Http\Request;

class CrudProcessor
{
    public static function create(Request $request, CreateContract $class): \Illuminate\Http\JsonResponse
    {
        return $class->create($request);
    }

    public static function read(Request $request, ReadContract $class): \Illuminate\Http\JsonResponse
    {
        return $class->read($request);
    }
}
