<?php

namespace App\Http\Controllers\Representative;
use App\Http\Controllers\Controller;
use App\Modules\Representative\{Jury, Representative};
use Illuminate\Http\Request;


class RepresentativeController extends Controller{

    public function getCandidates(Request $request): \Illuminate\Http\JsonResponse
    {
        return Representative::getCandidates($request);
    }

    public function getJuries(Request $request): \Illuminate\Http\JsonResponse
    {
        return Jury::getJuries($request);
    }



}
