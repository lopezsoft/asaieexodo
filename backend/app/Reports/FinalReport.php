<?php

namespace App\Reports;
use App\Common\BuildReportsPDF;
use App\Models\WatermarkFile;
use App\Modules\Courses\RatingScale;
use App\Modules\Grades\SchoolLevel;
use App\Modules\School\SchoolQueries;
use App\Modules\Subject\Subject;
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
        $currentYear= date('Y');
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
        $ratingScale= collect();
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
                    $ratingScale= RatingScale::getRatingByYear($school, $year);
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
        $up		= sprintf("INSERT INTO %scertificate_numbers(id_parent,year,total,type) SELECT id,%s,1,type FROM ".
                        "%sconfig_const_cert_end WHERE type = %d LIMIT 1 ON DUPLICATE KEY UPDATE total=total + 1",
                        $db, $currentYear, $db, $type);
        DB::statement($up);
        $header         = CallExecute::execute("{$db}sp_header_final_certificate(?, ?)", [$currentYear, $type]);

        $studentList    = DB::select($query);

        $subjectCertificate = Subject::getSubjectCertificateBuilder($db)
                                ->where('sc.year', $year)
                                ->get();

        $watermark      = self::getWatermark($school, $paperSize);
        $header         = $header[0];
        $fileDescription= 'Certificado final '.$header->cons;
        $pdfBuilder     = new BuildReportsPDF($reportView, $fileDescription, $school);
        if($watermark){
            $pdfBuilder->setWatermarkImageType($watermark->image_type ?? 1);
            $pdfBuilder->setWatermarkImageAlpha($watermark->opacity ?? 0.2);
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
            'certificateHeader' => $header,
            'subjectCertificate'=> $subjectCertificate,
            'scale'             => $ratingScale,
            'ratingScale'       => RatingScale::getScaleString($school->grade, $year, $db)
        ];
        return $pdfBuilder->build($params, ['mode' => 'utf-8', 'format' => $formatSize], true);
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
        $allPer	    = $request->input('pdbAllPer') ?? 2;
        $tp		    = $request->input('pdbType') ?? 2;
        $levelId    = SchoolLevel::getLevelId($db, $school->grade);
        $paperSize  = 'letter';
        $formatSize = "Letter";
        $reportView = "reports.certificates.final-report";
        $isPreSchool= ($levelId == 1);
        $ratingScale= collect();
        if ($h == '1'){
            $formatSize = "Legal";
            $paperSize  = 'legal';
        }

        if (!$isPreSchool){
            // Solo Áreas
            if ($tp == 1){
                $ratingScale= RatingScale::getRatingByYear($school, $year);
                $query	= "CALL {$db}sp_select_areasf_agrupada(".$year.",".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$one.")";
            }else{
                $query	= "CALL {$db}sp_select_areasf(".$year.",".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$one.",0)";
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
            $query	= "CALL {$db}sp_boletines_reportes(".$school->headquarter.",'".$school->grade."','".$school->group."',".$school->workingDay.",".$year.",'".$periodo."',".$one.")";
        }
        $studentList    = DB::select($query);

        $subjectCertificate = Subject::getSubjectCertificateBuilder($db)
            ->where('sc.year', $year)
            ->get();

        $watermark      = self::getWatermark($school, $paperSize);
        $fileDescription= 'Informe final de evaluacion';
        $pdfBuilder     = new BuildReportsPDF($reportView, $fileDescription, $school);
        if($watermark){
            $pdfBuilder->setWatermarkImageType($watermark->image_type ?? 1);
            $pdfBuilder->setWatermarkImageAlpha($watermark->opacity ?? 0.2);
            $pdfBuilder->setWatermarkImage($watermark->url);
            $pdfBuilder->setShowWatermarkImage(true);
            $pdfBuilder->setShowFooter(($watermark->hide_footer === '0'));
        }
        $params	= [
            'isPreSchool'       => $isPreSchool,
            'watermark'         => $watermark,
            'year'              => $year,
            'db'                => $db,
            'allPer'            => ($allPer == 2),
            'onlyAreas'         => ($tp == 1) ,
            'studentList'       => $studentList,
            'subjectCertificate'=> $subjectCertificate,
            'scale'             => $ratingScale,
            'ratingScale'       => RatingScale::getScaleString($school->grade, $year, $db)
        ];
        return $pdfBuilder->build($params, ['mode' => 'utf-8', 'format' => $formatSize], true);
    }
    private static function getWatermark($school, $paperSize): ?object {
        $watermark      = WatermarkFile::query()
                            ->where('state', 1)
                            ->where('school_id', $school->id)
                            ->first();
        if ($watermark){
           $settings = $watermark->settings;
           if (isset($settings['available_in']) && ($settings['available_in'] == 1 || $settings['available_in'] == 4) &&
               isset($settings['paper_size']) && $settings['paper_size'] == $paperSize){
               return $watermark;
           }
        }
        return null;
    }
}
