<?php

namespace App\Http\Controllers\Activities;

use App\Http\Controllers\Controller;
use App\Modules\Activities\OnLineActivities;
use Illuminate\Http\Request;

class OnLineActivitiesController extends Controller
{
    /**
     * @throws \Exception
     */
    public function getActivities(Request $request): \Illuminate\Http\JsonResponse
    {
        return OnLineActivities::getActivities($request);
    }
    /**
     * @throws \Exception
     */
    public function getCourses(Request $request): \Illuminate\Http\JsonResponse
    {
        return OnLineActivities::getCourses($request);
    }
    /**
     * @throws \Exception
     */
    public function getStudentsByCourse(Request $request): \Illuminate\Http\JsonResponse
    {
        return OnLineActivities::getStudentsByCourse($request);
    }
    /**
     * @throws \Exception
     */
    public function createActivity(Request $request): \Illuminate\Http\JsonResponse
    {
        return OnLineActivities::createActivity($request);
    }
    /**
     * @throws \Exception
     */
    public function assignCourseToActivity(Request $request): \Illuminate\Http\JsonResponse
    {
        return OnLineActivities::assignCourseToActivity($request);
    }

    /**
     * @throws \Exception
     */
    public function deleteCourseFromActivity(Request $request): \Illuminate\Http\JsonResponse
    {
        return OnLineActivities::deleteCourseFromActivity($request);
    }
}
