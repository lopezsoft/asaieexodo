<?php

namespace App\Http\Controllers;

use App\Modules\Grades\GradesQuery;
use Illuminate\Http\Request;

class GradesController extends Controller
{
    public function getGroups(Request $request): \Illuminate\Http\JsonResponse
    {
        return GradesQuery::getGroups($request);
    }

    public function getGrades(Request $request): \Illuminate\Http\JsonResponse
    {
        return GradesQuery::getSelectGrades($request);
    }
}
