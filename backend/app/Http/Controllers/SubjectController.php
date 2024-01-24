<?php

namespace App\Http\Controllers;
use App\Modules\Subject\AuxiliarSubject;
use App\Modules\Subject\Subject;
use App\Processors\CrudProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller{

    public function createAuxiliarSubjects(Request $request): JsonResponse
    {
        return CrudProcessor::create($request, new AuxiliarSubject());
    }

    public function getAuxiliarSubjects(Request $request): JsonResponse
    {
        return CrudProcessor::read($request, new AuxiliarSubject());
    }

    /**
     * @throws \Exception
     */
    public function getSubjectCertificate(Request $request): JsonResponse
    {
        return Subject::getSubjectCertificate($request);
    }
}
