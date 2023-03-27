<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Modules\Student\MoveStudents;
use App\Modules\Student\StudentEnrollment;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function moveStudents(Request $request): \Illuminate\Http\JsonResponse
    {
        return MoveStudents::move($request);
    }

    /**
     * @throws \Exception
     */
    public function oldRegistration(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentEnrollment::oldRegistration($request);
    }

    /**
     * @throws \Exception
     */
    public function getEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentEnrollment::getEnrollment($request);
    }
    public function getEnrollmentList(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentEnrollment::getEnrollmentList($request);
    }

    public function getAcademicHistory(Request $request): array
    {
        return StudentEnrollment::getAcademicHistory($request);
    }
}
