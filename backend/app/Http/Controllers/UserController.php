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
    public function resend($user_id): JsonResponse
    {
        return UserRegister::resend($user_id);
    }
    public function verify(Request $request, $user_id, $hash)
    {
        return UserRegister::verify($request, $user_id, $hash);
    }
    public function register(Request $request): JsonResponse
    {
        return UserRegister::register($request);
    }
}
