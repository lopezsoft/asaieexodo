<?php

namespace App\Modules\Academic;
use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Queries\TablesQuery;
use App\Queries\UpdateTable;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicLevelingPeriod
{
    use MessagesTrait;
    public static function getByTeacher(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $year       = $school->year;
            $teacherId  = $request->input('pdbTeacherId') ?? CoursesOfTeacher::getTeacherId($db);
            $level      = $request->input('pdbNivel') ?? 0;
            $process    = $request->input('pdbProcess') ?? 5;
            $period     = $request->input('pdbPeriodo') ?? 1;
            $gradeId    = self::getGradeId($request, $db, $level, $process);
            $subjectId  = $request->input('pdbAsig') ?? null;
            $now	    = date('Y');
            $table      = TablesQuery::getTableNotes($gradeId ?? 4);
            $scaleMin   = RatingScale::getRatingScaleReproved($school, $gradeId);

            $queryNotes = DB::Table("{$db}{$table} as tn")
                ->select('tn.id', 'tn.periodo', 'tn.year', 'tn.nota_perdida',
                    'tn.nota_habilitacion', 'tn.final', 'tn.fecha', 'tc.id_docente',
                    'tc.id_grado', 'tc.id_asig', 'tc.id_jorn',
                    'tc.id_sede', 'tc.grupo',
                    DB::raw("CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) AS nombres"),
                    'tm.id_student')
                ->join($db.'cursos as tc', function ($join) {
                    $join->on('tn.id_curso', '=', 'tc.id')
                        ->on('tn.year', '=', 'tc.year');
                })
                ->join($db.'student_enrollment as tm', 'tn.id_matric', '=', 'tm.id')
                ->join($db.'inscripciones as ti', 'tm.id_student', '=', 'ti.id');

            if ($process > 5) { // Ciclos
                if($process == 21) {
                    $queryNotes->whereBetween('tc.id_grado', [$gradeId - 1, $gradeId]);
                } else {
                    $queryNotes->where('tc.id_grado', $gradeId);
                }
            }

            if($level == 0){
                $queryNotes->where('tc.id_grado', $gradeId);
                $queryNotes->where('tm.id_grade', $gradeId);
                $queryNotes->where('tc.id_asig', $subjectId);
            }
            $queryNotes->where('tn.year', $year)
                ->where('tn.periodo', $period)
                ->where('tc.id_docente', $teacherId)
                ->where('tc.year', $year)
                ->where('tm.year', $year)
                ->where('tm.id_state', 2)
                ->orderByRaw('tc.id_grado,  tc.grupo, tc. id_asig,  tc.id_jorn, nombres');

            if($year == $now) { // Año actual
                // Corrección de notas perdidas cuando la nota final es mayor a la nota perdida
                $notes  = clone $queryNotes;
                $notes  = $notes->where('tn.nota_perdida', '>',0)
                                    ->whereRaw("tn.final > tn.nota_perdida")
                                    ->get();
                foreach ($notes as $note) {
                    DB::Table("{$db}{$table}")
                        ->where('id', $note->id)
                        ->limit(1)
                        ->update([
                            'nota_perdida' => 0,
                            'nota_habilitacion' => 0,
                            'fecha' => null,
                        ]);
                }

                $notes  = clone $queryNotes;
                $notes  = $notes->whereBetween('tn.final', [$scaleMin->desde, $scaleMin->hasta])
                            ->get();
                $date	= date('Y-m-d');
                foreach ($notes as $note) {
                    DB::Table("{$db}{$table}")
                        ->where('id', $note->id)
                        ->where('nota_perdida', 0)
                        ->limit(1)
                        ->update([
                            'nota_perdida' => $note->final,
                            'fecha' => $date,
                        ]);
                }

            }

            $queryNotes->selectRaw("ta.asignatura, ta.abrev, tar.area, tg.cod_grado")
                ->join($db.'asignaturas as ta', 'tc.id_asig', '=', 'ta.id_pk')
                ->join($db.'aux_asignaturas AS tau', function($join) {
                    $join->on('tau.id_asign', '=', 'ta.id_pk')
                        ->on('tau.year', '=', 'tc.year');
                })
                ->join($db.'areas as tar', 'tau.id_area', '=', 'tar.id')
                ->join($db.'grados as tg', 'tc.id_grado', '=', 'tg.id')
                ->where('tn.nota_perdida', '>', 0);
            $notes  = $queryNotes->get();
            return self::getResponse([
                "records" => [
                    "data"  => $notes,
                    "total" => $notes->count()
                ]
            ]);
        }catch (Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }

    public static function update(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $level      = $request->input('pdbNivel') ?? 0;
            $period     = $request->input('pdbPeriodo') ?? 1;
            $process    = $request->input('pdbProcess') ?? 5;
            ControlClosingDates::isCurrentYear($school->year);
            $gradeId    = self::getGradeId($request, $db, $level, $process);
            ControlClosingDates::validateLevelingDate($school, $gradeId, $period);
            $table      = TablesQuery::getTableNotes($gradeId ?? 4);
            $fields     = json_decode($request->input('records'));
            return UpdateTable::update($request, $fields, "{$db}{$table}");
        } catch (Exception $e) {
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * @throws Exception
     */
    public static function getGradeId(Request $request, $db, $level, $process = 5) {
        $gradeId    = $request->input('pdbGrado') ?? null;
        if ($level > 0) {
            $grade = DB::Table("{$db}grados")
                ->select('id');
            if ($process == 5) { // Básica y Media
                $grade->where('id_nivel', $level);
            } else if ($process > 5) { // Ciclos
                $grade->where('id', $process);
            } else {
                self::noFoundGrade();
            }

            $grade  = $grade->first();
            if (!$grade) {
                self::noFoundGrade();
            }
            $gradeId = $grade->id;
        }
        if (!$gradeId) {
            self::noFoundGrade();
        }
        return $gradeId;
    }

    private static function noFoundGrade()
    {
        throw new Exception("No se encontró el grado");
    }
}
