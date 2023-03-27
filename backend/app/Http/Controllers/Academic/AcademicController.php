<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Modules\Academic\HonorFrame;
use Illuminate\Http\Request;

class AcademicController extends Controller
{
    public function honorFrame(Request $request): \Illuminate\Http\JsonResponse
    {
        return HonorFrame::getHonorFrame($request);
    }
}
