<?php

namespace App\Reports;

use App\Common\BuildReportsPDF;
use App\Core\JReportModel;
use App\Models\WatermarkFile;
use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Modules\Settings\GeneralSetting;
use App\Queries\CallExecute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnrollmentReports
{
    /**
     * @throws \Exception
     */
    public static function getHonorFrame(Request $request): JsonResponse
    {
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
        return (new JReportModel())->getReportExport($report,$report_export,$format,$query,$path, $school->school);
    }

    /**
     * @throws \Exception
     */
    public static function getCertificate(Request $request, Int $typeReport): JsonResponse
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $db         = $school->db;
        $id	        = $request->input('pdbMatric');
        $year	    = $school->year;
        $currentYear= date('Y');
        $model	    = $request->input('pdbType') ?? 1;
        $per	    = $request->input('pdbPeriodo') ?? '1';
        $paperSize  = 'letter';
        $formatSize = "Letter";
        $reportView = "reports.certificates.study-constancy";
        $availableIn= '2';
        $report     = 'Constancia de estudio';

        $up		= sprintf("INSERT INTO %scertificate_numbers(id_parent,year,total,type)
                        SELECT id,%s,1,type FROM %sconfig_const_cert WHERE type = %s LIMIT 1
                        ON DUPLICATE KEY UPDATE total=total + 1", $db, $currentYear, $db, $typeReport);
        DB::select($up);

        $query = "SELECT t.*, RIGHT(CONCAT('0000000',t2.total),7) cons, t2.year, r.logo, r.escudo, r.pie ".
                    "FROM ".$db."config_const_cert AS t ".
                    "JOIN ".$db."certificate_numbers AS t2 ON t2.id_parent = t.id ".
                    "JOIN ".$db."encabezado_reportes AS r ON r.id > 0 ".
                    "WHERE t.type = t2.type AND t2.year =".$currentYear." AND t.type = ".$typeReport." LIMIT 1";
        $header     = DB::select($query)[0] ?? null;
        $studentData= CallExecute::execute($db."sp_cons_estudio(?, ?, ?)", [$year, $id , $model])[0];
        $studentNotes= null;
        if($typeReport == 2) {
            $report			= 'Certificado de estudio periodico';
            $reportView	    = "reports.certificates.periodic-certificate";
            $availableIn    = '3';
            $studentNotes   = CallExecute::execute($db."sp_select_notas_academicas_periodo_final(?, ?, ?, ?)",
                [$id, $per, $year, $school->grade]);
        }

        $watermark      = WatermarkFile::query()
                            ->where('school_id', $school->id)
                            ->whereRaw("JSON_EXTRACT(`settings`, '$.available_in') = '".$availableIn."' OR
                                            JSON_EXTRACT(`settings`, '$.available_in') = '4'")
                            ->whereRaw("JSON_EXTRACT(`settings`, '$.paper_size') = '".$paperSize."'")
                            ->where('state', 1)
                            ->first();
        $fileDescription= $report.' '.$header->cons;
        $pdfBuilder     = new BuildReportsPDF($reportView, $fileDescription, $school);
        if($watermark){
            $pdfBuilder->setWatermarkImage($watermark->url);
            $pdfBuilder->setShowWatermarkImage(true);
            $pdfBuilder->setShowFooter(($watermark->hide_footer === '0'));
        }
        $params	= [
            'title'             => $report,
            'watermark'         => $watermark,
            'year'              => $year,
            'db'                => $db,
            'studentData'       => $studentData->constancy_data,
            'certificateHeader' => $header,
            'ratingScale'       => RatingScale::getScaleString($school->grade, $year, $db),
            'studentNotes'      => $studentNotes,
        ];
        return $pdfBuilder->build($params, ['mode' => 'utf-8', 'format' => $formatSize], true);
    }

    /**
     * @throws \Exception
     */
    public static function getEnrollmentSheet (Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $id	    = $request->input('pdbId') ?? 0;
        $year	= $school->year;
        $format	= $request->input('pFormat');
        $type	= $request->input('pdbType');
        $Grado 	= $request->input('pdbGrado');
        $Grupo	= $request->input('pdbGrupo');
        $Jorn 	= $request->input('pdbJorn');
        $Sede	= $request->input('pdbSede');
        if(!$id > 0 ){
            $year	= $request->input('year');
        }
        $setting = GeneralSetting::getGeneralSettingByGrade($school, $Grado);
        $ficha = 0;
        if ($setting){
            $ficha = $setting->ficha_mat_x_año;
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
            $query	= "CALL {$db}sp_select_ficha_matricula({$year},{$id},0,'{$Grupo}',1,1,{$type})";
        }else{
            $query	= "CALL {$db}sp_select_ficha_matricula({$year},0,{$Grado},'{$Grupo}',{$Sede},{$Jorn},{$type})";
        }
        return (new JReportModel())->getReportExport($report,$report_export,$format,$query,$school->path, $school->school);
    }
}
