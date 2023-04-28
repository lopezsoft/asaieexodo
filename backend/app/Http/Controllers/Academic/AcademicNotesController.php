<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Modules\Academic\AcademicNotes;
use Illuminate\Http\Request;

class AcademicNotesController extends Controller
{
    public function getAcademicNotes(Request $request): \Illuminate\Http\JsonResponse
    {
        return AcademicNotes::getAcademicNotes($request);
    }
}
