<?php

namespace App\Excel;

use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExcelExport
{
    /**
     * @throws \Exception
     */
    public static function getConsolidatedWithoutNotes(Request $request): JsonResponse
    {
        try {
            $user           = $request->user();
            $school         = SchoolQueries::getSchoolRequest($request);
            $fileDescription= "Consolidado de Matrícula";
            $query          = CallExecute::execute("{$school->db}sp_select_estudiantes_sin_notas( ? )", [$school->year]);
            $headers        = [
                'ESTUDIANTE',
                'GRADO',
                'GRUPO',
                'JORNADA',
                'SEDE',
                'ASIGNATURA',
                'AREA',
                'FINAL',
                'DOCENTE',
                'PERIODO',
            ];
            $data           = (Object) [
                'headers'       => $headers,
                'collection'    => $query,
            ];
            return ExcelManager::storeToS3($data , $fileDescription, $school, $user);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    /**
     * @throws \Exception
     */
    public static function getConsolidatedEnrollment(Request $request): JsonResponse
    {
        try {
            $user           = $request->user();
            $school         = SchoolQueries::getSchoolRequest($request);
            $fileDescription= "Consolidado de Matrícula";
            $query          = CallExecute::execute("{$school->db}sp_select_consolidado_matricula( ? )", [$school->year]);
            $headers        = [
                'ESTADO',
                'PRIMER APELLIDO',
                'SEGUNDO APELLIDO',
                'PRIMER NOMBRE',
                'SEGUNDO NOMBRE',
                'SEXO',
                'GRUPO SANGRE RH',
                'FECHA DE NACIMIENTO',
                'EDAD',
                'SISBEN',
                'ESTRATO',
                'IPS',
                'DIRECCIÓN',
                'ZONA',
                'DOCUMENTO',
                'TIPO DOCUMENTO',
                'TELÉFONO',
                'CÓDIGO GRADO',
                'GRADO',
                'GRUPO',
                'JORNADA',
                'SEDE',
                'AÑO',
                'POBLACIÓN VICTIMA CONFLICTO',
                'COD FAMILIAS EN ACCIÓN',
                'Nº CARNÉ SISBEN',
            ];
            $data           = (Object) [
                'headers'       => $headers,
                'collection'    => $query,
            ];
            return ExcelManager::storeToS3($data , $fileDescription, $school, $user);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }
}
