<?php

namespace App\Http\Controllers;

use App\Models\Master;
use Illuminate\Http\Request;

class MasterController extends Controller
{

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        return Master::read($request, null);
    }

}
