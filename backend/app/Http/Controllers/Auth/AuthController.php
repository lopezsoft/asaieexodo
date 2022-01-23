<?php
namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Contracts\Auth\AuthUser;
use App\Contracts\Auth\AuthClass;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    public function userLogin(Request $request)
    {
        return AuthClass::login($request, new AuthUser());
    }

    public function userLogout(Request $request)
    {
        return AuthClass::logout($request, new AuthUser());
    }


    public function username()
    {
        return 'user_name';
    }
}
