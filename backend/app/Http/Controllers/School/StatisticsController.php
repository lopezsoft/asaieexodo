<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Modules\School\Statistics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    public function getTeachersByYear(Request $request): JsonResponse
    {
        return Statistics::getTeachersByYear($request);
    }
    public function getRetiredByYear(Request $request): JsonResponse
    {
        return Statistics::getRetiredByYear($request);
    }
    public function getRegisteredByYear(Request $request): JsonResponse
    {
        return Statistics::getRegisteredByYear($request);
    }
    public function getStudentsEnrolled(Request $request): JsonResponse
    {
        return Statistics::getStudentsEnrolled($request);
    }
}
