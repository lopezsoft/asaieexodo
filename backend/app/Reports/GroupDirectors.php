<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use Illuminate\Http\Request;
// Call sp_select_dir_grupo(2018);
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;

class GroupDirectors implements  ReportProcessorContract
{

    use MessagesTrait;
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {

        try {

            $school = SchoolQueries::getSchoolRequest($request);
            $format         = $school->format;
            $db	            = $school->db;
            $year	        = $school->year;
            // $pdbGrado	    = $request->input('pdbGrado')	;
            // $id_sede	    = $request->input('pdbSede')	;
            // $pdbAll		    = $request->input('pdbAll');
            // $typeReport	    = $request->input('pdbType');
            // $pdbGrupo		= $request->input('pdbGrupo');
            // $pdbJorn		= $request->input('pdbJorn');

            $report	        = 'dir_grupo';
            $report_export	= 'Lista directores de grupo';

            $query	        = null;
            $params         = [
                'P_YEAR'    => $year
            ];

            $path           = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school, $params);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }


    }
}
