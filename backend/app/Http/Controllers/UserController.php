<?php

namespace App\Http\Controllers;

use App\Modules\Auth\UserRegister;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function resend($user_id): \Illuminate\Http\JsonResponse
    {
        return UserRegister::resend($user_id);
    }
    public function verify(Request $request, $user_id, $hash): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        return UserRegister::verify($request, $user_id, $hash);
    }
    public function register(Request $request): \Illuminate\Http\JsonResponse
    {
        return UserRegister::register($request);
    }
}
