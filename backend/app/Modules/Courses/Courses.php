<?php

namespace App\Modules\Courses;

use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Courses
{
    use MessagesTrait;
    public static function getActiveCourse($courseId, $db){
        $sql    = DB::table("{$db}cursos")->where('id', $courseId)->first();
        $result	= $courseId;
        if($sql){
            if ($sql->estado == 0){
                $qry	= DB::table("{$db}cursos")
                    ->where('id_sede', $sql->id_sede)
                    ->where('id_grado', $sql->id_grado)
                    ->where('id_asig', $sql->id_asig)
                    ->where('id_jorn', $sql->id_jorn)
                    ->where('year', $sql->year)
                    ->where('estado', 1)
                    ->where('grupo', "{$sql->grupo}")
                    ->first();
                if ($qry){
                    $result	= $qry->id;
                }
            }
        }
        return $result;
    }
    public static function getCoursesByNotes(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $year       = $request->input('year');
            $grade      = $request->input('pdbGrado') ?? 0;
            $group      = $request->input('pdbGrupo') ?? 0;
            $jorn       = $request->input('pdbJorn') ?? 0;
            $headquarter= $request->input('pdbSede') ?? 0;
            $query      = DB::select("call {$db}sp_select_cursos_notas(?,?,?,?,?)", [$headquarter, $jorn, $grade, $group, $year]);
            return self::getResponse([
                'records' => [
                    'data' => $query,
                ]]);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
    public static function getSubjectsByYear(Request $request): JsonResponse
    {
        $year   = $request->input('year') ?? Date('Y');
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db     = "{$school->database_name}";
        $limit  = $request->input('limit') ?? 15;
        $search = $request->input('query') ?? null;
        $query  = DB::table($db.'.aux_asignaturas AS t1');
        $query->leftJoin($db.'.areas AS t2', 't1.id_area', '=', 't2.id');
        $query->leftJoin($db.'.asignaturas AS t3', 't1.id_asign', '=' , 't3.id_pk');
        $query->where('t1.year', $year);

        if($search) {
            $query->where(function($row) use ($search) {
                $row->where('t3.asignatura', 'like', "%{$search}%");
                $row->orWhere('t2.area', 'like', "%{$search}%");
            });
        }
        $query->orderBy('t2.area');
        $query->orderBy('t3.asignatura');
        $query->select('t1.*','t2.area','t3.asignatura');

        return self::getResponse([
            'records' => $query->paginate($limit)
        ]);
    }

    public static function getCourses(Request $request): array
    {
        $grade  = $request->input('pdbGrado') ?? 0;
        $year   = $request->input('year') ?? Date('Y');
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $fun	= "{$school->database_name}.sp_select_cursos_grado ( ?, ? )";
        $param	= [$year, $grade];
        return CallExecute::execute($fun, $param);
    }

    public static function getSubjectsByCourses(Request $request): array
    {
        $grade  = $request->input('pdbGrado') ?? 0;
        $year   = $request->input('year') ?? Date('Y');
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $fun	= "{$school->database_name}.sp_select_matcurso ( ?, ? )";
        $param	= [$grade, $year];
        return CallExecute::execute($fun, $param);
    }

}
