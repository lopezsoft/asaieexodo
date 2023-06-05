<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\School\Schools;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolsController extends Controller
{
    /**
     * @throws \Exception
     */
    public function user(request $request, $id): JsonResponse
    {
        return Schools::user($request, $id);
    }
    public function users(request $request): JsonResponse
    {
        return Schools::users($request);
    }
    public function read(Request $request): JsonResponse
    {
        return Schools::read($request, 0);
    }

    public function update(Request $request, $id): JsonResponse
    {
        return Schools::update($request, $id);
    }
}
