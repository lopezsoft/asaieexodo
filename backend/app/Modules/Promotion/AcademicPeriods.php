<?php

namespace App\Modules\Promotion;

use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicPeriods
{
    /**
     * @throws \Exception
     */
    public static function getPeriods(Request $request): \Illuminate\Http\JsonResponse {
        $school = SchoolQueries::getSchoolRequest($request);
        $db	    = $school->db;
        $year   = $school->year;
        $type   = $request->input('pdbType') ?? "5";
        $grado  = $request->input('pdbGrado');
        $query = match ($type) {
            "1" => DB::table($db . 'periodos_academicos', 't1')
                ->selectRaw('t1.*, t2.nombre_grado_agrupado')
                ->leftJoin($db . 'grados_agrupados AS t2', 't1.id_grado_agrupado', '=', 't2.id')
                ->where('t1.year', $year)
                ->orderBy('t2.nombre_grado_agrupado')
                ->orderBy('t1.periodo'),
            "2" => DB::table($db . 'periodos_academicos', 't1')
                ->select('t1.periodo')
                ->where('t1.year', $year)
                ->groupBy(['t1.periodo', 't1.year'])
                ->orderBy('t1.periodo'),
            default => DB::Table($db . 'periodos_academicos', 't1')
                ->selectRaw('t1.*, t2.nombre_grado_agrupado')
                ->leftJoin($db . 'grados_agrupados AS t2', 't1.id_grado_agrupado', '=', 't2.id')
                ->leftJoin($db . 'aux_grados_agrupados AS t3', 't3.id_grado_agrupado', '=', 't2.id')
                ->where('t1.year', $year)
                ->where('t3.id_grado', $grado)
                ->orderBy('t2.nombre_grado_agrupado')
                ->orderBy('t1.periodo'),
        };

        return self::getResponse([
            'records' => $query->paginate()
        ]);
    }

    public static function getPeriodsTotal($school, $gradeId = 5): ?object
    {
        $db     = $school->db;
        $year   = $school->year;
        return DB::table($db."periodos_academicos","td")
            ->selectRaw("COUNT(periodo) total")
            ->join($db."grados_agrupados AS t1", "td.id_grado_agrupado", "=", "t1.id")
            ->join($db."aux_grados_agrupados AS t2", "t2.id_grado_agrupado", "=", "t1.id")
            ->where( "td.year", $year)
            ->where( "td.estado", 1)
            ->where("t2.id_grado", $gradeId)
            ->groupByRaw('td.id_grado_agrupado')
            ->first();
    }
    public static function getLastPeriod($school, $gradeId = 5): ?object
    {
        $db     = $school->db;
        $year   = $school->year;
        return DB::table($db."periodos_academicos","td")
            ->select("td.periodo")
            ->join($db."grados_agrupados AS t1", "td.id_grado_agrupado", "=", "t1.id")
            ->join($db."aux_grados_agrupados AS t2", "t2.id_grado_agrupado", "=", "t1.id")
            ->where( "td.year", $year)
            ->where( "td.estado", 1)
            ->where("t2.id_grado", $gradeId)
            ->first();
    }
    public static function getClosingDates($school, $gradeId = 5, $period   = 1): ?object
    {
        $db     = $school->db;
        $year   = $school->year;
        return DB::table($db."periodos_academicos","td")
            ->select("td.fecha_cierre", "td.fecha_cierre_nivelacion")
            ->join($db."grados_agrupados AS t1", "td.id_grado_agrupado", "=", "t1.id")
            ->join($db."aux_grados_agrupados AS t2", "t2.id_grado_agrupado", "=", "t1.id")
            ->where( "td.year", $year)
            ->where( "td.periodo", $period)
            ->where( "td.estado", 1)
            ->where("t2.id_grado", $gradeId)
            ->first();
    }
}
