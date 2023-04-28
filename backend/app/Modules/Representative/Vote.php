<?php

namespace App\Modules\Representative;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Vote{
    use MessagesTrait;
    public static function insertVotes($request) {
        $school    = SchoolQueries::getSchoolRequest($request);
        $db        = $school->db;
        $limit  = $request->input('limit') ?? 15;
        $enrollment_id = $request->input('enrollment_id');
        $id = $request->input('profileId');
        $candidate_id = $request->input('candidate_id');
        $polling_station_id = $request->input('polling_station_id');
        $candidacy_id = $request->input('candidacy_id');
        $type = $request->input('type');
        $year = $request->input('year');
        $queryMesa = null;
        $query = DB::table("{$db}student_enrollment")
            ->where('id', $enrollment_id)
            ->get();
        if ($query->count() > 0) {
            $query = DB::table("{$db}student_enrollment")->get();
            if ($query->count() > 0) {// hay datos en la tabla
                //mesa existe
                $queryMesa = DB::table("{$db}tp_polling_stations")
                ->where('id', $polling_station_id)
                ->where('year', $year)
                ->get();
                if ($queryMesa) {
                    $queryMesa = DB::table("{$db}tp_polling_stations")
                    ->where('state', 2)
                    ->get();
                    if ($queryMesa) {//mesa activa
                        $queryVoto = DB::table("{$db}tp_votes")
                        ->where('year', $year)
                        ->where('enrollment_id', $enrollment_id)//identificación de inscripción
                        ->where('candidacy_id', $candidacy_id)
                        ->get();
                        if ($queryVoto) {
                            if($queryVoto->count() == 0) {
                                if($type == 1) { // White vote
                                    $data = [
                                        "year" =>$year,
                                        "white_vote_id" => $candidate_id,
                                        "enrollment_id" => $enrollment_id,
                                        "candidacy_id" => $candidacy_id,
                                        "polling_station_id" => $polling_station_id,
                                    ];
                                    DB::table("{$db}tp_aux_white_vote")->insert($data);
                                } else {
                                    $data = [
                                        "year" =>$year,
                                        "candidate_id" => $candidate_id,
                                        "enrollment_id" => $enrollment_id,
                                        "candidacy_id" => $candidacy_id,
                                        "polling_station_id" => $polling_station_id,
                                    ];
                                    DB::table("{$db}tp_aux_candidate_votes")->insert($data);
                                }
                                $data = [
                                    "year" =>$year,
                                    "enrollment_id" => $enrollment_id,
                                    "candidacy_id" => $candidacy_id,
                                    "attempts" => 1,
                                    "state" => 5,
                                ];
                                DB::table("{$db}tp_votes")->insert($data);
                                $request = array(
                                    'success' => true,
                                    'state' => 5,
                                    'mensaje' => "Se realizo el proceso de voto correctamente"
                                );
                                $request = json_encode($request);
                            } else { // Si el estudiante ya habia relizado el voto y lo intenta de nuevo
                                DB::table("{$db}tp_votes")->where('id', $queryVoto->first()->id)->limit(1)->increment('attempts');
                                $request = array(
                                    'success' => true,
                                    'state' => 0,
                                    'mensaje' => "Usted ya habia relizado el voto"
                                );
                                $request = json_encode($request);
                            }
                        } else {
                            $request = array(
                                'success' => false,
                                'state' => 2,
                                'mensaje' => "numero de identificacion no corresponde con candidato y año"
                            );
                        }
                    } else {
                        $request = array(
                            'success' => false,
                            'state' => 3,
                            'mensaje' =>"la mesa no esta activa"
                        );
                    }
                } else {
                    $request = array(
                        'success' => false,
                        'mensaje' => "los datos de la mesa no concuerdan"
                    );
                }
            } else {
                $request = array(
                    'success' => true,
                    'mensaje' => "Sin datos en el sistema"
                );
            }
        } else {
            $request = array(
                'success' => false,
                'state' => 0,
                'mensaje' => "El estudiante por quien voto no esta matriculado"
            );
        }
        $request = json_encode($request);
        return self::getResponse(['records' => $request,'success' => true]);
	}
}

