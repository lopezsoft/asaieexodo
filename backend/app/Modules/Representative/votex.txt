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
        $msg = "";
        $msg6="";
        $msg7="";
        $msg5="";

        $query = DB::table("{$db}student_enrollment")
            ->where('id', $enrollment_id)
            ->get();

        if ($query->count() > 0) {
            $mensaje = "El estudiante está matriculado";
            $query = DB::table("{$db}student_enrollment")->get();
            if ($query->count() > 0) {
                $msg = 1; // hay datos en la tabla

                //mesa existe
                $queryMesa = DB::table("{$db}tp_polling_stations")
                ->where('id', $polling_station_id)
                ->where('year', $year)
                ->get();

                if ($queryMesa) {
                    $msg3 = "mesa existe";

                    $queryMesa = DB::table("{$db}tp_polling_stations")
                    ->where('state', 2)
                    ->get();
                    if ($queryMesa) {
                        $msg4 = "la mesa está activa";
                        $queryVoto = DB::table("{$db}tp_votes")
                        ->where('year', $year)
                        ->where('enrollment_id', $enrollment_id)//identificación de inscripción
                        ->where('candidacy_id', $candidacy_id)
                        ->get();

                        if ($queryVoto) {
                            $msg5="pasó";
                             /**
						 * Se verifica si el votante no ha relizado el proceso del voto para evitar
						 * duplicidad de votos y se realiza el proceso de insert.
						 */
                            if($queryVoto->count() == 0) {
                                if($type == 1) { // White vote
                                    $data = [
                                        "year"                  => $year,
                                        "white_vote_id"         => $candidate_id,
                                        "enrollment_id"         => $enrollment_id,
                                        "candidacy_id"          => $candidacy_id,
                                        "polling_station_id"    => $polling_station_id,
                                    ];
                                    DB::table("{$db}tp_aux_white_vote")->insert($data);
                                    return $msg6 = "voto en blanco?";
                                }

                            } else {

                                return $msg6 = "que paso?";
                            }

                          } else {
                            return $msg5 = "número de identificacion no corresponde con candidato y año";
                          }


                    } else {

                        $msg4 = "la mesa no está activa";
                    }

                } else {

                    $msg3 = "los datos de la mesa no concuerdan";
                }

            } else {
                $msg = "Sin datos en el sistema"; // no hay datos en la tabla
            }

        } else {
            $mensaje = "El estudiante no está matriculado";
        }

        $data =[
            // $mensaje,
            // $msg,
            // $msg3,
            $msg4,
            $msg5,
            $msg6
        ];






        // return self::getResponse(['records' => $data,'success' => true]);
        return self::getResponse(['records' => $data,'success' => true]);






	}
}
