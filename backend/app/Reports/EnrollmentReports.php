<?php

namespace App\Reports;

use App\Core\JReportModel;
use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnrollmentReports
{
    public static function getHonorFrame(Request $request): \Illuminate\Http\JsonResponse {
        $school     = SchoolQueries::getSchoolRequest($request);
        $ye         = $school->year;
        $format		= $request->input('pFormat');
        $Grado 	    = $request->input('pdbGrado');
        $Grupo	    = $request->input('pdbGrupo');
        $Photo 	    = $request->input('pdbPhoto');
        $CkGrado	= $request->input('pdbCkGrado');
        $Sede	    = $request->input('pdbSede');
        $CkSede	    = $request->input('pdbCkSede');
        $Nivel	    = $request->input('pdbCkNivel');
        $per	    = $request->input('pdbPeriodo');
        $lm			= $request->input('pdbLimit');
        $niv		= $request->input('pdbNiv');
        $ck			= $request->input('pdbCk');

        $report     = 'cuadro_honor';
        $query      = "";
        if($CkGrado == 0 AND $CkSede == 0 AND $Nivel == 0 AND $Photo == 0){
            $query  = "CALL `sp_select_cuadro_honor`(".$ye.",".$Sede.",'".$Grado."','".$Grupo."','".$per."',".$lm.",1,0,".$ck.")";
        }else if ($Photo == 1){
            $report	=	'cuadro_honor2';
            $query  = "CALL `sp_select_cuadro_honor`(".$ye.",".$Sede.",'".$Grado."','".$Grupo."','".$per."',".$lm.",2,0,".$ck.")";
        }else if($CkGrado == 1){
            $report =	'cuadro_honor3';
            $query  = "CALL `sp_select_cuadro_honor`(".$ye.",".$Sede.",'".$Grado."','".$Grupo."','".$per."',".$lm.",3,0,".$ck.")";
        }else if($CkSede == 1){
            $report = 'cuadro_honor4';
            $query  = "CALL `sp_select_cuadro_honor`(".$ye.",".$Sede.",'".$Grado."','".$Grupo."','".$per."',".$lm.",4,0,".$ck.")";
        }else if($Nivel == 1){
            $report	= 'cuadro_honor5';
            $query 	= "CALL `sp_select_cuadro_honor`(".$ye.",".$Sede.",'".$Grado."','".$Grupo."','".$per."',".$lm.",5,'".$niv."',".$ck.")";
        }

        // Nombre dado al informe de salida
        $report_export	= 'Cuadro de honor ';
        $path       = "{$school->school->folder_name}";
        return (new JReportModel())->getReportExport($report,$report_export,$format,$query,$path, $school->school->database_name);
    }

    public static function getCertificate(Request $request, Int $typeReport): \Illuminate\Http\JsonResponse{
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db     = "{$school->database_name}.";
        $id	    = $request->input('pdbMatric');
        $year	= $request->input('year') ?? Date('Y');
        $format	= $request->input('pFormat');
        $type	= $request->input('pdbType');
        $per	= $request->input('pdbPeriodo') ?? '1';
        $Grado 	= $request->input('pdbGrado');
        $Grupo	= $request->input('pdbGrupo');
        $Jorn 	= $request->input('pdbJorn');
        $Sede	= $request->input('pdbSede');
        $student= $request->input('pdbEstudian');

        $report = 'constancia_estudio';
        if($typeReport == 2) $report			=	'certificado_estudio_per';
        $up		= sprintf("INSERT INTO %scertificate_numbers(id_parent,year,total,type)
                        SELECT id,%s,1,1 FROM %sconfig_const_cert WHERE type = %s LIMIT 1
                        ON DUPLICATE KEY UPDATE total=total + 1", $db, $year, $db, $typeReport);
        DB::select($up);

        $query = "SELECT t.*, RIGHT(CONCAT('0000000',t2.total),7) cons, t2.year, r.logo, r.escudo, r.pie ".
                    "FROM ".$db."config_const_cert AS t ".
                    "LEFT JOIN ".$db."certificate_numbers AS t2 ON t2.id_parent = t.id ".
                    "LEFT JOIN ".$db."encabezado_reportes AS r ON r.id > 0 ".
                    "WHERE t2.year =".$year." AND t.type = ".$typeReport." LIMIT 1";
        $params	= [
            'R_ID_MATRIC'	=> intval($id),
            'R_type'		=> intval($type)
        ];

        if($typeReport == 2 ) {
            $params['R_PERIODO']    = $per;
            $params['R_GRADO']      = $Grado;
            $params['R_ESCALA']     = RatingScale::getScaleString($Grado, $year, $db);
        }

        $path       = "{$school->folder_name}";
        return (new JReportModel())->getReportExport($report,$report,$format,$query,$path, $school->database_name, $params);
    }

    public static function getEnrollmentSheet (Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db     = "{$school->database_name}.";
        $id	    = $request->input('pdbId') ?? 0;
        $year	= $request->input('pdbYear');
        $format	= $request->input('pFormat');
        $type	= $request->input('pdbType');
        $Grado 	= $request->input('pdbGrado');
        $Grupo	= $request->input('pdbGrupo');
        $Jorn 	= $request->input('pdbJorn');
        $Sede	= $request->input('pdbSede');

        if(!$id > 0 ){
            $year	= $request->input('year');
        }

        $query = DB::table($db.'config001', 't1')
                ->select('ficha_mat_x_año')
                ->leftJoin($db.'grados_agrupados AS t2', 't1.id_grupo_grados', '=', 't2.id')
                ->leftJoin($db.'aux_grados_agrupados AS t3', 't3.id_grado_agrupado','=' ,'t2.id')
                ->leftJoin($db.'grados AS tg', 't3.id_grado','=' ,'tg.id')
                ->where('t1.year', $year)
                ->where('tg.id', $Grado)
                ->first();

        $ficha = 0;
        if ($query){
            $ficha = $query->ficha_mat_x_año;
        }
        //Reporte a Procesar: Este nombre es del reporte creado en JasReport

        if ($ficha > 0){
            $report			=	'ficha_matricula';
        }else{
            $report			=	'ficha_matricula2';
        }
        // Nombre dado al informe de salida
        $report_export	= 'Ficha de matricula';

        //Extension de Salida
        if ($id > 0){
            $m_SQL	= "CALL ".$db."sp_select_ficha_matricula('".$year."','".$id."',0,'".$Grupo."',1,1,".$type.")";
        }else{
            $m_SQL	= "CALL ".$db."sp_select_ficha_matricula('".$year."',0,'".$Grado."','".$Grupo."','".$Sede."','".$Jorn."',".$type.")";
        }

        $query	    = $m_SQL;
        $path       = "{$school->folder_name}";
        return (new JReportModel())->getReportExport($report,$report_export,$format,$query,$path, $school->database_name);
    }
}
