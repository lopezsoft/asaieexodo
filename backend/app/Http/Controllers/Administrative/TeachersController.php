<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Modules\Administrative\Teachers;
use Illuminate\Http\Request;

class TeachersController extends Controller
{
    public function getByYear(Request $request): \Illuminate\Http\JsonResponse
    {
        return Teachers::getByYear($request);
    }
}
