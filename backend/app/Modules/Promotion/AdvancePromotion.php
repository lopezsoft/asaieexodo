<?php

namespace App\Modules\Promotion;

use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdvancePromotion{
    use MessagesTrait;
    public static function getAdvancePromotion($request): JsonResponse
    {

        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            $year   = $school->year;
            $limit  = $school->limit;

            $query = DB::table("{$db}promoted_header AS tp")
             ->join("{$db}inscripciones AS te", "tp.student_id", "=", "te.id")
             ->join("{$db}grados AS tg", "tp.grade_id", "=", "tg.id")
             ->join("{$db}jornadas AS tj", "tp.studyday_id", "=", "tj.cod_jorn")
             ->join("{$db}sedes AS ts", "tp.headq_id", "=", "ts.ID")
             ->selectRaw("tp.*, CONCAT(RTRIM(te.apellido1), ' ', RTRIM(te.apellido2), ' ', RTRIM(te.nombre1), ' ', RTRIM(te.nombre2)) AS nombres, RTRIM(tg.grado) AS grado, RTRIM(tj.jornada) AS jornada, RTRIM(ts.headquarters_name) AS sede")
             ->where("tp.year", "=", $year)
             ->orderBy("tp.grade_id")
             ->orderBy("nombres");

        return self::getResponse(['records' => $query->paginate($limit)]);
        }catch (\Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
    public static function getFinalLeveling(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            $params = [
                $school->year,
                $request->input('pdbDocente') ?? CoursesOfTeacher::getTeacherId($db),
                1
            ];
            return self::getResponse(['records' => [
                'data' => CallExecute::execute("{$db}sp_select_respeciales_docente(?,?,?)", $params)
            ]]);
        }catch (Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
}


