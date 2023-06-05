<?php

namespace App\Contracts;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

interface DeleteContract
{
    public static function delete(Request $request, $id): JsonResponse;
}
