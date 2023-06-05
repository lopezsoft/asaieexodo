<?php

namespace App\Contracts\Auth;

use Illuminate\Http\Request;

interface AuthenticationRegisterContract
{
    public function register(Request $request);
}
