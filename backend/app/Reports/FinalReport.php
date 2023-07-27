<?php

namespace App\Reports;
use App\Common\BuildReportsPDF;
use App\Core\JReportModel;
use App\Models\WatermarkFile;
use App\Modules\Courses\RatingScale;
use App\Modules\Grades\SchoolLevel;
use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
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
        $mod	    = $request->input('pdbModelo');
        $dist	    = $request->input('pdbDistrib');
        $levelId    = SchoolLevel::getLevelId($db, $school->grade);
        $paperSize  = 'letter';
        $formatSize = "Letter";
        $reportView = "reports.certificates.final-certificate";
        $isPreSchool= ($levelId == 1);
        if ($h == '1'){
            $formatSize = "Legal";
            $paperSize  = 'legal';
        }
        if ($levelId > 1){
            if ($dist == 1){
                //$report	= 'certificado_final_carta_distri';
                $query	= "CALL {$db}sp_select_areasf(".$year.",".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$one.",".$dist.")";
            }else{
                // Solo Áreas
                if ($tp == 1){
                    $query	= "CALL {$db}sp_select_areasf_agrupada(".$year.",".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$one.")";
                }else{
                    $query	= "CALL {$db}sp_select_areasf(".$year.",".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$one.",0)";
                }
            }
        }else{
            $periodo = 5;
            $query	= sprintf("SELECT periodo FROM %speriodos_academicos AS td "."
                            JOIN %sgrados_agrupados AS t1 ON td.id_grado_agrupado = t1.id "."
                            JOIN %saux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id "."
                            WHERE td.year = %s AND t2.id_grado = %s "."
                            ORDER BY td.periodo DESC LIMIT 1", $db, $db, $db, $year, $school->grade);
            $query	= DB::select($query);

            if(count($query) > 0){
                $periodo = $query[0]->periodo;
            }
            $query	    = 	"CALL {$db}sp_boletines_reportes(".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$year.",'".$periodo."',".$one.")";
        }
        $type	= 4;
        $up		= sprintf("INSERT INTO %scertificate_numbers(id_parent,year,total,type) SELECT id,%s,1,1 FROM ".
                        "%sconfig_const_cert_end WHERE type = %d LIMIT 1 ON DUPLICATE KEY UPDATE total=total + 1",
                        $db, $year, $db, $type);
        DB::statement($up);
        $sql	= "SELECT t.*, RIGHT(CONCAT('0000000',t2.total),7) cons, t2.year, r.logo, r.escudo, r.pie ".
                        "FROM ".$db."config_const_cert_end AS t ".
                        "JOIN ".$db."certificate_numbers AS t2 ON t2.id_parent = t.id ".
                        "JOIN ".$db."encabezado_reportes AS r ON r.id > 0 ".
                        " WHERE ".$year." BETWEEN t.year_from AND t.year_until AND t2.year =".$year." AND t.type = ".
                        $type." LIMIT 1";
        DB::statement($sql);
        $header         = CallExecute::execute("{$db}sp_header_final_certificate(?, ?)", [$year, 4]);

        $studentList    = DB::select($query);

        $watermark      = WatermarkFile::query()
                            ->where('school_id', $school->id)
                            ->whereRaw("JSON_EXTRACT(`settings`, '$.available_in') = '1' OR
                            JSON_EXTRACT(`settings`, '$.available_in') = '4'")
                            ->whereRaw("JSON_EXTRACT(`settings`, '$.paper_size') = '".$paperSize."'")
                            ->where('state', 1)
                            ->first();

        $fileDescription= 'Certificado final';
        $pdfBuilder     = new BuildReportsPDF($reportView, $fileDescription, $school);
        if($watermark){
            $pdfBuilder->setWatermarkImage($watermark->url);
            $pdfBuilder->setShowWatermarkImage(true);
            $pdfBuilder->setShowFooter(($watermark->hide_footer === '0'));
        }
        $params	= [
            'isPreSchool'       => $isPreSchool,
            'watermark'         => $watermark,
            'model'             => $mod,
            'year'              => $year,
            'db'                => $db,
            'onlyAreas'         => ($tp == 1) ,
            'studentList'       => $studentList,
            'certificateHeader' => $header[0],
            'ratingScale'       => RatingScale::getScaleString($school->grade, $year, $db)
        ];
        return $pdfBuilder->build($params, ['mode' => 'utf-8', 'format' => $formatSize]);
    }

    /**
     * @throws \Exception
     */
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
            $query	= "CALL {$db}sp_select_areasf(".$year.",".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$one.",0)";
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
            $query	= "CALL {$db}sp_boletines_reportes(".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$year.",'".$periodo."',".$one.")";
        }
        $report_export	= 'Informe final';
        $params         = [
            'R_ESCALA'  => RatingScale::getScaleString($school->grade, $year, $db)
        ];
        return (new JReportModel())->getReportExport($report,$report_export,$school->format,$query,$school->path, $school->school, $params);
    }
}
