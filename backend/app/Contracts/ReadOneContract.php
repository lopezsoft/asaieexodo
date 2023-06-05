<?php

namespace App\Contracts;

use Illuminate\Http\Request;

interface ReadOneContract
{
    public static function readById(Request $request, $id);
}
