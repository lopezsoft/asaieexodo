<?php

namespace App\Modules\Representative;

use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class Representative
{
    use MessagesTrait;

    public static function getCandidates($request)
    {

        $limit  = $request->input('limit') ?? 15;
        $school    = SchoolQueries::getSchoolRequest($request);
        $db        = $school->db;
        $currentYear =  $request->input('year');
        $type   = $request->input('pdbType');
        $polingStationId = $request->input('pdbPolingStationId');
        // $polingStationId = $request->input('polling_station_id');


        if($type == 2){
            $query = DB::table("{$db}tp_candidates as tp")
            ->selectRaw('tp.*, tc.candidacy_name, tm.id_grade AS grade_id, tm.id_group AS group_name,
                tm.year, RTRIM(tg.grado) AS grade,
                CONCAT(RTRIM(ti.apellido1), " ", RTRIM(ti.apellido2), " ", RTRIM(ti.nombre1), " ", RTRIM(ti.nombre2)) AS names')
            ->leftJoin("{$db}student_enrollment as tm", 'tp.enrollment_id', '=', 'tm.id')
            ->leftJoin("{$db}inscripciones as ti", 'tm.id_student', '=', 'ti.id')
            ->leftJoin("{$db}tp_candidacies as tc", 'tp.candidacy_id', '=', 'tc.id')
            ->leftJoin("{$db}grados as tg", 'tm.id_grade', '=', 'tg.id')
            ->where('tp.year', '=',  $currentYear)
            ->where('tm.id_state', '=', 2)
            ->where('tm.year', '=',  $currentYear)
            ->orderBy('candidacy_name')
            ->orderBy('id');
        }else if($type == 1){ // Voto en blanco
            $query = DB::table("{$db}tp_white_vote as tp")
            ->selectRaw('tp.*, tc.candidacy_name')
            ->leftJoin("{$db}tp_candidacies as tc", 'tp.candidacy_id', '=', 'tc.id')
            ->where('tp.year', '=', $currentYear)
            ->orderBy('candidacy_name')
            ->orderBy('id');
        }else{

            $query = DB::table("{$db}tp_candidates AS tp")
            ->selectRaw("RAND() AS id, tp.id AS candidate_id, tp.enrollment_id, tp.candidacy_id, tp.number, tp.image, tp.type,
                tc.candidacy_name, tm.id_grade, tm.id_group AS group_name, RTRIM(tg.grado) AS grado,
                CONCAT(RTRIM(ti.apellido1), ' ', RTRIM(ti.apellido2), ' ', RTRIM(ti.nombre1), ' ', RTRIM(ti.nombre2)) AS names")
            ->leftJoin("{$db}student_enrollment AS tm", 'tp.enrollment_id', '=', 'tm.id')
            ->leftJoin("{$db}inscripciones AS ti", 'tm.id_student', '=', 'ti.id')
            ->leftJoin("{$db}tp_candidacies AS tc", 'tp.candidacy_id', '=', 'tc.id')
            ->leftJoin("{$db}grados AS tg", 'tm.id_grade', '=', 'tg.id')
            ->where('tp.year', '=',  $currentYear)
            ->where('tm.id_state', '=', 2)
            ->where('tm.year', '=',  $currentYear)
            ->whereExists(function ($query) use ($db, $polingStationId, $currentYear) {
                $query->select('*')
                    ->from("{$db}tp_degrees_per_table AS aa")
                    ->leftJoin("{$db}tp_polling_stations AS bb", 'aa.polling_station_id', '=', 'bb.id')
                    ->where('aa.polling_station_id', '=', $polingStationId)
                    ->where('aa.grade_id', '=', DB::raw('tg.id'))
                    ->where('bb.year', '=',  $currentYear);
            })
            ->union(DB::table("{$db}tp_white_vote AS tp")
                ->selectRaw("RAND() AS id, tp.id AS candidate_id, 0 AS enrollment_id, tp.candidacy_id, '00' AS number, tp.image, tp.type,
                    tc.candidacy_name, 0 AS id_grade, '00' AS group_name, '' AS grado,
                    tp.names")
                ->leftJoin("{$db}tp_candidacies AS tc", 'tp.candidacy_id', '=', 'tc.id')
                ->where('tp.year', '=',  $currentYear))
            ->orderBy('candidacy_id')
            ->orderBy('id');}

    return self::getResponse(['records' => $query->paginate($limit),'success' => true]);
}
}

