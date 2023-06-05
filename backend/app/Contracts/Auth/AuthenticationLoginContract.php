<?php

namespace App\Contracts\Auth;

use Illuminate\Http\Request;

interface AuthenticationLoginContract
{
    public function login(Request $request);
}
