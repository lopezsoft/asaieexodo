<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Modules\Student\StudentEnrollment;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function getEnrollmentList(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentEnrollment::getEnrollmentList($request);
    }

    public function getAcademicHistory(Request $request): array
    {
        return StudentEnrollment::getAcademicHistory($request);
    }
}
