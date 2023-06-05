<?php

namespace App\Contracts;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

interface UpdateContract
{
    public static function update(Request $request, $id): JsonResponse;
}
