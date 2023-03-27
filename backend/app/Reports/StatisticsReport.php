<?php

namespace App\Reports;

use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;

class StatisticsReport
{
    use MessagesTrait;
    public static function getStatistics(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $per	    = $request->input('pdbPeriodo');
            $pbdNivel	= $request->input('pbdNivel');
            $type	    = $request->input('pdbTypeReport');
            $all	    = $request->input('pdbAllPer');
            $format     = $school->format;
            $db	        = $school->db;
            $year	    = $school->year;

            if ($all == '1'){
                $z_per = '0';
            }else{
                $z_per = $per;
            }

            if ($type == '1') {
                $report			=	'estadisticas';
            }else{
                $report			= 'estadisticas_perdidos';
            }
            $report_export	= 'estadistica ';

            $query	= "CALL {$db}sp_estadistica_select_grado(".$year.",".$pbdNivel.",'".$z_per."',".$type.")";

            $params	= array(
                'P_NIVEL'		=> $pbdNivel,
                'P_PERIODO'		=> $z_per,
                'P_ALLPER'		=> $all,
            );

            $path       = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school, $params);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
