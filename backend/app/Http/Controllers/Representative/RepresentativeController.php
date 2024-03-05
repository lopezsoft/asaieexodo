<?php

namespace App\Http\Controllers\Representative;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Modules\Representative\{Jury, Representative};
use Illuminate\Http\Request;
class RepresentativeController extends Controller{

    public function uploadCandidatePhoto(Request $request): JsonResponse
    {
        return Representative::uploadCandidatePhoto($request);
    }
    public function getCandidates(Request $request): JsonResponse
    {
        return Representative::getCandidates($request);
    }
    public function getJuries(Request $request): JsonResponse
    {
        return Jury::getJuries($request);
    }
}
