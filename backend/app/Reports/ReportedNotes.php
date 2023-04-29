<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportedNotes implements ReportProcessorContract
{
    public function getReport(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $format         = $school->format;
            $year	        = $school->year;
            $teacher_id     = $request->input('pdbDocente');
            $periodo	    = $request->input('pdbPeriodo');
            $reportName		    = 'notas_reportadas';
            $fileDescription	= 'Notas reportadas';
            $query	        = null;
            $params         = [
                'P_YEAR'    => $year,
                'P_TEACHER_ID' => $teacher_id,
                'P_PERIOD'  => $periodo,
            ];
            $path           = "{$school->path}";
            return (new JReportModel())->getReportExport($reportName, $fileDescription, $format,$query, $path, $school->school, $params);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
