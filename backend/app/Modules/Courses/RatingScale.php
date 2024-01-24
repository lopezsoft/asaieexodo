<?php

namespace App\Modules\Courses;

use App\Common\HttpResponseMessages;
use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RatingScale
{
    public static function getRatingByYear($school, $year): \Illuminate\Support\Collection
    {
        $data = CallExecute::execute($school->db.'sp_rating_scale(?)', [$year]);
        return collect($data);
    }
    public static function getRatingScaleId($school, $gradeId, $noteValue)
    {
        $query  = RatingScaleBuild::query($school->db, $school->year)
            ->select('td.id_escala')
            ->whereRaw("{$noteValue} BETWEEN td.desde AND td.hasta");
        $query  = RatingScaleBuild::addGrade($query, $gradeId)->first();
        return $query->id_escala ?? 0;
    }
    public static function getGroupByGrades($school, $gradeId): \Illuminate\Support\Collection
    {
        $query  = RatingScaleBuild::query($school->db, $school->year)
            ->selectRaw('td.id_pk, td.id, td.id_escala, td.desde, td.hasta, td.reprueba, t4.color,
                t4.nombre_escala, t4.mensaje, t4.abrev')
            ->join("{$school->db}escala_nacional AS t4", 'td.id_escala', '=', 't4.id')
            ->orderBy('td.id');
        return RatingScaleBuild::addGrade($query, $gradeId)->get();
    }
    public static function getRatingScaleMin($school, $gradeId = 5): ?object
    {
        $query = RatingScaleBuild::query($school->db, $school->year)
            ->selectRaw('td.desde, td.hasta')
            ->where('td.id', 2);
        return RatingScaleBuild::addGrade($query, $gradeId)->first();
    }
    public static function getRatingScaleReproved($school, $gradeId = 5): ?object
    {
        $query = RatingScaleBuild::query($school->db, $school->year)
            ->selectRaw('td.desde, td.hasta')
            ->where('td.reprueba', 1);
        return RatingScaleBuild::addGrade($query, $gradeId)->first();
    }

    /**
     * @throws \Exception
     */
    public static function getRatingScale(Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $year   = $school->year;
        $query  = DB::table($db."desempeños","td")
            ->selectRaw('td.*, t1.nombre_grado_agrupado, t2.nombre_escala, t2.abrev')
            ->join($db.'grados_agrupados AS t1', 'td.id_grado_agrupado','=','t1.id')
            ->join("{$db}escala_nacional AS t2", 'td.id_escala', '=', 't2.id')
            ->where('td.year', $year)
            ->orderByRaw("td.year, td.id_grado_agrupado, td.id");
        return HttpResponseMessages::getResponse([
            'records' => $query->paginate()
        ]);
    }

    public static function getScaleString($grade, $year, $db): string {
        $query  = RatingScaleBuild::query($db, $year)
            ->selectRaw('td.id_pk,td.desde,td.hasta, t3.nombre_escala, t3.abrev')
            ->join($db.'escala_nacional AS t3', 'td.id_escala','=','t3.id')
            ->where('t2.id_grado', $grade)
            ->where('td.id', '>', 0)
            ->orderBy('td.year')
            ->orderBy('t2.id_grado_agrupado')
            ->orderBy('td.id');

        $query	= $query->get();
        $request = "";
        if ($query) {
            foreach($query as $row){
                $request.= $row->nombre_escala."(".$row->abrev.")".': '
                    .abs($row->desde).' - '.abs($row->hasta).'  ';
            }
        }

        return  utf8_decode(utf8_encode($request));
    }
}
