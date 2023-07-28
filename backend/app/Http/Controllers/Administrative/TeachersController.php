<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Modules\Administrative\Teachers;
use App\Modules\Courses\Courses;
use App\Modules\Settings\ColumnNotes;
use App\Modules\Teacher\CoursesOfTeacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeachersController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return Teachers::index($request);
    }
    /**
     * @throws \Exception
     */
    public function setColumnNotes(Request $request): JsonResponse
    {
        return ColumnNotes::setColumnNotes($request);
    }
    public function getColumnNotes(Request $request): JsonResponse
    {
        return ColumnNotes::getByCourse($request);
    }
    /**
     * @throws \Exception
     */
    public function getGroupedCourses(Request $request): array
    {
        return CoursesOfTeacher::getGroupedCourses($request);
    }
    /**
     * @throws \Exception
     */
    public function getCourses(Request $request): array
    {
        return Courses::getCoursesOfTeacher($request);
    }
    public function getByYear(Request $request): JsonResponse
    {
        return Teachers::getByYear($request);
    }
}
