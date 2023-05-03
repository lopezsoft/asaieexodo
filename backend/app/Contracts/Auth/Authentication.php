<?php
namespace App\Contracts\Auth;

use Illuminate\Http\Request;

Interface Authentication {
    public function signup(Request $request);
    public function login(Request $request);
    public function logout(Request $request);
}
