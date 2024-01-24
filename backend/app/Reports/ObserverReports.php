<?php

namespace App\Reports;

use App\Common\BuildReportsPDF;
use App\Common\HttpResponseMessages;
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

            $observerData   = DB::table("{$db}obs_modelos_observador_cuerpo","t1")
                                ->leftJoin("{$db}obs_modelos_observador AS t2", "t1.id_observador", "=", "t2.id")
                                ->selectRaw('t1.*')
                                ->where("t2.estado", 1)
                                ->first();
            if (!$observerData){
                throw new Exception("No se encontró el modelo de observador");
            }
            $studentData    = CallExecute::execute("{$db}sp_select_datos_observador(?, ?, ?)", [$year, $Matric, 3]);
            if(count($studentData) === 0){
                throw new Exception("No se encontró el estudiante");
            }
            $studentData        = $studentData[0];
            $studentItems       = CallExecute::execute("{$db}sp_select_criterios_obs_m3(?, ?)", [$year, $Matric]);
            if(count($studentItems) === 0){
                throw new Exception("No se encontraron los aspectos y criterios del estudiante");
            }
            $studentAnnotations     = CallExecute::execute("{$db}sp_select_canotaciones_obs_m3(?, ?)", [$year, $Matric]);
            $groupDirectorSignature = CallExecute::execute("{$db}sp_firma_dir_grupo(?, ?, ?, ?, ?)",
                [$school->headquarter, $school->grade, $school->group, $school->workingDay, $year]);

            $studentName    = $studentData->nombres;
            $enrollmentCode = Str::padLeft($studentData->id_matric, 10, '0');
            $studentIdentity= "{$studentData->abrev_doc} No. {$studentData->nro_doc_id} - CÓDIGO MATRICULA: {$enrollmentCode}";
            $body	        = $observerData->cuerpo;
            $body	        = str_replace("{P_NAME_STUDENT}",$studentName, $body);
            $body	        = str_replace("{P_DOCUMENT}",$studentIdentity, $body);

            $image	= 'assets/img/avatars/unknown_carnets.png';
            $avatar	= $studentData->avatar;
            if($avatar || $avatar != ''){
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
            return HttpResponseMessages::getResponse500([
                'message'   => $e->getMessage(),
                'line'      => $e->getLine(),
            ]);
        }
    }
}
