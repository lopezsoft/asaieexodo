<?php

namespace App\Modules\Academic;

use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Modules\Settings\ColumnNotes;
use App\Modules\Settings\GeneralSetting;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Queries\CallExecute;
use App\Queries\TablesQuery;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EducationalProcesses
{
    use MessagesTrait;

    /**
     * @throws Exception
     */
    public static function insertInNotes($request, $school, $teacherId) : void
    {
        try {
            $year           = $school->year;
            $grado		    = $request->pdbGrado;
            $curso		    = $request->pdbCurso;
            $sede		    = $request->pdbSede;
            $periodo	    = $request->pdbPeriodo;
            $asig		    = $request->pdbAsig;
            $db         	= $school->db;
            $tableNotes 	= $db.TablesQuery::getTableNotes($grado);
            $tableLog		= $db.TablesQuery::getTableAchievementsStandards($grado);
            $generalSetting = GeneralSetting::getGeneralSettingByGrade($school, $grado);
            $proceso		= $generalSetting->procesos ?? 0;
            $filas			= ColumnNotes::getCall($grado, $school);

            $queryLog		= "SELECT * FROM {$db}logros_estandares
                                WHERE id_docente={$teacherId} AND id_asig={$asig} AND
                                year={$year} AND periodo={$periodo} AND id_grado={$grado}
                                ORDER BY tipo, id_competencia, id_escala";
            $queryLog		= DB::select($queryLog);
            if ($curso > 0){ // Si es un curso especifico
                $queryNotes	= "SELECT tn.id,{$filas},tn.final,
                                    tn.id_escala,tm.id id_matric FROM {$tableNotes} AS tn
                                    JOIN {$db}cursos AS tc ON (tc.id = tn.id_curso AND tc.year=tn.year)
                                    JOIN {$db}student_enrollment AS tm ON (tm.id = tn.id_matric AND tm.year=tn.year)
                                    WHERE tn.year={$year} AND tn.id_curso={$curso} AND tn.periodo={$periodo}
                                    AND tm.id_grade={$grado} AND tm.id_state=2";
                $queryNotes 	= DB::select($queryNotes);
                if(count($queryNotes) > 0 AND count($queryLog) > 0){
                    DB::beginTransaction();
                    /**
                     *  Se eliminan, para evitar conflictos de duplicidad, los logros e indicadores
                     * que se hayan insertado a los estudiantes.
                     */
                    $params = (Object) [
                        "queryLog"      => $queryLog,
                        "queryNotes"    => $queryNotes,
                        "proceso"       => $proceso,
                        "school"        => $school,
                        "grado"         => $grado,
                        "tableLog"      => $tableLog,
                    ];
                    EducationalProcessesInsert::queryNotes($params);
                    /**
                     * Recorremos el array con los datos de la tabla con los logros e indicadores
                     */
                    EducationalProcessesInsert::queryLog($params);
                    DB::commit();
                }
            }else{
                $queryCourse = "SELECT tc.id,tc.id_jorn, tc.grupo FROM {$db}cursos tc WHERE
                        tc.id_docente = ? AND tc.id_asig = ? AND tc.id_sede = ? AND tc.id_grado = ?
                        AND tc.estado = 1 AND tc.`year` = ? ";
                $queryCourse = DB::select($queryCourse, [$teacherId, $asig, $sede, $grado, $year]);
                if (count($queryCourse) > 0 AND count($queryLog) > 0){
                    foreach($queryCourse as $course){
                        $curso	    = $course->id;
                        $queryNotes	= "SELECT tn.id,{$filas},tn.final,
                                        tn.id_escala,tm.id id_matric FROM {$tableNotes} AS tn
                                        LEFT JOIN {$db}cursos AS tc ON (tc.id = tn.id_curso AND tc.year = tn.year)
                                        LEFT JOIN {$db}student_enrollment AS tm ON (tm.id = tn.id_matric AND tm.year = tn.year)
                                        WHERE tn.year= ? AND tn.id_curso= ? AND tn.periodo = ? AND tm.id_grade = ? AND tm.id_state = 2";
                        $queryNotes 	= DB::select($queryNotes,[$year, $curso, $periodo, $grado]);
                        if(count($queryNotes) > 0){
                            DB::beginTransaction();
                            $params = (Object) [
                                "queryLog"      => $queryLog,
                                "queryNotes"    => $queryNotes,
                                "proceso"       => $proceso,
                                "school"        => $school,
                                "grado"         => $grado,
                                "tableLog"      => $tableLog,
                            ];
                            /**
                             *  Se eliminan, para evitar conflictos de duplicidad, los logros e indicadores
                             * que se hayan insertado a los estudiantes.
                             */
                            EducationalProcessesInsert::queryNotes($params);
                            /**
                             * Recorremos el array con los datos de la tabla con los logros e indicadores
                             *
                             */
                            EducationalProcessesInsert::queryLog($params);
                            DB::commit();
                        }
                    }
                }
            }
        }catch (Exception $e){
            DB::rollBack();
            // throw new Exception($e->getMessage());
        }
    }
    public static function getVerify(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $year	    = $school->year;
            $periodo 	= $request->input('pdbPerio');
            $grado		= $request->input('pdbGrado');
            $asig		= $request->input('pdbAsig');
            $teacherId  = CoursesOfTeacher::getTeacherId($db);

            $query	= "SELECT tl.id_docente, tl.id_asig, tl.tipo
						FROM {$db}logros_estandares tl
						WHERE periodo={$periodo} AND id_grado={$grado}
						AND id_asig={$asig} AND id_docente={$teacherId}
                        AND tipo=2 AND tl.year = {$year} GROUP BY id_docente,id_asig,periodo,tipo";

            $query2	= "SELECT tl.id_docente, tl.id_asig, tl.tipo
						FROM {$db}logros_estandares tl
						WHERE periodo={$periodo} AND id_grado={$grado}
                        AND id_asig={$asig} AND id_docente={$teacherId}
                        AND tipo > 2 AND tl.year = {$year} GROUP BY id_docente,id_asig,periodo,tipo";

            $logros		    = DB::select($query);
            $indicadores	= DB::select($query2);
            return self::getResponse([
                'logros'		=> $logros,
                'indicadores'	=> $indicadores
            ]);
        } catch (Exception $e) {
            return self::getResponse([
                'error' => $e->getMessage()
            ]);
        }
    }

    public static function createForStudent(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $grado      = $request->input('pdbGrado');
            $year       = $school->year;
            ControlClosingDates::isCurrentYear($year);
            $table      = $db.TablesQuery::getTableAchievementsStandards($grado);
            $fields     = json_decode($request->input('records'));
            if(!is_array($fields)){
                $fields = [$fields];
            }
            DB::beginTransaction();
            foreach ($fields as $field) {
                $id_logro	    = $field->id_logro_estandar;
                $estado		    = $field->estado;
                $scaleLogId	    = $field->id_escala;
                $noteId		    = $field->id_nota;
                $final			= $field->final;
                $scaleId		= RatingScale::getRatingScaleId($school, $grado, $final);
                if($scaleId > 0){
                    switch($estado){
                        case 1 : // Asignar según desempeño
                            if ($scaleLogId === $scaleId) {
                                EducationalProcessesInsert::insertTableLog($table, $noteId, $id_logro);
                            }
                            break;
                        case 2 : // Asignar sin tener en cuenta el desempeño
                        default:
                            EducationalProcessesInsert::insertTableLog($table, $noteId, $id_logro);
                            break;
                    }
                }else{
                    if($estado == 2 OR $estado == 3){ // Asignar sin tener en cuenta el desempeño
                        EducationalProcessesInsert::insertTableLog($table, $noteId, $id_logro);
                    }
                }
            }
            DB::commit();
            return self::getResponse([
                'message' => 'Se ha creado el registro correctamente.',
                'data' => $fields
            ]);
        }catch (Exception $exception) {
            DB::rollBack();
            return self::getResponse500([
                'message' => $exception->getMessage()
            ]);
        }
    }

    public static function deleteByStudents(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $year       = $school->year;
            $grado      = $request->input('pdbGrado');
            ControlClosingDates::isCurrentYear($year);
            $table      = $db.TablesQuery::getTableAchievementsStandards($grado);
            $fields     = json_decode($request->input('records'));
            if(!is_array($fields)){
                $fields = [$fields];
            }
            DB::beginTransaction();
            foreach ($fields as $field) {
                $id_logro	    = $field->id;
                $noteId		    = $field->id_nota;
                EducationalProcessesInsert::deleteTableLog($table, $noteId, $id_logro);
            }
            DB::commit();
            return self::getResponse([
                'message' => 'Se ha eliminado el logro correctamente',
            ]);
        }catch (Exception $exception) {
            DB::rollBack();
            return self::getResponse500([
                'message' => $exception->getMessage()
            ]);
        }
    }

    public static function getByStudents(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $year       = $school->year;
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $param = [
                $teacherId,
                $year,
                $request->input('pdbGrado'),
                $request->input('pdbAsig'),
                $request->input('pdbPeriodo') ?? 0,
                $request->input('pdbGrupo'),
                $request->input('pdbSede'),
                $request->input('pdbJorn'),
            ];

            return self::getResponse([
                'records' => [
                    'data'  => CallExecute::execute($db.'sp_select_logros_estudiante_all(?, ?, ?, ?, ?, ?, ?, ?)',$param)
                ]
            ]);
        }catch (Exception $exception) {
            return self::getResponse500([
                'message' => $exception->getMessage()
            ]);
        }
    }
}
