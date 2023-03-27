<?php

namespace App\Reports;
use App\Core\JReportModel;
use App\Modules\Courses\RatingScale;
use App\Modules\Grades\GradesQuery;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class PeriodicBulletinReport
{
    use MessagesTrait;
    public static function getPeriodicBulletin(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $format	    = $school->format;
            $db         = $school->db;
            $year       = $school->year;
            $c_grado	= $request->input('pdbCodGrado')	;
            $id_sede	= $request->input('pdbIdSede')	;
            $periodo	= $request->input('pdbPeriodo');
            $grupo		= $request->input('pdbGrupo');
            $cod_jorn	= $request->input('pdbIdJorn');
            $matric		= $request->input('pdbMatric');
            $hojaReport	= $request->input('pHojaReport');
            $typeReport	= $request->input('pTypeReport');

            $get_prees	= GradesQuery::getGradeCount($school, $c_grado);

            if($get_prees){
                $notaPrees = $get_prees->notas_num_prees;
            }
            if(($c_grado <=4) AND ($notaPrees == 0)) {
                if($hojaReport == 1){
                    $report			= 'boletin_oficio_preescolar';
                    $report_export	= 'boletin oficio preescolar periodo'.$periodo;
                }else{
                    $report			= 'boletin_carta_preescolar';
                    $report_export	= 'boletin carta preescolar periodo'.$periodo;
                }
            }else{
                switch($typeReport){
                    case 2 :   				// Modelo 2
                        if($hojaReport == 1){
                            $report			= 'boletin_oficio_asig';
                            $report_export	= 'boletin oficio asignaturas'.$periodo;
                        }else{
                            $report			= 'boletin_carta_asig';
                            $report_export	= 'boletin carta asignaturas'.$periodo;
                        }
                        break;
                    case 3 :   				// Modelo 3
                        if($hojaReport == 1){
                            $report			= 'boletin_oficio_areas_comp';
                            $report_export	= 'boletin oficio areas competencia'.$periodo;
                        }else{
                            $report			= 'boletin_carta_areas_comp';
                            $report_export	= 'boletin carta areas competencia'.$periodo;
                        }
                        break;
                    case 4 :   				// Modelo 4
                        if($hojaReport == 1){
                            $report			= 'boletin_oficio_areas_proy';
                            $report_export	= 'boletin oficio proy transversales'.$periodo;
                        }else{
                            $report			= 'boletin_carta_areas_proy';
                            $report_export	= 'boletin carta proy transversales'.$periodo;
                        }
                        break;
                    case 5 :   				// Modelo 5
                        if($hojaReport == 1){
                            $report			= 'boletin_oficio_areas2';
                            $report_export	= 'boletin oficio areas'.$periodo;
                        }else{
                            $report			= 'boletin_carta_areas2';
                            $report_export	= 'boletin carta areas'.$periodo;
                        }
                        break;
                    case 6 :   				// Modelo 6
                        if($hojaReport == 1){
                            $report			= 'boletin_oficio_asig2';
                            $report_export	= 'boletin oficio asignaturas'.$periodo;
                        }else{
                            $report			= 'boletin_carta_asig2';
                            $report_export	= 'boletin carta asignaturas'.$periodo;
                        }
                        break;
                    case 9	: // Modelo áreas samac
                        if($hojaReport == 1){
                            $report			= 'boletin_oficio_areas3';
                            $report_export	= 'boletin oficio areas'.$periodo;
                        }else{
                            $report			= 'boletin_carta_areas3';
                            $report_export	= 'boletin carta areas'.$periodo;
                        }
                        break;
                    case 10	: // Modelo áreas samac
                        if($hojaReport == 1){
                            $report			= 'preinforme_oficio';
                            $report_export	= 'preinforme '.$periodo;
                        }else{
                            $report			= 'preinforme_carta';
                            $report_export	= ' preinforme '.$periodo;
                        }
                        break;
                    case 11	: // Modelo áreas samac
                        if($hojaReport == 1){
                            $report			= 'boletin_oficio_sin_notas';
                            $report_export	= 'Boletin sin notas '.$periodo;
                        }else{
                            $report			= 'boletin_oficio_sin_notas_carta';
                            $report_export	= ' Boletin sin notas '.$periodo;
                        }
                        break;
                    default: 		// Modelo 1
                        if($hojaReport == 1){
                            $report			= 'boletin_oficio_areas';
                            $report_export	= 'boletin oficio areas'.$periodo;
                        }else{
                            $report			= 'boletin_carta_areas';
                            $report_export	= 'boletin carta areas'.$periodo;
                        }
                        break;
                }
            }

            $query  = "CALL ".$db."`sp_boletines_reportes`(".$id_sede.",'".$c_grado."','".$grupo."',".$cod_jorn.",".$year.",".$periodo.",".$matric.")";
            $queryp = DB::Table("{$db}configboletin")
                        ->first();
            $active		= $queryp->activeindica ?? 0;
            $active_msg	= $queryp->activamsg ?? 0;
            $escala	    = RatingScale::getScaleString($c_grado, $year, $db);
            $params = array(
                'R_ESCALA'		=> $escala,
                'R_MSG_IND'		=> $active,
                'R_MSG_ACT'		=> $active_msg
            );

            $path       = "{$school->path}";
            return (new JReportModel())->getReportExport($report,$report_export,$format,$query,$path, $school->school, $params);
        } catch (\Exception $e) {
            return self::getResponse500([
                'error' => $e->getMessage()
            ]);
        }
    }
}
