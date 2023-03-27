<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;

class ListsWithLoad implements ReportProcessorContract
{
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $format         = $school->format;
            $db	            = $school->db;
            $year	        = $school->year;
            $pdbDocente	    = $request->input('pdbDocente')	;
            $period		    = $request->input('pdbPeriodo');
            $typeReport	    = $request->input('pdbType');

            $report	        = 'listasc'.$typeReport;
            $report_export	= 'Listas_con_asignacion_academica';

            $query	        = "CALL {$db}sp_select_listas_carga('{$year}','{$pdbDocente}')";
            $path           = "{$school->path}";
            $params	= [
                'R_PER'			=> $period
            ];
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school, $params);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
