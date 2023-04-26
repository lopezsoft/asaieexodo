<?php

namespace App\Http\Controllers;

use App\Modules\Promotion\GenerateFinalReport;
use App\Modules\Promotion\FinalSupportActivities;
use App\Modules\Promotion\AdvancePromotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function getAdvancePromotion(Request $request): \Illuminate\Http\JsonResponse
    {
        return AdvancePromotion::getAdvancePromotion($request);
    }


    public function generateSupportActivities(Request $request): \Illuminate\Http\JsonResponse
    {
        return (new FinalSupportActivities())->generateFinalActivities($request);
    }

    public function generateFinalSavannas(Request $request): \Illuminate\Http\JsonResponse
    {
        return (new GenerateFinalReport())->generateFinalSavannas($request);
    }

    /**
     * @throws \Exception
     */
    public function generateFinalReport(Request $request): \Illuminate\Http\JsonResponse
    {
        return (new GenerateFinalReport())->generateReport($request);
    }
}
