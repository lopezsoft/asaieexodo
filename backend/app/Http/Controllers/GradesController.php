<?php

namespace App\Http\Controllers;

use App\Modules\Grades\GradesQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradesController extends Controller
{
    public function getAuxiliaryGradesGrouped(Request $request): JsonResponse
    {
        return GradesQuery::getAuxiliaryGradesGrouped($request);
    }
    /**
     * @throws \Exception
     */
    public function getPeriods(Request $request): JsonResponse
    {
        return GradesQuery::getPeriods($request);
    }
    /**
     * @throws \Exception
     */
    public function getGroups(Request $request): JsonResponse
    {
        return GradesQuery::getGroups($request);
    }
    /**
     * @throws \Exception
     */
    public function getGrades(Request $request): JsonResponse
    {
        return GradesQuery::getSelectGrades($request);
    }
}
