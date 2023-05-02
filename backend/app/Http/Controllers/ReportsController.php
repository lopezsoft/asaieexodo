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
use App\Reports\PeriodicLeveling;
use App\Reports\ReportedNotes;
use App\Reports\SchoolCarnes;
use App\Reports\StatisticsByAges;
use App\Reports\StatisticsReport;
use App\Reports\StudentsEnrolled;
use App\Reports\StudentsPerDay;
use App\Reports\TeachersList;
use App\Reports\GroupDirectors;
use App\Reports\ElectionResults;
use App\Reports\RepresentativeReports;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function getPeriodicLeveling(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new PeriodicLeveling());
    }
    public function getReportedNotes(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new ReportedNotes());
    }
    public function generateConsolidated(Request $request): JsonResponse
    {
        return (new GenerateConsolidate())->generate($request);
    }
    public function getGroupDirectors(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new GroupDirectors() );
    }
    public function getElectionResults(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new ElectionResults() );
    }
    public function getElectoralCertificate(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new RepresentativeReports() );
    }
    public function getFamilyMembers(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new FamilyMembers());
    }
    public function getBirthDates(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new BirthDates());
    }
    public function getSchoolCarnes(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new SchoolCarnes());
    }
    public function getTeachersList(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new TeachersList());
    }
    public function getAcademicAllocation(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new AcademicAllocation());
    }
    public function getListsWithLoad(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new ListsWithLoad());
    }
    public function getListsWithoutLoad(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new ListsWithoutLoad());
    }
    public function getStatisticsByAges(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new StatisticsByAges());
    }
    public function getStudentsEnrolled(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new StudentsEnrolled());
    }
    public function getDisplacedStudents(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new DisplacedStudents());
    }
    public function getStudentsPerDay(Request $request): JsonResponse
    {
        return ReportProcessor::runReport($request, new StudentsPerDay());
    }
    public function getStatistics(Request $request): JsonResponse
    {
        return StatisticsReport::getStatistics($request);
    }
    public function getPeriodicBulletin(Request $request): JsonResponse
    {
        return PeriodicBulletinReport::getPeriodicBulletin($request);
    }
    public function getConsolidated(Request $request): JsonResponse
    {
        return ConsolidatedReport::getConsolidated($request);
    }
    public function getAcademicHistory(Request $request): JsonResponse
    {
        return AcademicHistory::getHistory($request);
    }
    public function getFinalCertificate(Request $request): JsonResponse
    {
        return FinalReport::getFinalCertificate($request);
    }
    public function getFinalSavannas(Request $request): JsonResponse
    {
        return MinutesPromotion::getFinalSavannas($request);
    }
    public function getMinutesPromotionStatistics(Request $request): JsonResponse
    {
        return MinutesPromotion::getMinutesPromotionStatistics($request);
    }
    public function getMinutesPromotion(Request $request): JsonResponse
    {
        return MinutesPromotion::getMinutesPromotion($request);
    }
    public function getFinalReport(Request $request): JsonResponse
    {
        return FinalReport::getFinalReport($request);
    }
    public function getObserverSheet(Request $request): JsonResponse
    {
        return ObserverReports::getObserverSheet($request);
    }
    public function getHonorFrame(Request $request): JsonResponse
    {
        return EnrollmentReports::getHonorFrame($request);
    }
    public function getPeriodicCertificate(Request $request): JsonResponse
    {
        return EnrollmentReports::getCertificate($request,2);
    }
    public function getCertificate(Request $request): JsonResponse
    {
        return EnrollmentReports::getCertificate($request, 1);
    }
    public function getEnrollmentSheet(Request $request): JsonResponse
    {
        return EnrollmentReports::getEnrollmentSheet($request);
    }
}
