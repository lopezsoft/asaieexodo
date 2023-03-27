<?php

namespace App\Reports;

use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;

class AcademicHistory
{
    use MessagesTrait;
    /**
     * @throws \Exception
     */
    public static function getHistory(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $format	    = $school->format;
            $report	    = 'historial_academico';
            $report_export	= 'Historial academico';
            $params         = [
                'P_GRADE'   => $school->grade
            ];
            $path       = "{$school->path}";
            return (new JReportModel())->getReportExport($report,$report_export,$format,null,$path, $school->school, $params);
        }catch (Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
