<?php

namespace App\Models\School;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkingDay
{
    use MessagesTrait;
    public static function query(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db     = "$school->database_name.";
        $sede   = $request->input('sede');
        $query  = DB::table($db.'jornadas_sedes AS t1')
                        ->leftJoin($db.'jornadas AS t2', 't1.id_jornada', '=' ,'t2.cod_jorn')
                        ->leftJoin($db.'sedes AS t3', 't1.id_sede', '=' ,'t3.id' )
                        ->select('t1.*', 't2.jornada', 't3.headquarters_name AS sede')
                        ->where('t1.id_sede', $sede);
        return self::getResponse(['records' => $query->paginate()]);
    }
}
