<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Modules\Student\MoveStudents;
use App\Modules\Student\StudentEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * @throws \Exception
     */
    public function moveStudents(Request $request): JsonResponse
    {
        return MoveStudents::move($request);
    }

    /**
     * @throws \Exception
     */
    public function oldRegistration(Request $request): JsonResponse
    {
        return StudentEnrollment::oldRegistration($request);
    }

    /**
     * @throws \Exception
     */
    public function getEnrollment(Request $request): JsonResponse
    {
        return StudentEnrollment::getEnrollment($request);
    }

    /**
     * @throws \Exception
     */
    public function getEnrollmentList(Request $request): JsonResponse
    {
        return StudentEnrollment::getEnrollmentList($request);
    }

    public function getAcademicHistory(Request $request): array
    {
        return StudentEnrollment::getAcademicHistory($request);
    }
}
