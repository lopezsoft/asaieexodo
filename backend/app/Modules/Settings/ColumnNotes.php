<?php

namespace App\Modules\Settings;

use App\Modules\School\SchoolQueries;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ColumnNotes
{
    public static function getGroupByGrades($school, $gradeId): \Illuminate\Support\Collection
    {
        $db     = $school->db;
        $year   = $school->year;
        return DB::table("{$db}columnas_notas_competencias as t1")
            ->select(DB::raw("t1.*, CONCAT('n',numero_column) as name_column"))
            ->leftJoin("{$db}competencias as tc", 't1.id_competencia', '=', 'tc.id_pk')
            ->leftJoin("{$db}grados_agrupados as t2", 'tc.id_grado_agrupado', '=', 't2.id')
            ->leftJoin("{$db}aux_grados_agrupados as t3", 't3.id_grado_agrupado', '=', 't2.id')
            ->where('tc.year', $year)
            ->where('t3.id_grado', $gradeId)
            ->orderBy('t1.id_competencia')
            ->orderBy('t1.tipo')
            ->orderBy('t1.numero_column')
            ->get();
    }
    /**
     * @throws \Exception
     */
    public static function getCompetenciesExists(Request $request): JsonResponse
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
    public static function getCompetencies(Request $request): JsonResponse
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
}
