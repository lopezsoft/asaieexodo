<?php

namespace App\Contracts;

use Illuminate\Http\Request;

interface ReadContract
{
    public function read(Request $request): \Illuminate\Http\JsonResponse;
}
