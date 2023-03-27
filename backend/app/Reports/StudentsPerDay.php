<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;

class StudentsPerDay implements ReportProcessorContract
{
    use MessagesTrait;
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $format     = $school->format;
            $db	        = $school->db;
            $year	    = $school->year;

            $report			= 'estudiantes_jornada';
            $report_export	= 'Estudiantes por jornada';

            $query	= "CALL {$db}sp_select_estudiantes_jorn('{$year}')";
            $path       = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
