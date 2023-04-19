<?php

namespace App\Http\Controllers;
use App\Modules\Representative\{Representative,Jury};
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
