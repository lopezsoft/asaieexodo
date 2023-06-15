<?php
namespace App\Http\Controllers\Academic;
use App\Http\Controllers\Controller;
use App\Modules\Academic\AcademicNotes;
use App\Modules\Academic\AcademicNotesTeacher;
use App\Modules\Academic\AcademicPreReport;
use App\Modules\Courses\Courses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class AcademicNotesController extends Controller
{
    public function updatePreReport(Request $request): JsonResponse
    {
        return AcademicPreReport::update($request);
    }
    public function getPreReport(Request $request): JsonResponse
    {
        return AcademicPreReport::get($request);
    }
    public function updateNotesTeacher(Request $request): JsonResponse
    {
        return AcademicNotesTeacher::update($request);
    }
    public function getNotesByCourse(Request $request): JsonResponse
    {
        return AcademicNotes::getNotesByCourse($request);
    }
    public function transferNotes(Request $request): JsonResponse
    {
        return AcademicNotes::transferNotes($request);
    }
    public function addSubjects(Request $request): JsonResponse
    {
        return AcademicNotes::addSubjects($request);
    }
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
