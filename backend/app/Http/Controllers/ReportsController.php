<?php

namespace App\Http\Controllers;

use App\Processors\ReportProcessor;
use App\Reports\AcademicAllocation;
use App\Reports\AcademicHistory;
use App\Reports\BirthDates;
use App\Reports\Consolidated\GenerateConsolidate;
use App\Reports\ConsolidatedReport;
use App\Reports\DisplacedStudents;
use App\Reports\EnrollmentReports;
use App\Reports\FamilyMembers;
use App\Reports\FinalReport;
use App\Reports\ListsWithLoad;
use App\Reports\ListsWithoutLoad;
use App\Reports\MinutesPromotion;
use App\Reports\ObserverReports;
use App\Reports\PeriodicBulletinReport;
use App\Reports\SchoolCarnes;
use App\Reports\StatisticsByAges;
use App\Reports\StatisticsReport;
use App\Reports\StudentsEnrolled;
use App\Reports\StudentsPerDay;
use App\Reports\TeachersList;
use App\Reports\GroupDirectors;
use App\Reports\ElectionResults;
use App\Reports\RepresentativeReports;

use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function generateConsolidated(Request $request): \Illuminate\Http\JsonResponse
    {
        return (new GenerateConsolidate())->generate($request);
    }



    // ejemplo
    // public function getFamilyMembers(Request $request): \Illuminate\Http\JsonResponse
    // {
    //     return ReportProcessor::runReport($request, new FamilyMembers());
    // }

    public function getGroupDirectors(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new GroupDirectors() );

    }

    public function getElectionResults(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new ElectionResults() );

    }

    public function getElectoralCertificate(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new RepresentativeReports() );

    }

    //
    public function getFamilyMembers(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new FamilyMembers());
    }
    public function getBirthDates(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new BirthDates());
    }
    public function getSchoolCarnes(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new SchoolCarnes());
    }
    public function getTeachersList(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new TeachersList());
    }
    public function getAcademicAllocation(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new AcademicAllocation());
    }
    public function getListsWithLoad(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new ListsWithLoad());
    }
    public function getListsWithoutLoad(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new ListsWithoutLoad());
    }
    public function getStatisticsByAges(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new StatisticsByAges());
    }
    public function getStudentsEnrolled(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new StudentsEnrolled());
    }
    public function getDisplacedStudents(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new DisplacedStudents());
    }
    public function getStudentsPerDay(Request $request): \Illuminate\Http\JsonResponse
    {
        return ReportProcessor::runReport($request, new StudentsPerDay());
    }
    public function getStatistics(Request $request): \Illuminate\Http\JsonResponse
    {
        return StatisticsReport::getStatistics($request);
    }
    public function getPeriodicBulletin(Request $request): \Illuminate\Http\JsonResponse
    {
        return PeriodicBulletinReport::getPeriodicBulletin($request);
    }
    public function getConsolidated(Request $request): \Illuminate\Http\JsonResponse
    {
        return ConsolidatedReport::getConsolidated($request);
    }
    public function getAcademicHistory(Request $request): \Illuminate\Http\JsonResponse
    {
        return AcademicHistory::getHistory($request);
    }
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
