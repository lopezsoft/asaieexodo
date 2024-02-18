<?php

namespace App\Http\Controllers\Representative;
use App\Http\Controllers\Controller;
use App\Modules\Representative\Vote;
use Illuminate\Http\Request;

class VotesController extends Controller
{
    public function insertVotes(Request $request): \Illuminate\Http\JsonResponse
    {
        return Vote::insertVotes($request);

    }
}
