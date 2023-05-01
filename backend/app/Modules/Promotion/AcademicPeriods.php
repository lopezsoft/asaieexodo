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
