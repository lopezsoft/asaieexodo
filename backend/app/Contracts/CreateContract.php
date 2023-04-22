<?php

namespace App\Contracts;

use Illuminate\Http\Request;

interface CreateContract
{
    public function create(Request $request): \Illuminate\Http\JsonResponse;
}
