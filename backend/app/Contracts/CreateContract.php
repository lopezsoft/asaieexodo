<?php

namespace App\Contracts;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

interface CreateContract
{
    public function create(Request $request): JsonResponse;
}
