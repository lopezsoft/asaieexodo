<?php

namespace App\Http\Controllers;

use App\Modules\Competences\Competence;
use Illuminate\Http\Request;

class CompetenceController extends Controller
{
    public function getCompetences(Request $request): \Illuminate\Http\JsonResponse
    {
        return Competence::getCompetences($request);
    }
}
