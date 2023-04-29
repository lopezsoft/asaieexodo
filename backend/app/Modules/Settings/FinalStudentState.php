<?php

namespace App\Modules\Settings;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinalStudentState
{
    use MessagesTrait;

    /**
     * @throws \Exception
     */
    public static function getFinalStudentState(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $query  = DB::table($db.'estado_estudiante','a')
                    ->selectRaw('a.*, b.nombre_grado_agrupado')
                    ->leftJoin($db.'grados_agrupados AS b', 'a.id_grupo_grados','=','b.id');

        return self::getResponse([
            'records' => $query->paginate()
        ]);
    }
}
