<?php

namespace App\Models\School;


use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudyLevels
{
    use MessagesTrait;
    public static function query(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db     = "$school->database_name.";
        $sede   = $request->input('sede');
        $query  = DB::table($db.'niveles_sedes AS t1')
            ->leftJoin($db.'niveles_estudio AS t2', 't1.id_nivel', '=' ,'t2.id')
            ->leftJoin($db.'sedes AS t3', 't1.id_sede', '=' ,'t3.id' )
            ->select('t1.*', 't2.nombre_nivel AS nivel', 't3.headquarters_name AS sede')
            ->where('t1.id_sede', $sede);
        return self::getResponse(['records' => $query->paginate()]);
    }
}
