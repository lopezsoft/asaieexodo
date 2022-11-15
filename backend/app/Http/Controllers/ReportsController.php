<?php

namespace App\Http\Controllers;

use App\Reports\EnrollmentReports;
use App\Reports\FinalReport;
use App\Reports\MinutesPromotion;
use App\Reports\ObserverReports;
use Illuminate\Http\Request;

class ReportsController extends Controller
{

    public function getFinalCertificate(Request $request): \Illuminate\Http\JsonResponse
    {
        return FinalReport::getFinalCertificate($request);
    }

    public function getFinalSavannas(Request $request): \Illuminate\Http\JsonResponse
    {
        return MinutesPromotion::getFinalSavannas($request);
    }

    public function getMinutesPromotionStatistics(Request $request): \Illuminate\Http\JsonResponse
    {
        return MinutesPromotion::getMinutesPromotionStatistics($request);
    }
    public function getMinutesPromotion(Request $request): \Illuminate\Http\JsonResponse
    {
        return MinutesPromotion::getMinutesPromotion($request);
    }

    public function getFinalReport(Request $request): \Illuminate\Http\JsonResponse
    {
        return FinalReport::getFinalReport($request);
    }

    public function getObserverSheet(Request $request): \Illuminate\Http\JsonResponse
    {
        return ObserverReports::getObserverSheet($request);
    }

    public function getHonorFrame(Request $request): \Illuminate\Http\JsonResponse
    {
        return EnrollmentReports::getHonorFrame($request);
    }

    public function getPeriodicCertificate(Request $request): \Illuminate\Http\JsonResponse
    {
        return EnrollmentReports::getCertificate($request,2);
    }

    public function getCertificate(Request $request): \Illuminate\Http\JsonResponse
    {
        return EnrollmentReports::getCertificate($request, 1);
    }

    public function getEnrollmentSheet(Request $request): \Illuminate\Http\JsonResponse
    {
        return EnrollmentReports::getEnrollmentSheet($request);
    }
}
