<?php

namespace App\Http\Controllers;

use App\Modules\Promotion\GenerateFinalReport;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function generateFinalReport(Request $request): \Illuminate\Http\JsonResponse
    {
        return (new GenerateFinalReport())->generateReport($request);
    }
}
