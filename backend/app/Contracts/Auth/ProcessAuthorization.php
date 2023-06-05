<?php
namespace App\Contracts\Auth;

use Illuminate\Http\Request;

class ProcessAuthorization
{

    public static function register(Request $request, AuthenticationRegisterContract $auth) {
        return $auth->register($request);
    }

    public static function login(Request $request, Authentication $auth) {
        return $auth->login($request);
    }

    public static function logout(Request $request, Authentication $auth) {
        return $auth->logout($request);
    }

}
