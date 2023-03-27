<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;

class StudentsEnrolled implements ReportProcessorContract
{
    use MessagesTrait;
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $format     = $school->format;
            $db	        = $school->db;
            $year	    = $school->year;
            $pdbGrado	= $request->input('pdbGrado')	;
            $id_sede	= $request->input('pdbSede')	;
            $grupo		= $request->input('pdbGrupo');
            $pdbJorn	= $request->input('pdbJorn');
            $typeReport	= $request->input('pdbType');

            if ($typeReport == 1){
                $report	= 'matriculados_acud';
            }else{
                $report	= 'matriculados';
            }
            $report_export	= 'Estudiantes matriculados';

            $query	= "CALL {$db}sp_select_matriculados('{$year}','{$id_sede}','{$pdbGrado}','{$grupo}','{$pdbJorn}')";
            $path       = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
