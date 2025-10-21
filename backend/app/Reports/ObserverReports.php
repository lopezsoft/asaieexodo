<?php

namespace App\Reports;

use App\Common\BuildReportsPDF;
use App\Common\MessageExceptionResponse;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ObserverReports
{
    public static function getObserverSheet(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $year       = $school->year;
            $db         = $school->db;
            $Matric	    = $request->input('pdbMatric');

            $obs_modelos_observador = DB::table("{$db}obs_modelos_observador")
                ->select('id')
                ->where('estado', 1)
                ->first();
            $type = $obs_modelos_observador->id ?? 3;
            if ($type === 5) {
                return self::getObserver5($request, $school);
            }

            $observerData   = DB::table("{$db}obs_modelos_observador_cuerpo","t1")
                                ->leftJoin("{$db}obs_modelos_observador AS t2", "t1.id_observador", "=", "t2.id")
                                ->selectRaw('t1.*')
                                ->where("t2.estado", 1)
                                ->first();
            if (!$observerData){
                throw new \RuntimeException("No se encontró el modelo de observador", 404);
            }
            $studentData    = CallExecute::execute("{$db}sp_select_datos_observador(?, ?, ?)", [$year, $Matric, 3]);
            if(count($studentData) === 0){
                throw new \RuntimeException("No se encontró el estudiante", 404);
            }
            $studentData        = $studentData[0];
            $studentItems       = CallExecute::execute("{$db}sp_select_criterios_obs_m3(?, ?)", [$year, $Matric]);
            if(count($studentItems) === 0){
                throw new \RuntimeException("No se encontraron los aspectos y criterios del estudiante", 404);
            }
            $studentAnnotations     = CallExecute::execute("{$db}sp_select_canotaciones_obs_m3(?, ?)", [$year, $Matric]);
            $groupDirectorSignature = CallExecute::execute("{$db}sp_firma_dir_grupo(?, ?, ?, ?, ?)",
                [$school->headquarter, $school->grade, $school->group, $school->workingDay, $year]);

            $studentName    = $studentData->nombres;
            $enrollmentCode = Str::padLeft($studentData->id_matric, 10, '0');
            $studentIdentity= "{$studentData->abrev_doc} No. {$studentData->nro_doc_id} - CÓDIGO MATRICULA: {$enrollmentCode}";
            $body	        = $observerData->cuerpo;
            $body	        = str_replace(array("{P_NAME_STUDENT}", "{P_DOCUMENT}"), array($studentName, $studentIdentity), $body);

            $image	= 'assets/img/avatars/unknown_carnets.png';
            $avatar	= $studentData->avatar;
            if(!empty($avatar)){
                $image	= $avatar;
            }
            $params	= [
                'observerBody'		=> $body,
                'observerData'		=> $observerData,
                'image'				=> $image,
                'studentData'		=> $studentData,
                'year'				=> $year,
                'items'				=> $studentItems,
                'annotations'		=> $studentAnnotations,
                'groupDirectorSignature'    => count($groupDirectorSignature) > 0 ? $groupDirectorSignature[0] : null
            ];
            $fileDescription= 'Ficha del observador';
            $pdfBuilder     = new BuildReportsPDF("reports.observer.observer-mod3", $fileDescription, $school);
            return $pdfBuilder->build($params);
        }catch (Exception $e){
            return MessageExceptionResponse::response($e);
        }
    }

    private static function getObserver5(Request $request, object $school)
    {
        try {
            $year   = $school->year;
            $format = $school->format;
            $Matric = $request->input('pdbMatric');

            $query              = "";
            $fileName           = "ficha_observador_mod5";
            $fileDescription    = "Ficha del observador";
            $params = [
                'P_YEAR'        => $year,
                'P_ID_MATRIC'   => $Matric,
                'P_HEADQUARTER' => $school->headquarter,
                'P_GRADE'       => $school->grade,
                'P_GROUP'       => $school->group,
                'P_WORKING_DAY' => $school->workingDay
            ];
            return (new JReportModel())->getReportExport($fileName, $fileDescription, $format,$query, $school->path, $school->school, $params);
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }
}
