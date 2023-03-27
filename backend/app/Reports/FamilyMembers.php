<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;

class FamilyMembers implements  ReportProcessorContract
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
            $pdbAll		    = $request->input('pdbAll');
            $typeReport	    = $request->input('pdbType');

            $report	        = 'familiares';
            $report_export	= 'Lista familiares';

            $query	        = "CALL {$db}sp_familiares('{$year}','{$pdbGrado}','{$id_sede}','{$typeReport}','{$pdbAll}')";
            $path           = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
