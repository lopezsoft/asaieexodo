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
            $year	    = $school->year;

            $report			= 'estudiantes_jornada';
            $report_export	= 'Estudiantes por jornada';

            $query	    = "";
            $path       = "{$school->path}";
            $params     = [
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
