<?php

namespace App\Http\Controllers;
use App\Modules\Subject\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller{

    public function getSubject(Request $request): \Illuminate\Http\JsonResponse
    {
        return Subject::getSubject($request);
    }


}
