<?php

namespace App\Http\Controllers;

use App\Modules\Recovery\FinalRecovery;
use Illuminate\Http\Request;

class RecoveriesController extends Controller
{
    public function writeNote(Request $request): \Illuminate\Http\JsonResponse
    {
        return FinalRecovery::writeNote($request);
    }
}
