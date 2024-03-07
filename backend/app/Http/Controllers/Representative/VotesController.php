<?php

namespace App\Http\Controllers\Representative;
use App\Http\Controllers\Controller;
use App\Modules\Representative\Vote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VotesController extends Controller
{
    public function validateVoteCode(Request $request, $code): JsonResponse
    {
        return Vote::validateVoteCode($request, $code);
    }
    public function getVotingData(Request $request): JsonResponse
    {
        return Vote::getVotingData($request);
    }
    public function openVoting(Request $request): JsonResponse
    {
        return Vote::openVoting($request);
    }
    public function closeVoting(Request $request): JsonResponse
    {
        return Vote::closeVoting($request);
    }
    public function insertVotes(Request $request): JsonResponse
    {
        return Vote::insertVotes($request);

    }
}
