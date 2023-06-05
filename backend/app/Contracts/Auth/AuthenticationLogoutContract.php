<?php

namespace App\Contracts\Auth;

use Illuminate\Http\Request;

interface AuthenticationLogoutContract
{
    public function logout(Request $request);
}
