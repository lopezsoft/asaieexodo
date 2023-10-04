<?php

namespace App\Http\Controllers;

use App\Modules\Auth\UserData;
use App\Modules\Auth\UserRegister;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function updateAccount(Request $request, $id): JsonResponse
    {
        return UserData::updateAccount($request, $id);
    }
    public function register(Request $request): JsonResponse
    {
        return UserRegister::register($request);
    }
}
