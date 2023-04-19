<?php

namespace App\Http\Controllers;
use App\Modules\Representative\Representative;
use Illuminate\Http\Request;


class RepresentativeController extends Controller{

    public function getCandidates(Request $request): \Illuminate\Http\JsonResponse
    {
        return Representative::getCandidates($request);
    }


}
