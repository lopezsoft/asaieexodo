<?php

namespace App\Http\Controllers;

use App\Modules\Courses\Courses;
use Illuminate\Http\Request;

class CoursesController extends Controller
{
    public function getCourses(Request $request): array
    {
        return Courses::getCourses($request);
    }

    public function getSubjectsByYear(Request $request): \Illuminate\Http\JsonResponse
    {
        return Courses::getSubjectsByYear($request);
    }

    public function getSubjectsByCourses(Request $request): array
    {
        return Courses::getSubjectsByCourses($request);
    }
}
