<?php

namespace App\Contracts;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

interface ReadContract
{
    public function read(Request $request): JsonResponse;
}
