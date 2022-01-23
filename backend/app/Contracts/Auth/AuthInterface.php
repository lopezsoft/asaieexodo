<?php
namespace App\Contracts\Auth;

use Illuminate\Http\Request;

Interface AuthInterface {
    function login(Request $request);
    function logout(Request $request);
}
