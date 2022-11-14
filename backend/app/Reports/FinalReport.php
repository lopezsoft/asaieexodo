<?php

namespace App\Reports;

use App\Core\JReportModel;
use App\Modules\Courses\RatingScale;
use App\Modules\Grades\SchoolLevel;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinalReport
{
    public static function getFinalReport(Request $request): \Illuminate\Http\JsonResponse
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $year       = $school->year;
        $db         = $school->db;
        $grado 	    = $request->input('pdbGrado');
        $grupo	    = $request->input('pdbGrupo');
        $Sede	    = $request->input('pdbSede');
        $Jorn	    = $request->input('pdbJorn');
        $one	    = $request->input('pdbMatric');
        $h		    = $request->input('pdbHoja');
        $per	    = $request->input('pdbPer');
        $format		= $request->input('pFormat');
        $levelId    = SchoolLevel::getLevelId($db, $grado);

        if ($levelId > 1){
            if($per == 1){
                if ($h == '1'){
                    //Reporte a Procesar : Este nombre es del reporte creado en JasReport
                    $report	= 'libro_final_quinta';
                }else{
                    //Reporte a Procesar : Este nombre es del reporte creado en JasReport
                    $report	= 'libro_final_carta_quinta';
                }
            }else{
                if ($h == '1'){
                    //Reporte a Procesar : Este nombre es del reporte creado en JasReport
                    $report	= 'libro_final';
                }else{
                    //Reporte a Procesar : Este nombre es del reporte creado en JasReport
                    $report	= 'libro_final_carta';
                }
            }
            $query	= "CALL `sp_select_areasf`(".$year.",".$Sede.",'".$grado."','".$grupo."',".$Jorn.",".$one.",0)";
            // Nombre dado al informe de salida
        }else{
            $periodo = 5;
            $query	= sprintf("SELECT periodo FROM %speriodos_academicos AS td "."
                            LEFT JOIN %sgrados_agrupados AS t1 ON td.id_grado_agrupado = t1.id "."
                            LEFT JOIN %saux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id "."
                            WHERE td.year = %s AND t2.id_grado = %s "."
                            ORDER BY td.periodo DESC LIMIT 1", $db, $db, $db, $year, $grado);
            $query	= DB::select($query);
            if(count($query) > 0){
                $periodo = $query[0]->periodo;
            }
            if ($h == '1'){
                //Reporte a Procesar : Este nombre es del reporte creado en JasReport
                $report	= 'libro_oficio_prescolar';
            }else{
                //Reporte a Procesar : Este nombre es del reporte creado en JasReport
                $report	= 'libro_carta_prescolar';
            }
            $query	= "CALL `sp_boletines_reportes`(".$Sede.",'".$grado."','".$grupo."',".$Jorn.",".$year.",'".$periodo."',".$one.")";
        }
        $report_export	= 'Informe final';
        $path           = "{$school->school->folder_name}";
        $params         = [
            'R_ESCALA'  => RatingScale::getScaleString($grado, $year, $db)
        ];
        return (new JReportModel())->getReportExport($report,$report_export,$format,$query,$path, $school->school->database_name, $params);
    }
}
