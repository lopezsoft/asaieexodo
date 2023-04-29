<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Modules\Academic\AcademicNotes;
use App\Modules\Courses\Courses;
use Illuminate\Http\Request;

class AcademicNotesController extends Controller
{
    public function getCoursesByNotes(Request $request): \Illuminate\Http\JsonResponse
    {
        return Courses::getCoursesByNotes($request);
    }
}
