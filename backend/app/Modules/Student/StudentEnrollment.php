<?php

namespace App\Modules\Student;

use App\Modules\Grades\GradesQuery;
use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentEnrollment
{
    use MessagesTrait;

    /**
     * @throws \Exception
     */
    public static function oldRegistration(Request $request): JsonResponse
    {
        try {
            DB::beginTransaction();
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $list	    = json_decode($request->input('pdbList'));
            foreach ($list as $value) {
                $sqlActa    = DB::table("{$db}acta_promocion")
                                ->where('id_matric', $value->id)
                                ->first();
                if ($school->grade <= 4){
                    $in = true;
                }else{
                    $in = (bool)$sqlActa;
                }
                if($in) {
                    $sqlMat = DB::table("{$db}student_enrollment", "tm")
                                ->selectRaw("tm.*, ts.headquarters_name AS sede, ts.address AS dir_sede")
                                ->leftJoin("{$db}sedes AS ts", "tm.id_headquarters", "=", "ts.id")
                                ->where("tm.id", $value->id)
                                ->first();

                    if($school->grade > 4){
                        $estado	= $sqlActa->estado;
                    }else{
                        $estado	= 1;
                    }
                    if(!$sqlMat) continue;

                    $grade = match ($estado) {
                        3 => $school->grade,
                        default => GradesQuery::getPromotionGrade($school->grade, $db),
                    };

                    $data	= array(
                        'id_student'		=> $sqlMat->id_student,
                        'id_grade'			=> $grade,
                        'id_group'			=> $school->group,
                        'id_headquarters'	=> $school->headquarter,
                        'id_study_day'		=> $school->workingDay,
                        'year'				=> $school->year,
                        'id_state'			=> 2,
                        'inst_address'		=> $sqlMat->dir_sede,
                        'inst_origin'		=> $sqlMat->sede
                    );
                    DB::table("{$db}student_enrollment")
                            ->insert($data);

                    DB::table("{$db}student_enrollment")
                            ->where("id", $value->id)
                            ->update(['promoted' => 1]);
                }
            }
            DB::commit();
            return self::getResponse();
        }catch (\Exception $e) {
            DB::rollback();
            return self::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }

    /**
     * @throws \Exception
     */
    public static function getEnrollment(Request $request): JsonResponse
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $db	        = $school->db;
        $year       = $school->year;
        $grade	    = $request->input('pdbCodGrado') ?? $request->input('pdbGrado');
        $grupo		= $request->input('pdbGrupo');
        $sede		= $request->input('pdbSede');
        $jornada	= $request->input('pdbJorn');
        $params     = [
            $year,
            $sede,
            $grade,
            $grupo,
            $jornada,
        ];
        return self::getResponse([
            'records' => [
                'data' => CallExecute::execute("{$db}sp_select_matriculas(?, ?, ?, ?, ?)",$params)
            ]
        ]);
    }

    /**
     * @throws \Exception
     */
    public static function getEnrollmentList(Request $request): JsonResponse
    {
        $school         = SchoolQueries::getSchoolRequest($request);
        $db	            = $school->db;
        $year           = $school->year;
        $search         = $request->input('query') ?? null;
        $promoted       = $request->input('promoted') ?? null;
        $withObserver   = $request->input('withObserver') ?? null;
        $query = DB::table($db.'student_enrollment','tm')
            ->selectRaw("tm.*, CONCAT(rtrim(ti.apellido1),' ',rtrim(ti.apellido2),' ',
					rtrim(ti.nombre1),' ',rtrim(ti.nombre2)) AS nombres,
					rtrim(tg.grado) AS grado, rtrim(ts.headquarters_name) AS sede, ti.foto, ti.mime,
					RTRIM(tj.jornada) AS jornada, RTRIM(tes.name_state) estado_mat")
            ->join($db.'inscripciones AS ti', 'tm.id_student', '=', 'ti.id')
            ->join($db.'grados AS tg', 'tm.id_grade','=','tg.id')
            ->join($db.'sedes AS ts', 'tm.id_headquarters','=','ts.id')
            ->join($db.'jornadas AS tj', 'tm.id_study_day','=','tj.cod_jorn')
            ->join($db.'registration_status AS tes', 'tm.id_state','=','tes.id');
        if(!is_null($promoted)) {
            $query->where('tm.year', $school->pdbYear)
                ->where('tm.id_grade', $school->grade)
                ->where('tm.id_group', $school->group)
                ->where('tm.id_headquarters', $school->headquarter)
                ->where('tm.id_study_day', $school->workingDay)
                ->where('promoted', 0)
                ->where('tm.id_state',2);
        }else {
            $query->where('tm.year', $year)
                    ->where('tm.id_state','>', '1');
        }
        if($withObserver) {
            $query->whereExists(function ($query) use ($db) {
                $query->select(DB::raw(1))
                    ->from($db.'obs_observador_mod_3 AS bb')
                    ->whereRaw('bb.id_matric = tm.id');
            });
        }
        if($search) {
            $query->where(function ($row) use ($search) {
                $row->whereRaw("CONCAT(rtrim(ti.nombre1),' ',rtrim(ti.apellido1),' ',rtrim(ti.apellido2)) LIKE '%{$search}%'")
                    ->orWhere('ts.headquarters_name', 'like' , "%{$search}%")
                    ->orWhere('tg.grado', 'like' , "%{$search}%")
                    ->orWhere('tm.id_group', 'like' , "%{$search}%");
            });
        }

        $query->orderByRaw('nombres, tm.id_grade, tm.id_group');
        return self::getResponse([
            'records' =>    $query->paginate($school->limit)
        ]);
    }

    public static function getAcademicHistory(Request $request): array
    {
        $studentId  = $request->input('id_student') ?? 0;
        $school     = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $fun	    = "{$school->database_name}.sp_select_historial_matriculas ( ? )";
        $param	    = [$studentId];
        return CallExecute::execute($fun, $param);
    }

    public static function getInscriptions(Request $request): JsonResponse
    {
        try {
            $school         = SchoolQueries::getSchoolRequest($request);
            $db	            = $school->db;
            $search         = $request->input('query') ?? null;
            $query = DB::table($db.'inscripciones');
            if($search) {
                $query->where(function ($row) use ($search) {
                    $row->whereRaw("CONCAT(rtrim(nombre1),' ',rtrim(nombre2),' ',rtrim(apellido1),' ',rtrim(apellido2)) LIKE '%{$search}%'");
                });
            }
            $query->orderByRaw('apellido1, apellido2, nombre1, nombre2');
            return self::getResponse([
                'records' =>    $query->paginate($school->limit)
            ]);
        }catch (Exception $e) {
            return self::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }
}
