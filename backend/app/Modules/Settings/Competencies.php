<?php

namespace App\Modules\Settings;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Competencies
{
    use MessagesTrait;
    public static function getCompetenciesByGroupGrades($school, $gradeId): \Illuminate\Support\Collection
    {
        $db     = $school->db;
        $year   = $school->year;
        return DB::table("{$db}competencias AS t1")
            ->select('t1.id_pk', 't1.id', 't1.competencia', 't1.porcentaje', 't1.year')
            ->leftJoin("{$db}grados_agrupados AS t2", 't1.id_grado_agrupado', '=', 't2.id')
            ->leftJoin("{$db}aux_grados_agrupados AS t3", 't3.id_grado_agrupado', '=', 't2.id')
            ->where('t1.year', '=', $year)
            ->where('t3.id_grado', '=', $gradeId)
            ->where('t1.calificable', '=', 1)
            ->where('t1.id', '>', 0)
            ->orderBy('t1.id')
            ->get();
    }
    /**
     * @throws \Exception
     */
    public static function getColumnsNotesCompetenciesExists(Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $id     = $request->input('pdbGroupGradeId');
        $query  = DB::table("{$db}competencias", "t1")
                    ->selectRaw("t2.*")
                    ->leftJoin("{$db}columnas_notas_competencias AS t2", "t2.id_competencia", "=", "t1.id_pk")
                    ->whereRaw("t2.id_competencia = t1.id_pk")
                    ->where("t1.id_grado_agrupado", $id)
                    ->where("t1.year", $school->year);

        return self::getResponse([
            'records' => $query->paginate(30)
        ]);
    }
    /**
     * @throws \Exception
     */
    public static function getColumnsNotesCompetencies(Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $id     = $request->input('pdbId');
        $query  = DB::table("{$db}columnas_notas_competencias")
                    ->selectRaw("*, CONCAT('#',numero_column) name")
                    ->where("id_competencia", $id);

        return self::getResponse([
            'records' => $query->paginate()
        ]);
    }
    /**
     * @throws \Exception
     */
    public static function getCompetencies(Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $query  = DB::table("{$db}competencias", "td")
                    ->selectRaw("td.*, t1.nombre_grado_agrupado")
                    ->leftJoin("{$db}grados_agrupados AS t1", "td.id_grado_agrupado", "=", "t1.id")
                    ->where("td.year", $school->year)
                    ->orderByRaw("td.year, td.id_grado_agrupado, td.id");

        return self::getResponse([
            'records' => $query->paginate()
        ]);
    }
}
