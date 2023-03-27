<?php

namespace App\Modules\Promotion;

use Illuminate\Support\Facades\DB;

class AcademicPeriods
{
    public static function getPeriodsTotal($school, $gradeId = 5): ?object
    {
        $db     = $school->db;
        $year   = $school->year;
        return DB::table($db."periodos_academicos","td")
            ->selectRaw("COUNT(periodo) total")
            ->leftJoin($db."grados_agrupados AS t1", "td.id_grado_agrupado", "=", "t1.id")
            ->leftJoin($db."aux_grados_agrupados AS t2", "t2.id_grado_agrupado", "=", "t1.id")
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
            ->leftJoin($db."grados_agrupados AS t1", "td.id_grado_agrupado", "=", "t1.id")
            ->leftJoin($db."aux_grados_agrupados AS t2", "t2.id_grado_agrupado", "=", "t1.id")
            ->where( "td.year", $year)
            ->where( "td.estado", 1)
            ->where("t2.id_grado", $gradeId)
            ->orderBy('td.periodo', 'desc')
            ->first();
    }
}
