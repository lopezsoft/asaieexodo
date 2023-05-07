<?php

namespace App\Reports;
use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;
class StatisticsByAges implements ReportProcessorContract
{
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $format         = $school->format;
            $db	            = $school->db;
            $year	        = $school->year;
            $report	        = 'test';
            $report_export	= 'Estadistica por edades';

            $query	        = "CALL {$db}sp_select_estadistica_edades('{$year}')";
            $path           = "{$school->path}";
            $params         = [
                'P_YEAR' => $year
            ];
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school, $params);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
