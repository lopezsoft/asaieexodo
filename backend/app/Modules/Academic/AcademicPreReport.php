<?php

namespace App\Modules\Academic;

use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Queries\CallExecute;
use App\Queries\TablesQuery;
use App\Queries\UpdateTable;
use App\Traits\MessagesTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class AcademicPreReport
{
    use MessagesTrait;
    public static function get(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $year       = $school->year;
            $grado      = $request->pdbGrado;
            $grupo      = $request->pdbGrupo;
            $periodo    = $request->pdbPeriodo;
            $curso      = $request->pdbCurso;

            $param	= [
                $curso,
                $periodo,
                $grado,
                $grupo,
                $year,
            ];
            return self::getResponse([
                'records' => [
                    'data'  => CallExecute::execute($db.'sp_select_preinforme_all (?, ?, ?, ?, ?)', $param)
                ]
            ]);
        }catch (\Exception $e){
            return self::getResponse500([
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
        }
    }

    public static function update(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $grado      = $request->pdbGrado;
            $table      = $db.TablesQuery::getTablePreInforme($grado);
            $fields     = json_decode($request->records);
            return UpdateTable::update($request, $fields, $table);
        }catch (\Exception $e){
            return self::getResponse500([
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
        }
    }
}
