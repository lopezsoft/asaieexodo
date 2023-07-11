<?php

namespace App\Modules\Courses;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class RatingScaleBuild
{
    public static function query($db, $year): Builder
    {
        return DB::table($db."desempeños","td")
            ->join($db.'grados_agrupados AS t1', 'td.id_grado_agrupado','=','t1.id')
            ->join($db.'aux_grados_agrupados AS t2', 't2.id_grado_agrupado','=','t1.id')
            ->where('td.year', $year);
    }

    public static function addGrade(Builder $builder, $gradeId): Builder
    {
        return $builder->where('t2.id_grado', '=', $gradeId);
    }
}
