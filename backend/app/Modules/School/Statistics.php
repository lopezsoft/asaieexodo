<?php

namespace App\Modules\School;

use App\Common\HttpResponseMessages;
use App\Common\MessageExceptionResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class Statistics
{
    public static function getStudentsEnrolled(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $year       = $school->year;
            $m = DB::table($db.'student_enrollment')
                ->where('id_state', 2)
                ->where('year', $year)
                ->count();

            $r = DB::table($db.'student_enrollment')
                ->where('id_state', '>', 2)
                ->where('year', $year)
                ->count();

            $d = DB::table($db.'docentes AS t1')
                ->leftJoin($db.'aux_docentes AS t2', 't2.id_docente', '=', 't1.id_docente')
                ->where('t1.estado', 1)
                ->where('t2.year', $year)
                ->count();

            return HttpResponseMessages::getResponse([
                'registered'    => $m,
                'retired'       => $r,
                'teachers'      => $d
            ]);
        }catch (Exception $e){
            return MessageExceptionResponse::response($e);
        }
    }

    public static function getRegisteredByYear(Request $request): JsonResponse
    {
        try {
            return self::getStudentTotal($request, '=');
        }catch (Exception $e){
            return MessageExceptionResponse::response($e);
        }
    }

    public static function getRetiredByYear(Request $request): JsonResponse
    {
        try {
            return self::getStudentTotal($request, '>');
        }catch (Exception $e){
            return MessageExceptionResponse::response($e);
        }
    }

    /**
     * @throws Exception
     */
    private static function getStudentTotal(Request $request, string $operator): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $result = DB::table($db.'student_enrollment')
                ->select(DB::raw('COUNT(id) AS total, year'))
                ->where('id_state', $operator,2)
                ->groupBy('year')
                ->get();
            return HttpResponseMessages::getResponse([
                'records'   => [
                    'data'  => $result,
                    'total' => $result->count(),
                ]
            ]);
        }catch (Exception $e){
            throw new Exception($e->getMessage());
        }
    }

    public static function getTeachersByYear(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $result = DB::table($db.'docentes AS td')
                ->leftJoin($db.'aux_docentes AS t2', 't2.id_docente', '=', 'td.id_docente')
                ->select(DB::raw('COUNT(td.id_docente) AS total, t2.year'))
                ->where('td.estado', 1)
                ->groupBy('t2.year')
                ->get();

            return HttpResponseMessages::getResponse([
                'records'   => [
                    'data'  => $result,
                    'total' => $result->count(),
                ]
            ]);
        }catch (Exception $e){
            return MessageExceptionResponse::response($e);
        }
    }
}
