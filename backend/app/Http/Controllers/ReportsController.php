<?php

namespace App\Http\Controllers;

use App\Reports\EnrollmentReports;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
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
