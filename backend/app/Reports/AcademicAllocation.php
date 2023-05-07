<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;

class AcademicAllocation implements ReportProcessorContract
{
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $format         = $school->format;
            $db	            = $school->db;
            $year	        = $school->year;
            $pdbDocente	    = $request->input('pdbDocente')	?? 0;
            $pdbGrado	    = $request->input('pdbGrado')	;
            $id_sede	    = $request->input('pdbSede')	;

            if ($pdbDocente > 0){
                $report	= 'carga_academica';
            }else{
                $report	= 'carga_academica2';
            }
            $report_export	= 'asignacion_academica';

            $query	        = "CALL {$db}sp_select_carga_report('{$year}','{$id_sede}','{$pdbGrado}','{$pdbDocente}')";
            $path           = "{$school->path}";

            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
