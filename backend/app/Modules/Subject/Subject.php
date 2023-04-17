<?php

namespace App\Modules\Subject;

use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Subject
{
    use MessagesTrait;


    // public static function createSubjectCertificate(Request $request): \Illuminate\Http\JsonResponse{

    //     $limit  = $request->input('limit') ?? 15;
    //     $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
    //     $db     = $school->database_name;
    //     $year   = $request->input('year') ?? Date('Y');
    //     $table  = 'asignaturas_certificados';

    //     // $idSubject = DB::table("$db.asignaturas")->where('id', $id)->first();
    //     $query   = DB::table("$db.asignaturas")
    //                 ->select('id', 'asignatura');

    //     $asignatura_certificado = DB::table("$db.$table")
    //         ->insert([
    //                 // 'id_asig_padre' => $idSubject,
    //                 'nombre'        => $request->input('nombre'),
    //                 'abrev'         => $request->input('abrev'),
    //                 'ih'            => $request->input('ih'),
    //                 'estado'        => $request->input('estado'),
    //                 ]);
    //     return self::getResponse([
    //         'records' => $query->paginate($limit),
    //         'result'  => $asignatura_certificado
    //         ]);
    // }

    public static function getSubject(Request $request): \Illuminate\Http\JsonResponse
    {
        $limit  = $request->input('limit') ?? 15;
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db     = "{$school->database_name}";
        $year   = $request->input('year') ?? Date('Y');
        $table  = 'asignaturas_certificados';
        $query   = DB::table("$db.$table")
                    ->select('id', 'id_asig_padre', 'nombre', 'abrev', 'ih', 'estado');
        return self::getResponse([
            'records' => $query->paginate($limit)
            ]);
    }

}
