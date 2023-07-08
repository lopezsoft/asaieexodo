<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Academic\AcademicLevelingPeriod;
class AcademicLevelingController extends Controller
{
    public function updatePeriod(Request $request): JsonResponse
    {
        return AcademicLevelingPeriod::update($request);
    }
    public function getByTeacherPeriod(Request $request): JsonResponse
    {
        return AcademicLevelingPeriod::getByTeacher($request);
    }
}
