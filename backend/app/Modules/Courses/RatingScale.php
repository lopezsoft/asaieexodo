<?php

namespace App\Modules\Courses;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RatingScale
{
    use MessagesTrait;
    public static function getGroupByGrades($school, $gradeId): \Illuminate\Support\Collection
    {
        $db     = $school->db;
        $year   = $school->year;
        return DB::table("{$db}desempeños AS t1")
            ->select('t1.id', 't1.id_escala', 't1.desde', 't1.hasta', 't1.reprueba', 't4.color', 't4.nombre_escala', 't4.mensaje', 't4.abrev')
            ->join("{$db}grados_agrupados AS t2", 't1.id_grado_agrupado', '=', 't2.id')
            ->join("{$db}aux_grados_agrupados AS t3", 't3.id_grado_agrupado', '=', 't2.id')
            ->join("{$db}escala_nacional AS t4", 't1.id_escala', '=', 't4.id')
            ->where('t1.year', '=', $year)
            ->where('t3.id_grado', '=', $gradeId)
            ->orderBy('t1.id')
            ->get();
    }
    public static function getRatingScaleMin($school, $gradeId = 5): ?object
    {
        $db     = $school->db;
        return DB::table($db."desempeños","td")
            ->selectRaw('td.desde, td.hasta')
            ->join($db.'grados_agrupados AS t1', 'td.id_grado_agrupado','=','t1.id')
            ->join($db.'aux_grados_agrupados AS t2', 't2.id_grado_agrupado','=','t1.id')
            ->where('td.year', $school->year)
            ->where('td.id', 2)
            ->where('t2.id_grado', $gradeId)
            ->first();
    }
    public static function getRatingScaleReproved($school, $gradeId = 5): ?object
    {
        $db     = $school->db;
        return DB::table($db."desempeños","td")
            ->selectRaw('td.desde, td.hasta')
            ->join($db.'grados_agrupados AS t1', 'td.id_grado_agrupado','=','t1.id')
            ->join($db.'aux_grados_agrupados AS t2', 't2.id_grado_agrupado','=','t1.id')
            ->where('td.year', $school->year)
            ->where('td.reprueba', 1)
            ->where('t2.id_grado', $gradeId)
            ->first();
    }

    /**
     * @throws \Exception
     */
    public static function getRatingScale(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $query  = DB::table($db."desempeños","td")
            ->selectRaw('td.*, t1.nombre_grado_agrupado, t2.nombre_escala, t2.abrev')
            ->join($db.'grados_agrupados AS t1', 'td.id_grado_agrupado','=','t1.id')
            ->join($db.'escala_nacional AS t2', 'td.id_escala','=','t2.id')
            ->where('td.year', $school->year)
            ->orderByRaw("td.year, td.id_grado_agrupado, td.id");
        return self::getResponse([
            'records' => $query->paginate()
        ]);
    }

    public static function getScaleString($grade, $year, $db): string {
        $query  = DB::table($db."desempeños AS td")
            ->selectRaw('td.id_pk,td.desde,td.hasta, t2.nombre_escala, t2.abrev')
            ->join($db.'grados_agrupados AS t1', 'td.id_grado_agrupado','=','t1.id')
            ->join($db.'escala_nacional AS t2', 'td.id_escala','=','t2.id')
            ->join($db.'aux_grados_agrupados AS ta', 'ta.id_grado_agrupado','=','t1.id')
            ->where('ta.id_grado', $grade)
            ->where('td.year', $year)
            ->where('td.id', '>', 0)
            ->orderBy('td.year')
            ->orderBy('ta.id_grado_agrupado')
            ->orderBy('td.id');

        $query	= $query->get();
        $request = "";
        if ($query) {
            foreach($query as $row){
                $request.= $row->nombre_escala."(".$row->abrev.")".': '
                    .abs($row->desde).' - '.abs($row->hasta).'  ';
            }
        }

        return $request;
    }
}
