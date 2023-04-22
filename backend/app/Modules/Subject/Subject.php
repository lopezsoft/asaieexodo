<?php

namespace App\Modules\Subject;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Subject
{
    use MessagesTrait;
    /**
     * @throws \Exception
     */
    public static function getSubjectCertificate(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $table  = "{$db}asignaturas_certificados";
        $query   = DB::table("$table")
                    ->where('id_asig_padre', $request->input('pdbId') ?? 0 );
        return self::getResponse([
            'records' => $query->paginate($school->limit)
        ]);
    }

}
