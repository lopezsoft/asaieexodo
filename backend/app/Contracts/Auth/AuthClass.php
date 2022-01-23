<?php
namespace App\Contracts\Auth;

use Illuminate\Http\Request;

class AuthClass
{

    public static function login(Request $request, AuthInterface $auth) {
        return $auth->login($request);
    }

    public static function logout(Request $request, AuthInterface $auth) {
        return $auth->logout($request);
    }

}
