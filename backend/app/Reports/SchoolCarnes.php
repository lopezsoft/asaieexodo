<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;

class SchoolCarnes implements  ReportProcessorContract
{
    use MessagesTrait;
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $format         = $school->format;
            $db	            = $school->db;
            $year	        = $school->year;
            $type           = $request->input('pdbType') ?? 1;
            $ckRes          = $request->input('ckRes') ?? 0;
            $ckAll          = $request->input('ckAll') ?? 0;
            $id             = $request->input('pdbId') ?? 0;

            $report	= ($type == 1) ? 'carnets' : 'carnets_docentes';

            if($ckRes > 0){
                $report	= ($type == 1) ? 'carnets' : 'carnets_docentes_respaldo';
            }

            if(!$ckAll > 0){
                $id = 0;
            }

            $report_export	= 'Carnes_escolares';

            $query	    = "CALL {$db}sp_select_school_carnets({$year}, {$id})";
            $path       = "{$school->path}";

            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
