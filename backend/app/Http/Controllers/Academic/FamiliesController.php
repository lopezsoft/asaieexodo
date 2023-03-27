<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Modules\Student\Families;
use Illuminate\Http\Request;

class FamiliesController extends Controller
{
    public function getFamiliesStudent(Request $request): \Illuminate\Http\JsonResponse
    {
        return Families::getFamiliesStudent($request);
    }
}
