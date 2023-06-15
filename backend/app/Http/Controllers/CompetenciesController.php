<?php

namespace App\Http\Controllers;

use App\Modules\Settings\Competencies;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompetenciesController extends Controller
{
    public function getByGroupGrades(Request $request): JsonResponse
    {
        return Competencies::getByGroupGrades($request);
    }
    public function getCompetencies(Request $request): JsonResponse
    {
        return Competencies::getEducationProcesses($request);
    }
}
