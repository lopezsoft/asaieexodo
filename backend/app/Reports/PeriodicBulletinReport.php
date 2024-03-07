<?php

namespace App\Reports;
use App\Common\BuildReportsPDF;
use App\Common\MessageExceptionResponse;
use App\Core\JReportModel;
use App\Modules\Courses\RatingScale;
use App\Modules\Grades\GradesQuery;
use App\Modules\School\SchoolQueries;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class PeriodicBulletinReport
{
    public static function getPeriodicBulletin(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $format	    = $school->format;
            $db         = $school->db;
            $year       = $school->year;
            $gradoId	= $request->input('pdbCodGrado')	;
            $headquarterId	= $request->input('pdbIdSede')	;
            $period	= $request->input('pdbPeriodo');
            $groupCode  = $request->input('pdbGrupo');
            $studyDayId	= $request->input('pdbIdJorn');
            $matric		= $request->input('pdbMatric');
            $hojaReport	= $request->input('pHojaReport');
            $typeReport	= $request->input('pTypeReport');

            $gradesCount= GradesQuery::getGradeCount($school, $gradoId);
            $notaPrees	= 0;
            if($gradesCount){
                $notaPrees = $gradesCount->notas_num_prees;
            }
            if(($gradoId <=4) AND ($notaPrees == 0)) {
                if($hojaReport == 1){
                    $reportName			= 'boletin_oficio_preescolar';
                    $reportDescription	= 'boletin oficio preescolar periodo'.$period;
                }else{
                    $reportName			= 'boletin_carta_preescolar';
                    $reportDescription	= 'boletin carta preescolar periodo'.$period;
                }
            }else{
                $report_mapping = array(
                    2 => array(
                        1 => array('boletin_oficio_asig', 'boletin oficio asignaturas'.$period),
                        2 => array('boletin_carta_asig', 'boletin carta asignaturas'.$period),
                    ),
                    3 => array(
                        1 => array('boletin_oficio_areas_comp', 'boletin oficio areas competencia'.$period),
                        2 => array('boletin_carta_areas_comp', 'boletin carta areas competencia'.$period),
                    ),
                    4 => array(
                        1 => array('boletin_oficio_areas_proy', 'boletin oficio proy transversales'.$period),
                        2 => array('boletin_carta_areas_proy', 'boletin carta proy transversales'.$period),
                    ),
                    5 => array(
                        1 => array('boletin_oficio_areas2', 'boletin oficio areas'.$period),
                        2 => array('boletin_carta_areas2', 'boletin carta areas'.$period),
                    ),
                    6 => array(
                        1 => array('boletin_oficio_asig2', 'boletin oficio asignaturas'.$period),
                        2 => array('boletin_carta_asig2', 'boletin carta asignaturas'.$period),
                    ),
                    9 => array(
                        1 => array('boletin_oficio_areas3', 'boletin oficio areas'.$period),
                        2 => array('boletin_carta_areas3', 'boletin carta areas'.$period),
                    ),
                    10 => array(
                        1 => array('preinforme_oficio', 'preinforme '.$period),
                        2 => array('preinforme_carta', ' preinforme '.$period),
                    ),
                    11 => array(
                        1 => array('boletin_oficio_sin_notas', 'Boletin sin notas '.$period),
                        2 => array('boletin_oficio_sin_notas_carta', ' Boletin sin notas '.$period),
                    ),
                    'default' => array(
                        1 => array('boletin_oficio_areas', 'boletin oficio areas'.$period),
                        2 => array('boletin_carta_areas', 'boletin carta areas'.$period),
                    ),
                );

                if (isset($report_mapping[$typeReport])) {
                    $reportName = $report_mapping[$typeReport][$hojaReport][0];
                    $reportDescription = $report_mapping[$typeReport][$hojaReport][1];
                } else {
                    $reportName = $report_mapping['default'][$hojaReport][0];
                    $reportDescription = $report_mapping['default'][$hojaReport][1];
                }
            }

            $query      = "CALL {$db}sp_boletines_reportes({$headquarterId},{$gradoId},'{$groupCode}',{$studyDayId},{$year},{$period},{$matric})";
            $queryp     = DB::Table("{$db}configboletin")->first();
            $escala	    = RatingScale::getScaleString($gradoId, $year, $db);
            $params = [
                'R_ESCALA'		=> $escala,
                'R_MSG_IND'		=> $queryp->activeindica ?? 0,
                'R_MSG_ACT'		=> $queryp->activamsg ?? 0
            ];
            // Pre informe
            if ($typeReport == 10) {
                $studentList    = DB::select($query);
                $formatSize     = "Letter";
                if($hojaReport == 1){
                    $formatSize = "Legal";
                }
                $reportView     = "reports.bulletin.pre-report";
                $fileDescription= 'Pre informe escolar periodic '.$period;
                $pdfBuilder     = new BuildReportsPDF($reportView, $fileDescription, $school);
                $params	= [
                    'year'              => $year,
                    'db'                => $db,
                    'studentList'       => $studentList,
                    'ratingScale'       => $escala,
                    'allPer'            => false,
                    'onlyAreas'         => false,
                    'isAreaDistributed' => false,
                    'isPreSchool'       => false,
                ];
                return $pdfBuilder->build($params, ['mode' => 'utf-8', 'format' => $formatSize]);
            }
            $path       = "{$school->path}";
            return (new JReportModel())->getReportExport($reportName,$reportDescription,$format,$query,$path, $school->school, $params);
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }
}
