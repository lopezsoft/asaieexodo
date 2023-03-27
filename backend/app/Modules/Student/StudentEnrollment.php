<?php

namespace App\Modules\Student;

use App\Modules\Grades\GradesQuery;
use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentEnrollment
{
    use MessagesTrait;

    /**
     * @throws \Exception
     */
    public static function oldRegistration(Request $request): \Illuminate\Http\JsonResponse
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
    public static function getEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $db	        = $school->db;
        $year       = $school->year;
        $grade	    = $request->input('pdbCodGrado');
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
    public static function getEnrollmentList(Request $request): \Illuminate\Http\JsonResponse
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $db	        = $school->db;
        $year       = $school->year;
        $search     = $request->input('query') ?? null;
        $promoted   = $request->input('promoted') ?? null;
        $query = DB::table($db.'student_enrollment','tm')
            ->selectRaw("tm.*, CONCAT(rtrim(ti.apellido1),' ',rtrim(ti.apellido2),' ',
					rtrim(ti.nombre1),' ',rtrim(ti.nombre2)) AS nombres,
					rtrim(tg.grado) AS grado, rtrim(ts.headquarters_name) AS sede, ti.foto, ti.mime,
					RTRIM(tj.jornada) AS jornada, RTRIM(tes.name_state) estado_mat")
            ->leftJoin($db.'inscripciones AS ti', 'tm.id_student', '=', 'ti.id')
            ->leftJoin($db.'grados AS tg', 'tm.id_grade','=','tg.id')
            ->leftJoin($db.'sedes AS ts', 'tm.id_headquarters','=','ts.id')
            ->leftJoin($db.'jornadas AS tj', 'tm.id_study_day','=','tj.cod_jorn')
            ->leftJoin($db.'registration_status AS tes', 'tm.id_state','=','tes.id');
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
        if($search) {
            $query->where(function ($row) use ($search) {
                $row->where('ti.apellido1', 'like' , "%{$search}%")
                    ->orWhere('ti.apellido2', 'like' , "%{$search}%")
                    ->orWhere('ti.nombre1', 'like' , "%{$search}%")
                    ->orWhere('ts.headquarters_name', 'like' , "%{$search}%")
                    ->orWhere('tg.grado', 'like' , "%{$search}%")
                    ->orWhere('tm.id_group', 'like' , "%{$search}%");
            });
        }

        $query->orderBy('nombres')
            ->orderBy('tm.id_grade')
            ->orderBy('tm.id_group');
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
}
