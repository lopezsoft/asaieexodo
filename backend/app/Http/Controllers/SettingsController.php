<?php

namespace App\Http\Controllers;

use App\Modules\Courses\RatingScale;
use App\Modules\Settings\Competencies;
use App\Modules\Settings\DeletingNotes;
use App\Modules\Settings\FinalStudentState;
use App\Modules\Settings\GeneralSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{

    public function getColumnsNotesCompetenciesExists(Request $request): \Illuminate\Http\JsonResponse
    {
        return Competencies::getColumnsNotesCompetenciesExists($request);
    }

    public function getColumnsNotesCompetencies(Request $request): \Illuminate\Http\JsonResponse
    {
        return Competencies::getColumnsNotesCompetencies($request);
    }

    public function getCompetencies(Request $request): \Illuminate\Http\JsonResponse
    {
        return Competencies::getCompetencies($request);
    }

    public function getRatingScale(Request $request): \Illuminate\Http\JsonResponse
    {
        return RatingScale::getRatingScale($request);
    }

    public function getGeneralSetting(Request $request): \Illuminate\Http\JsonResponse
    {
        return GeneralSetting::generalSetting($request);
    }


    public function deleteNotesZero(Request $request): \Illuminate\Http\JsonResponse
    {
        return DeletingNotes::notesZero($request);
    }
    public function getFinalStudentState(Request $request): \Illuminate\Http\JsonResponse
    {
        return FinalStudentState::getFinalStudentState($request);
    }
}
