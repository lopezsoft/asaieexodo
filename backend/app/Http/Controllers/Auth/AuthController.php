<?php
namespace App\Http\Controllers\Auth;
use App\Contracts\Auth\Authentication;
use App\Contracts\Auth\ProcessAuthorization;
use App\Http\Controllers\Controller;
use App\Modules\Auth\UsersAccess;
use Illuminate\Http\Request;

class AuthController extends Controller implements Authentication
{
    public function signup(Request $request)
    {
        return ProcessAuthorization::signup($request, new UsersAccess());
    }
    public function login(Request $request)
    {
        return ProcessAuthorization::login($request, new UsersAccess());
    }
    public function logout(Request $request)
    {
        return ProcessAuthorization::logout($request, new UsersAccess());
    }


}
