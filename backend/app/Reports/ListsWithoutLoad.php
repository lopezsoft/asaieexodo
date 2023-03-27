<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;

class ListsWithoutLoad implements ReportProcessorContract
{

    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $format         = $school->format;
            $db	            = $school->db;
            $year	        = $school->year;
            $pdbGrado	    = $request->input('pdbGrado')	;
            $id_sede	    = $request->input('pdbSede')	;
            $grupo		    = $request->input('pdbGrupo');
            $period		    = $request->input('pdbPeriodo');
            $pdbJorn	    = $request->input('pdbJorn');
            $typeReport	    = $request->input('pdbType');

            $report	        = 'listas'.$typeReport;
            $report_export	= 'Listas_sin_asignacion_academica';

            $query	        = "CALL {$db}sp_select_listas('{$year}','{$id_sede}','{$pdbGrado}','{$grupo}','{$pdbJorn}')";
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
