<?php

namespace App\Http\Controllers\Activities;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OnLineEvaluationsController extends Controller
{
    /**
     * @throws \Exception
     */
    public function getEvaluations(Request $request): \Illuminate\Http\JsonResponse
    {
        return \App\Modules\Activities\OnLineEvaluations::getEvaluations($request);
    }

    /**
     * @throws \Exception
     */
    public function createEvaluation(Request $request): \Illuminate\Http\JsonResponse
    {
        return \App\Modules\Activities\OnLineEvaluations::createEvaluation($request);
    }

    /**
     * @throws \Exception
     */
    public function getCourses(Request $request): \Illuminate\Http\JsonResponse
    {
        return \App\Modules\Activities\OnLineEvaluations::getCourses($request);
    }
    /**
     * @throws \Exception
     */
    public function getStudentsByCourse(Request $request): \Illuminate\Http\JsonResponse
    {
        return \App\Modules\Activities\OnLineEvaluations::getStudentsByCourse($request);
    }
    /**
     * @throws \Exception
     */
    public function assignCourseToEvaluation(Request $request): \Illuminate\Http\JsonResponse
    {
        return \App\Modules\Activities\OnLineEvaluations::assignCourseToEvaluation($request);
    }
    /**
     * @throws \Exception
     */
    public function deleteCourseFromEvaluation(Request $request): \Illuminate\Http\JsonResponse
    {
        return \App\Modules\Activities\OnLineEvaluations::deleteCourseFromEvaluation($request);
    }
    /**
     * @throws \Exception
     */
    public function getTotalQuestions(Request $request): \Illuminate\Http\JsonResponse
    {
        return \App\Modules\Activities\OnLineEvaluations::getTotalQuestions($request);
    }

    /**
     * @throws \Exception
     */
    public function getResultEvaluation(Request $request): \Illuminate\Http\JsonResponse
    {
        return \App\Modules\Activities\OnLineEvaluations::getResultEvaluation($request);
    }
}
