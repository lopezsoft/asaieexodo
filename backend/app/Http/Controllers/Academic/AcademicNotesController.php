<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Modules\Academic\AcademicNotes;
use App\Modules\Courses\Courses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicNotesController extends Controller
{
    public function deleteNotes(Request $request, $id): JsonResponse
    {
        return AcademicNotes::deleteNotes($request, $id);
    }
    public function updateNotes(Request $request, $id): JsonResponse
    {
        return AcademicNotes::updateNotes($request, $id);
    }
    public function getNotes(Request $request): JsonResponse
    {
        return AcademicNotes::getNotes($request);
    }
    public function getCoursesByNotes(Request $request): JsonResponse
    {
        return Courses::getCoursesByNotes($request);
    }
}
