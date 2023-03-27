<?php

namespace App\Modules\Student;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Families
{
    use MessagesTrait;
    public static function getFamiliesStudent(Request $request): \Illuminate\Http\JsonResponse
    {
        $pdbIdStudent   = $request->input('pdbIdStudent') ?? 0;
        $school         = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db             = "{$school->database_name}.";

        $query  = DB::table($db.'families', 't1')
                        ->select('t2.*', "t1.document","t1.address", "t1.mobile", "t3.name_kinship", "t4.family_type_name")
                        ->selectRaw("CONCAT(RTRIM(lastname1),' ',RTRIM(lastname2),' ',RTRIM(name1),' ',RTRIM(name2)) AS nombres")
                        ->leftJoin($db.'aux_families_students AS t2', 't2.id_family','=', 't1.id')
                        ->leftJoin($db.'family_relationships AS t3', 't2.id_relationship', '=', 't3.id')
                        ->leftJoin($db.'family_type AS t4', 't2.id_type', '=', 't4.id')
                        ->where('t2.id_student', $pdbIdStudent)
                        ->orderBy('nombres')
                        ->orderBy('t2.id_student');
        return self::getResponse([
            'records' => $query->paginate()
        ]);
    }
}
