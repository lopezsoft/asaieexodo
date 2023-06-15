<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Modules\Academic\AcademicObservations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicObservationsController extends Controller
{
    public function deleteByStudents(Request $request): JsonResponse
    {
        return AcademicObservations::deleteByStudents($request);
    }
    public function createForStudent(Request $request): JsonResponse
    {
        return AcademicObservations::createForStudent($request);
    }
    public function getByStudents(Request $request): JsonResponse
    {
        return AcademicObservations::getByStudents($request);
    }
    public function getObservations(Request $request): JsonResponse
    {
        return (new AcademicObservations())->read($request);
    }
    public function createObservations(Request $request): JsonResponse
    {
        return (new AcademicObservations())->create($request);
    }
}
