<?php

namespace App\Modules\Settings;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Competencies
{
    use MessagesTrait;
    public static function getColumnsNotesCompetenciesExists(Request $request): \Illuminate\Http\JsonResponse
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

    public static function getColumnsNotesCompetencies(Request $request): \Illuminate\Http\JsonResponse
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

    public static function getCompetencies(Request $request): \Illuminate\Http\JsonResponse
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
