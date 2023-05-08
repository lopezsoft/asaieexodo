<?php

namespace App\Reports;

use App\Core\JReportModel;
use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;

class ConsolidatedReport
{
    use MessagesTrait;
    public static function getConsolidated(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $per	= $request->input('pdbPeriodo');
            $hoj	= $request->input('pHojaReport');
            $type	= $request->input('pTypeReport');
            $all	= $request->input('pdbAllPer');
            $c_gdo	= $request->input('pdbCodGrado');
            $gpo	= $request->input('pdbGrupo');
            $jorn	= $request->input('pdbIdJorn');
            $sede	= $request->input('pdbIdSede');
            $format = $school->format;
            $db	    = $school->db;
            $year	= $school->year;

            if ($all == '1'){
                $z_per = '0';
            }else{
                $z_per = $per;
            }

            if ($type == '1') {
                if ($hoj == '1') {
                    $report			=	'consolidado_asignaturas';
                }else{
                    $report			=	'consolidado_asignaturas_horz';
                }
                $report_export	= 'consolidado_asignaturas ';
            }else{
                $report			= 'consolidado_areas';
                $report_export	= 'consolidado_areas';
            }

            $desde	    = 0;
            $hasta	    = 0;
            $NotaMin	= 0;
            $NotaMinB	= 0;
            $scale      = RatingScale::getRatingScaleReproved($school, $c_gdo);
            if ($scale){
                $desde	= $scale->desde;
                $hasta	= $scale->hasta;
            };

            $scale      = RatingScale::getRatingScaleMin($school, $c_gdo);
            if ($scale) {
                $NotaMin	= $scale->desde;
                $NotaMinB	= $scale->desde;
            }

            $query	= "";
            $escala	= RatingScale::getScaleString($c_gdo, $year, $db);

            $params	= [
                'P_GRADE'		=> $c_gdo,
                'P_GROUP'		=> $gpo,
                'P_STUDY_DAY'   => $jorn,
                'P_HEADQ'		=> $sede,
                'P_YEAR'		=> $year,
                'P_PERIOD'		=> $z_per,
                'P_TYPE'		=> $type,
                'R_ESCALA'		=> $escala,
                'P_DESDE'		=> $desde,
                'P_HASTA'		=> $hasta,
                'P_NotaMin'		=> $NotaMin,
                'P_NotaMinB'	=> $NotaMinB,
            ];

            $path       = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school, $params);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
