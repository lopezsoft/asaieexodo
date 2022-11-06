<?php

namespace App\Modules\Courses;

use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RatingScale
{
    public static function getScaleString($grade, $year, $db): string {
        $query  = DB::table($db."desempeños AS td")
            ->selectRaw('td.id_pk,td.desde,td.hasta, t2.nombre_escala, t2.abrev')
            ->leftJoin($db.'grados_agrupados AS t1', 'td.id_grado_agrupado','=','t1.id')
            ->leftJoin($db.'escala_nacional AS t2', 'td.id_escala','=','t2.id')
            ->leftJoin($db.'aux_grados_agrupados AS ta', 'ta.id_grado_agrupado','=','t1.id')
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
