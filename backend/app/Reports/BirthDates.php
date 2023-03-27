<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;

class BirthDates implements ReportProcessorContract
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
            $pdbJorn	    = $request->input('pdbJorn');
            $typeReport	    = $request->input('pdbType');

            $report	        = 'fechas_nacimiento';
            $report_export	= 'Lista fechas de nacimiento';

            $query	        = "CALL {$db}sp_select_fechas_nac_report('{$year}','{$id_sede}','{$pdbGrado}','{$grupo}','{$pdbJorn}','{$typeReport}')";
            $path           = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
