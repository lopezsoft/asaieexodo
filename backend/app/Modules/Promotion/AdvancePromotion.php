<?php

namespace App\Modules\Promotion;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Support\Facades\DB;

class AdvancePromotion{
    use MessagesTrait;
    public static function getAdvancePromotion($request){

        try {
             $school = SchoolQueries::getSchoolRequest($request);
            $db = $school->db;
            $year = $request->input('year');
            $limit  = $request->input('limit') ?? 15;

            $query = DB::table("{$db}promoted_header AS tp")
             ->leftJoin("{$db}inscripciones AS te", "tp.student_id", "=", "te.id")
             ->leftJoin("{$db}grados AS tg", "tp.grade_id", "=", "tg.id")
             ->leftJoin("{$db}jornadas AS tj", "tp.studyday_id", "=", "tj.cod_jorn")
             ->leftJoin("{$db}sedes AS ts", "tp.headq_id", "=", "ts.ID")
             ->selectRaw("tp.*, CONCAT(RTRIM(te.apellido1), ' ', RTRIM(te.apellido2), ' ', RTRIM(te.nombre1), ' ', RTRIM(te.nombre2)) AS nombres, RTRIM(tg.grado) AS grado, RTRIM(tj.jornada) AS jornada, RTRIM(ts.headquarters_name) AS sede")
             ->where("tp.year", "=", $year)
             ->orderBy("tp.grade_id")
             ->orderBy("nombres");



        return self::getResponse(['records' => $query->paginate($limit),'success' => true]);

        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }


    }




}

// consulta buena
// SELECT tp.*,
//        CONCAT(RTRIM(te.apellido1), ' ', RTRIM(te.apellido2), ' ',
//               RTRIM(te.nombre1), ' ', RTRIM(te.nombre2)) AS nombres,
//        RTRIM(tg.grado) grado,
//        RTRIM(tj.jornada) jornada,
//        RTRIM(ts.headquarters_name) sede
// FROM asaie_exodo.promoted_header AS tp
// LEFT JOIN asaie_exodo.inscripciones AS te ON tp.student_id = te.id
// LEFT JOIN asaie_exodo.grados AS tg ON tp.grade_id = tg.id
// LEFT JOIN asaie_exodo.jornadas AS tj ON tp.studyday_id = tj.cod_jorn
// LEFT JOIN asaie_exodo.sedes AS ts ON tp.headq_id = ts.ID
// WHERE tp.year = 2018
// ORDER BY tp.grade_id, nombres;
