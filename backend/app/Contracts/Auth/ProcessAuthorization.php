<?php
namespace App\Contracts\Auth;

use Illuminate\Http\Request;

class ProcessAuthorization
{

    public static function signup(Request $request, Authentication $auth) {
        return $auth->signup($request);
    }

    public static function signupActivate($token, Authentication $auth) {
        return $auth->signupActivate($token);
    }

    public static function login(Request $request, Authentication $auth) {
        return $auth->login($request);
    }

    public static function logout(Request $request, Authentication $auth) {
        return $auth->logout($request);
    }

}
