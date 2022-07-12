<?php

namespace App\Http\Controllers\Administrative;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Administrative\Schools;

class SchoolsController extends Controller
{
    function read(Request $request){
        return Schools::read($request, 0);
    }

    function update(Request $request, $id)
    {
        return Schools::update($request, $id);
    }
}
