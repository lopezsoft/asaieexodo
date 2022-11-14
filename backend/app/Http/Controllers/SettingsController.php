<?php

namespace App\Http\Controllers;

use App\Modules\Settings\DeletingNotes;
use App\Modules\Settings\FinalStudentState;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function deleteNotesZero(Request $request): \Illuminate\Http\JsonResponse
    {
        return DeletingNotes::notesZero($request);
    }
    public function getFinalStudentState(Request $request): \Illuminate\Http\JsonResponse
    {
        return FinalStudentState::getFinalStudentState($request);
    }
}
