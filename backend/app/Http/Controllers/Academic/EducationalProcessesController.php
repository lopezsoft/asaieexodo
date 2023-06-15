<?php
namespace App\Http\Controllers\Academic;
use App\Http\Controllers\Controller;
use App\Modules\Academic\EducationalProcesses;
use App\Modules\Academic\EducationalProcessesByTeacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class EducationalProcessesController extends Controller
{
    public function getByStudents(Request $request): JsonResponse
    {
        return EducationalProcesses::getByStudents($request);
    }
    public function deleteByStudents(Request $request): JsonResponse
    {
        return EducationalProcesses::deleteByStudents($request);
    }
    public function createForStudent(Request $request): JsonResponse
    {
        return EducationalProcesses::createForStudent($request);
    }
    public function synchronizeByTeacher(Request $request): JsonResponse
    {
        return EducationalProcessesByTeacher::synchronize($request);
    }
    public function getByTeacherLastYear(Request $request): JsonResponse
    {
        return EducationalProcessesByTeacher::getLastYear($request);
    }
    public function deleteByTeacher(Request $request, $id): JsonResponse
    {
        return EducationalProcessesByTeacher::delete($request, $id);
    }
    public function createByTeacher(Request $request): JsonResponse
    {
        return EducationalProcessesByTeacher::create($request);
    }
    public function updateByTeacher(Request $request): JsonResponse
    {
        return EducationalProcessesByTeacher::update($request);
    }
    public function getVerify(Request $request): JsonResponse
    {
        return EducationalProcesses::getVerify($request);
    }
    public function getByTeacher(Request $request): array
    {
        return EducationalProcessesByTeacher::get($request);
    }
}
