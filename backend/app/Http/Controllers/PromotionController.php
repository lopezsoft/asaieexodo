<?php

namespace App\Http\Controllers;

use App\Modules\Promotion\GenerateFinalReport;
use App\Modules\Promotion\FinalSupportActivities;
use App\Modules\Promotion\AdvancePromotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class PromotionController extends Controller
{
    public function getFinalLeveling(Request $request): JsonResponse
    {
        return AdvancePromotion::getFinalLeveling($request);
    }
    public function getAdvancePromotion(Request $request): JsonResponse
    {
        return AdvancePromotion::getAdvancePromotion($request);
    }
    /**
     * @throws \Exception
     */
    public function generateSupportActivities(Request $request): JsonResponse
    {
        return (new FinalSupportActivities())->generateFinalActivities($request);
    }
    public function generateFinalSavannas(Request $request): JsonResponse
    {
        return (new GenerateFinalReport())->generateFinalSavannas($request);
    }
    /**
     * @throws \Exception
     */
    public function generateFinalReport(Request $request): JsonResponse
    {
        return (new GenerateFinalReport())->generateReport($request);
    }
}
