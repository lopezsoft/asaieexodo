<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\School\Schools;
use Illuminate\Http\Request;

class SchoolsController extends Controller
{
    public function user(request $request, $id): \Illuminate\Http\JsonResponse
    {
        return Schools::user($request, $id);
    }
    public function users(request $request): \Illuminate\Http\JsonResponse
    {
        return Schools::users($request);
    }
    public function read(Request $request): \Illuminate\Http\JsonResponse
    {
        return Schools::read($request, 0);
    }

    public function update(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        return Schools::update($request, $id);
    }
}
