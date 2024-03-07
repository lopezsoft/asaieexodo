<?php

namespace App\Reports;

use App\Common\MessageExceptionResponse;
use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use Exception;
use Illuminate\Http\Request;
use App\Modules\School\SchoolQueries;

class RepresentativeReports implements  ReportProcessorContract
{

    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $format         = $school->format;
            $grade_id	    = $request->input('pdbGrado');
		    $headquarter_id	= $request->input('pdbSede');
            $year	        = $school->year;
            $type	        = $request->input('pdbReport');

            if($type == "1"){
                    $report	='certificado_electoral';
                    $report_export	= 'certificado electoral';

            }else{
                $report	        = 'respresentative_students';
                $report_export	= 'listado_estudiantes';

            }
            $extraParams            = SchoolQueries::getSchoolAndHeaderReportParams($school->db);
            $params         = [
                'P_YEAR'            => $year,
                'P_GRADE_ID'        => $grade_id,
                'P_HEADQUARTER_ID'  => $headquarter_id
            ];
            $params = array_merge($params, $extraParams);
            $query	= '';
            $path   = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school, $params);
        }catch (Exception $e){
            return MessageExceptionResponse::response($e);
        }
    }
}

