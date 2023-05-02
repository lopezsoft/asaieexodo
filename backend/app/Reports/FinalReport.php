<?php

namespace App\Reports;

use App\Core\JReportModel;
use App\Modules\Courses\RatingScale;
use App\Modules\Grades\SchoolLevel;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinalReport
{
    /**
     * @throws \Exception
     */
    public static function getFinalCertificate(Request $request): JsonResponse
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $year       = $school->year;
        $db         = $school->db;
        $one	    = $request->input('pdbMatric');
        $h		    = $request->input('pdbHoja');
        $tp		    = $request->input('pdbType');
        $per	    = $request->input('pdbPer');
        $mod	    = $request->input('pdbModelo');
        $dist	    = $request->input('pdbDistrib');
        $levelId    = SchoolLevel::getLevelId($db, $school->grade);
        if ($levelId > 1){
            if ($dist == 1){
                if ($h == '1'){
                    $report	= 'certificado_final_distri';
                }else{
                    $report	= 'certificado_final_carta_distri';
                }
                $query	= "CALL `sp_select_areasf`(".$year.",".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$one.",".$dist.")";
            }else{
                // Solo Áreas
                if ($tp == 1){
                    if ($h == '1'){
                        $report	= 'certificado_final_areas';
                    }else{
                        $report	= 'certificado_final_areas_carta';
                    }
                    $query	= "CALL `sp_select_areasf_agrupada`(".$year.",".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$one.")";
                }else{
                    if ($h == '1'){
                        $report	= 'certificado_final';
                    }else{
                        $report	= 'certificado_final_carta';
                    }
                    $query	= "CALL `sp_select_areasf`(".$year.",".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$one.",0)";
                }
            }
        }else{
            $periodo = 5;
            $query	= sprintf("SELECT periodo FROM %speriodos_academicos AS td "."
                            LEFT JOIN %sgrados_agrupados AS t1 ON td.id_grado_agrupado = t1.id "."
                            LEFT JOIN %saux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id "."
                            WHERE td.year = %s AND t2.id_grado = %s "."
                            ORDER BY td.periodo DESC LIMIT 1", $db, $db, $db, $year, $school->grade);
            $query	= DB::select($query);

            if(count($query) > 0){
                $periodo = $query[0]->periodo;
            }

            if ($h == '1'){
                $report	= 'certificado_final_oficio_preescolar';
            }else{
                $report	= 'certificado_final_carta_preescolar';
            }
            $query	= 	"CALL `sp_boletines_reportes`(".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$year.",'".$periodo."',".$one.")";
        }

        if($school->grade > 15){
            $type	= 5;
        }else{
            $type	= 4;
        }

        $up		= sprintf("INSERT INTO %scertificate_numbers(id_parent,year,total,type) SELECT id,%s,1,1 FROM ".
                        "%sconfig_const_cert_end WHERE type = %d LIMIT 1 ON DUPLICATE KEY UPDATE total=total + 1",
                        $db, $year, $db, $type);
        DB::statement($up);

        $sql	= "SELECT t.*, RIGHT(CONCAT('0000000',t2.total),7) cons, t2.year, r.logo, r.escudo, r.pie ".
                        "FROM ".$db."config_const_cert_end AS t ".
                        "LEFT JOIN ".$db."certificate_numbers AS t2 ON t2.id_parent = t.id ".
                        "LEFT JOIN ".$db."encabezado_reportes AS r ON r.id > 0 ".
                        " WHERE ".$year." BETWEEN t.year_from AND t.year_until AND t2.year =".$year." AND t.type = ".
                        $type." LIMIT 1";
        $sql	= DB::select($sql);

        $report_export	= 'Certificado final';

        $params	= [
            'R_TYPE'		=> intval($mod),
            'R_RESOLUCION'	=> $sql[0]->resolution,
            'R_YEAR'	    => $year,
            'R_TYPE_HEADER' => $type,
            'R_EXPEDICION'	=> $sql[0]->expedition,
            'R_FIRMA_REC'	=> intval($sql[0]->rector_firm),
            'R_FIRMA_SEC'	=> intval($sql[0]->signature_secretary),
            'R_ESCALA'      => RatingScale::getScaleString($school->grade, $year, $db)
        ];

        return (new JReportModel())->getReportExport($report,$report_export,$school->format,$query,$school->path, $school->school, $params);
    }

    public static function getFinalReport(Request $request): JsonResponse
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $year       = $school->year;
        $db         = $school->db;
        $one	    = $request->input('pdbMatric');
        $h		    = $request->input('pdbHoja');
        $per	    = $request->input('pdbPer');
        $levelId    = SchoolLevel::getLevelId($db, $school->grade);

        if ($levelId > 1){
            if($per == 1){
                if ($h == '1'){
                    $report	= 'libro_final_quinta';
                }else{
                    $report	= 'libro_final_carta_quinta';
                }
            }else{
                if ($h == '1'){
                    $report	= 'libro_final';
                }else{
                    $report	= 'libro_final_carta';
                }
            }
            $query	= "CALL `sp_select_areasf`(".$year.",".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$one.",0)";
        }else{
            $periodo = 5;
            $query	= sprintf("SELECT periodo FROM %speriodos_academicos AS td "."
                            LEFT JOIN %sgrados_agrupados AS t1 ON td.id_grado_agrupado = t1.id "."
                            LEFT JOIN %saux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id "."
                            WHERE td.year = %s AND t2.id_grado = %s "."
                            ORDER BY td.periodo DESC LIMIT 1", $db, $db, $db, $year, $school->grade);
            $query	= DB::select($query);
            if(count($query) > 0){
                $periodo = $query[0]->periodo;
            }
            if ($h == '1'){
                $report	= 'libro_oficio_prescolar';
            }else{
                $report	= 'libro_carta_prescolar';
            }
            $query	= "CALL `sp_boletines_reportes`(".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$year.",'".$periodo."',".$one.")";
        }
        $report_export	= 'Informe final';
        $params         = [
            'R_ESCALA'  => RatingScale::getScaleString($school->grade, $year, $db)
        ];
        return (new JReportModel())->getReportExport($report,$report_export,$school->format,$query,$school->path, $school->school, $params);
    }
}
