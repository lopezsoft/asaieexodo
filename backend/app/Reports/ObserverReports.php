<?php

namespace App\Reports;

use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ObserverReports
{
    /**
     * @throws \Exception
     */
    public static function getObserverSheet(Request $request): \Illuminate\Http\JsonResponse
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $year       = $school->year;
        $db         = $school->db;
        $format		= $request->input('pFormat');
        $Grado 	    = $request->input('pdbGrado');
        $Grupo	    = $request->input('pdbGrupo');
        $Jorn 	    = $request->input('pdbJorn');
        $Matric	    = $request->input('pdbMatric');
        $Sede	    = $request->input('pdbSede');
        $est        = $request->input('pdbEstudian');
        $pdbImage   = $request->input('pdbImage');
        $report     = 'ficha_observador_mod3';

        $sql        = DB::table("{$db}obs_modelos_observador_cuerpo","t1")
                        ->leftJoin("{$db}obs_modelos_observador AS t2", "t1.id_observador", "=", "t2.id")
                        ->where("t2.estado", 1)
                        ->first();
        $c_cuerpo   = "";
        if ($sql){
            $c_cuerpo	= $sql->cuerpo;
            $c_cuerpo	= str_replace("{P_NAME_STUDENT}",$est,$c_cuerpo);
        }

        $image	= 'assets/img/avatars/unknown_carnets.png';
        $params	= [
            'P_ID_MATRIC'	=> intval($Matric),
            'P_ANIO'		=> intval($year),
            'P_ID_SEDE'		=> intval($Sede),
            'P_GRADO'		=> ($Grado),
            'P_GRUPO'		=> ($Grupo),
            'P_ID_JORN'		=> intval($Jorn),
            'P_IMAGE_PROF'	=> $image,
            'R_CUERPO'		=> $c_cuerpo
        ];
        $query = "SELECT t1.encabezado,t1.cuerpo,t1.firma
				FROM ".$db."obs_modelos_observador_cuerpo AS t1
				LEFT JOIN ".$db."obs_modelos_observador AS t2 ON t1.id_observador = t2.id
				WHERE t2.estado = 1 LIMIT 1;";

        $report_export	= 'Ficha Observador';
        $path       = "{$school->school->folder_name}";
        return (new JReportModel())->getReportExport($report,$report_export,$format,$query,$path, $school->school, $params);
    }
}
