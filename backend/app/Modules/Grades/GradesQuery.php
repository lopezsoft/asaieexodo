<?php

namespace App\Modules\Grades;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradesQuery
{
    use MessagesTrait;
    public static function getGroups(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db	    = $school->database_name;
        $year   = $request->input('year') ?? Date('Y');
        $query  = DB::table("{$db}.config001")->where('year', $year)->first();
        $value	= [];
        if ($query) {
            if ($query->grupo == 1){
                for ($i=1; $i < 16; $i++) {
                    $value[]	= array(
                        'grupo'		=> str_pad($i, 2, "00", STR_PAD_LEFT)
                    );
                };
            }else{
                $value [] = array(
                    'grupo' => 'A'
                );
                $value [] = array(
                    'grupo' => 'B'
                );
                $value [] = array(
                    'grupo' => 'C'
                );
                $value [] = array(
                    'grupo' => 'D'
                );
                $value [] = array(
                    'grupo' => 'E'
                );
                $value [] = array(
                    'grupo' => 'F'
                );
                $value [] = array(
                    'grupo' => 'G'
                );
                $value [] = array(
                    'grupo' => 'H'
                );
                $value [] = array(
                    'grupo' => 'I'
                );
                $value [] = array(
                    'grupo' => 'J'
                );

                $value [] = array(
                    'grupo' => 'K'
                );
                $value [] = array(
                    'grupo' => 'L'
                );
                $value [] = array(
                    'grupo' => 'M'
                );
                $value [] = array(
                    'grupo' => 'N'
                );
                $value [] = array(
                    'grupo' => 'O'
                );
            }
        }
        return self::getResponse([
            'records' => [
                'data' => $value
            ]
        ]);
    }

    public static function getSelectGrades(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db	    = $school->database_name;

        $query  = DB::table("{$db}.grados AS tg");
        $query->leftJoin("{$db}.niveles_estudio AS t2", "tg.id_nivel" ,"=", "t2.id");
        $headq  = $request->input("pdbSede") ?? null;
        $search = $request->input("query") ?? null;
        if (!empty($headq)) {
            $query->leftJoin("{$db}.niveles_sedes AS tn", 'tg.id_nivel','=', 'tn.id_nivel');
            $query->where('tn.id_sede', $headq);
        }

        if(isset($search) && !empty($search)) {
            $query->where('tg.grado', $search);
            $query->orWhere('tg.cod_grado', $search);
        }
        $query->select('tg.*', 't2.nombre_nivel');
        $query->orderBy('tg.cod_grado', 'asc');
         return self::getResponse([
             'records' => $query->paginate(24)
         ]);
    }
}
