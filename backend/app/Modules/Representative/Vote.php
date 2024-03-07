<?php

namespace App\Modules\Representative;

use App\Common\HttpResponseMessages;
use App\Common\MessageExceptionResponse;
use App\Modules\School\SchoolQueries;
use App\Services\Representative\RepresentativeValidatorService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
class Vote{

    public static function validateVoteCode(Request $request, $code): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            $year   = $school->year;
            $query  = DB::table("{$db}student_enrollment", "tm")
                ->selectRaw("tm.id, tm.id_grade, tm.id_group, tm.id_state, tm.id_headquarters, tm.id_student, tm.id_study_day, tm.year,
                TRIM(CONCAT(RTRIM(ti.apellido1), ' ', RTRIM(ti.apellido2), ' ', RTRIM(ti.nombre1), ' ', RTRIM(ti.nombre2))) AS names")
                ->join("{$db}inscripciones AS ti", 'ti.id', '=', 'tm.id_student')
                ->where('tm.id', $code)
                ->first();
            if (!$query) {
                throw new Exception("El código($code) no está asignado a ningún estudiante.", 404);
            }
            if ($query->id_state != 2) {
                throw new Exception("El estudiante no tiene matricula activa.", 400);
            }
            RepresentativeValidatorService::panelControlValidator($db);
            $station    = self::getStation($request, $db);
            $degree     = DB::table("{$db}tp_degrees_per_table")
                ->where('polling_station_id', $station->id)
                ->where('grade_id', $query->id_grade)
                ->first();
            if (!$degree) {
                throw new Exception("El estudiante no pertenece a la mesa.", 404);
            }
            // Validar si el estudiante ya ha votado
            $queryVoto = DB::table("{$db}tp_votes")
                ->where('year', $year)
                ->where('enrollment_id', $query->id)
                ->first();
            if ($queryVoto) {
                throw new Exception("El estudiante ya ha realizado el proceso de votación.", 400);
            }
            return HttpResponseMessages::getResponse([
                'message'   => "Validación de código de exitosa",
                'student'   => $query
            ]);
        }catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function insertVotes($request): JsonResponse
    {
        try {
            $school    = SchoolQueries::getSchoolRequest($request);
            $db        = $school->db;
            $year      = $school->year;
            RepresentativeValidatorService::panelControlValidator($db);
            $station            = self::getStation($request, $db);
            $enrollment_id      = $request->input('enrollmentId');
            $query      = DB::table("{$db}student_enrollment")
                                ->where('id', $enrollment_id)
                                ->first();
            if (!$query) {
                throw new Exception("El estudiante no existe.", 404);
            }
            $candidates = json_decode($request->input('candidates')) ?? [];
            if (count($candidates) == 0) {
                throw new Exception("No hay candidatos seleccionados.", 404);
            }
            DB::beginTransaction();
            foreach ($candidates as $candidate) {
                $queryVoto = DB::table("{$db}tp_votes")
                    ->where('year', $year)
                    ->where('enrollment_id', $enrollment_id)
                    ->where('candidacy_id', $candidate->candidacy_id)
                    ->first();
                if ($queryVoto) {
                    throw new Exception("El estudiante ya ha realizado el proceso de votación.", 400);
                }
                $data = [
                    "year"              => $year,
                    "enrollment_id"     => $enrollment_id,
                    "candidacy_id"      => $candidate->candidacy_id,
                    "polling_station_id"=> $station->id,
                ];
                if($candidate->type == 1) { // White vote
                    $data = array_merge(["white_vote_id" => $candidate->candidate_id], $data);
                    DB::table("{$db}tp_aux_white_vote")->insert($data);
                } else {
                    $data = array_merge(["candidate_id" => $candidate->candidate_id], $data);
                    DB::table("{$db}tp_aux_candidate_votes")->insert($data);
                }
                $data = [
                    "year"          =>$year,
                    "enrollment_id" => $enrollment_id,
                    "candidacy_id"  => $candidate->candidacy_id,
                    "attempts"      => 1,
                    "state"         => 1,
                ];
                DB::table("{$db}tp_votes")->insert($data);
            }
            DB::commit();
            return HttpResponseMessages::getResponse([
                'message'   => "Votos registrados",
            ]);
        }catch (Exception $e) {
            DB::rollBack();
            return MessageExceptionResponse::response($e);
        }
	}

    public static function openVoting(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            RepresentativeValidatorService::panelControlValidator($db);
            // Validar si la mesa existe y si está cerrada.
            $id     = $request->input('pdbPolingStationId') ?? 0;
            self::getStation($request, $db);
            // Genera un UUID para la mesa
            $uuid   = Str::uuid();
            $start  = date('Y-m-d H:i:s');
            // Actualiza la mesa con el UUID y la fecha de inicio
            $extraData = [
                'uuid'  => $uuid,
                'start' => $start,
                'end'   => null,
                'ip'    => null,
                'agent' => null,
                'path'  => "/#/voting/{$id}/{$school->id}/{$uuid}",
            ];
            DB::table("{$db}tp_polling_stations")
                ->where('id', $id)
                ->update([
                    'start_time'    => $start,
                    'state'         => 2,
                    'extra_data'    => json_encode($extraData),
                ]);
            return HttpResponseMessages::getResponse([
                'message'   => "Mesa abierta",
                'extraData' => $extraData,
            ]);
        }catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function closeVoting(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $station    = self::getStation($request, $db);
            $extraData  = json_decode($station->extra_data);
            if (!$extraData){
                throw new Exception("Datos de la mesa incorrectos", 400);
            }
            if ($extraData->end) {
                throw new Exception("La mesa ya está cerrada", 400);
            }
            $uuid      = $request->input('uuid');
            if ($uuid != $extraData->uuid) {
                throw new Exception("Identificador de la mesa incorrecto.", 400);
            }
            $end    = date('Y-m-d H:i:s');
            $extraData->end = $end;
            DB::table("{$db}tp_polling_stations")
                ->where('id', $station->id)
                ->update([
                    'closing_time'  => $end,
                    'state'         => 0,
                    'extra_data'    => json_encode($extraData),
                ]);
            return HttpResponseMessages::getResponse([
                'message'   => "Mesa cerrada",
                'extraData' => $extraData,
            ]);
        }catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }
    public static function getVotingData(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $currentYear= $school->year;
            $validate   = RepresentativeValidatorService::panelControlValidator($db);
            $id         = $request->input('id') ?? 0;
            $query      = self::getStation($request, $db);
            $extraData = json_decode($query->extra_data);
            if (!$extraData){
                throw new Exception("Datos de la mesa incorrectos", 400);
            }
            if (!$extraData->ip) {
                $extraData->ip      = $request->ip();
                $extraData->agent   = $request->header('User-Agent');
                DB::table("{$db}tp_polling_stations")
                    ->where('id', $id)
                    ->update([
                        'extra_data'    => json_encode($extraData),
                    ]);
            } else if ($extraData->ip != $request->ip()) {
                throw new Exception("La mesa esta siendo usada por otro dispositivo", 400);
            }
            $uuid      = $request->input('uuid');
            if ($uuid != $extraData->uuid) {
                throw new Exception("Identificador de la mesa incorrecto.", 400);
            }
            if ($extraData->end) {
                throw new Exception("La mesa ya está cerrada", 400);
            }
            $votingData = DB::table("{$db}tp_candidates AS tp")
                ->selectRaw("tp.availability_status, tp.id AS candidate_id, tp.enrollment_id, tp.candidacy_id, tp.number, tp.image, tp.type,
                    tc.candidacy_name, tm.id_grade, tm.id_group AS group_name, RTRIM(tg.grado) AS grado,
                    TRIM(CONCAT(RTRIM(ti.apellido1), ' ', RTRIM(ti.apellido2), ' ', RTRIM(ti.nombre1), ' ', RTRIM(ti.nombre2))) AS names")
                ->leftJoin("{$db}student_enrollment AS tm", 'tp.enrollment_id', '=', 'tm.id')
                ->leftJoin("{$db}inscripciones AS ti", 'tm.id_student', '=', 'ti.id')
                ->leftJoin("{$db}tp_candidacies AS tc", 'tp.candidacy_id', '=', 'tc.id')
                ->leftJoin("{$db}grados AS tg", 'tm.id_grade', '=', 'tg.id')
                ->where('tp.year', '=',  $currentYear)
                ->where('tm.id_state', '=', 2)
                ->where('tm.year', '=',  $currentYear)
                ->union(DB::table("{$db}tp_white_vote AS tp")
                    ->selectRaw("0 AS availability_status, tp.id AS candidate_id, 0 AS enrollment_id, tp.candidacy_id, '00' AS number, tp.image, tp.type,
                        tc.candidacy_name, 0 AS id_grade, '00' AS group_name, '' AS grado,
                        tp.names")
                    ->leftJoin("{$db}tp_candidacies AS tc", 'tp.candidacy_id', '=', 'tc.id')
                    ->where('tp.year', '=',  $currentYear))
                ->orderBy('candidacy_id')
                ->orderBy('id_grade')->get();

            return HttpResponseMessages::getResponse([
                'message'       => "Datos de la mesa",
                'validate'      => $validate,
                'station'       => $query,
                'votingData'    => $votingData,
            ]);
        }catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    /**
     * @throws Exception
     */
    private static function getStation($request, $db): object
    {
        $id         = $request->input('id') ?? $request->input('pdbPolingStationId') ?? 0;
        $station   = DB::table("{$db}tp_polling_stations")
            ->where('id', $id)
            ->first();
        if (!$station) {
            throw new Exception("La mesa no existe", 404);
        }
        if ($station->state == 0) {
            throw new Exception("La mesa esta cerrada", 400);
        }
        return $station;
    }
}

