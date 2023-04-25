<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use Illuminate\Http\Request;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;

class RepresentativeReports implements  ReportProcessorContract
{

    use MessagesTrait;
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db	            = $school->db;
            $format         = $school->format;
            $grade_id	= $request->input('pdbGrado');
		    $headquarter_id	= $request->input('pdbSede');
            $year	        = $school->year;
            // $type	        = $request->input('pdbReport');
            $report			='certificado_electoral';
            $report_export	= 'certificado electoral';
            $query	=null;
            $params         = [

                'P_YEAR'    => $year,
                'P_GRADE_ID' => $grade_id,
                'P_HEADQUARTER_ID'=>$headquarter_id
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
