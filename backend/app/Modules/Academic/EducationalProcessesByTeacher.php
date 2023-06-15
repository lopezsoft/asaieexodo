<?php

namespace App\Modules\Academic;

use App\Jobs\EducationalProcessesInsertInNotesJob;
use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Queries\CallExecute;
use App\Queries\DeleteTable;
use App\Queries\InsertTable;
use App\Queries\TablesQuery;
use App\Queries\UpdateTable;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class EducationalProcessesByTeacher
{
    use MessagesTrait;
    public static function get(Request $request): array
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $year       = $school->year;
            $gradeId    = $request->input('pdbGrado') ?? 0;
            $subjectId  = $request->input('pdbAsig') ?? 0;
            $period     = $request->input('pdbPeriodo') ?? '';
            $teacherId  = CoursesOfTeacher::getTeacherId($school->db);
            $fun	    = "{$school->db}sp_select_logros_es_docente (?, ?, ?, ?, ?)";
            $param	    = [
                $teacherId,
                $year,
                $gradeId,
                $subjectId,
                $period
            ];
            return CallExecute::execute($fun, $param);
        }catch (Exception $e) {
            return [
                'error' => $e->getMessage()
            ];
        }
    }
    public static function getLastYear(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $year       = $school->year - 1;
            $db         = $school->db;
            $query	="SELECT tl.*,tp.nombre_proceso, tc.competencia, es.nombre_escala
			FROM {$db}logros_estandares AS tl
			JOIN {$db}escala_nacional AS es ON es.id = tl.id_escala
			JOIN {$db}tipo_procesos_educativos AS tp ON tp.id = tl.tipo
			JOIN {$db}competencias AS tc ON (tc.id = tl.id_competencia AND tc.year = tl.year)
			JOIN {$db}grados_agrupados AS t1 ON t1.id = tc.id_grado_agrupado
			JOIN {$db}aux_grados_agrupados AS t2 ON (t2.id_grado_agrupado = t1.id AND t2.id_grado = tl.id_grado)
			WHERE tl.id_grado = {$school->grade} AND tl.id_asig = {$request->pdbAsig} AND tl.year = {$year}
			ORDER BY tl.tipo, tl.periodo, tl.id_competencia,tl.id_escala";
            $logros	= DB::select($query);
            return self::getResponse([
                'records'	=> [
                    'data'	=> $logros
                ]
            ]);
        }catch (Exception $e) {
            return self::getResponse500([
                'error' => $e->getMessage()
            ]);
        }
    }
    public static function create(Request $request): JsonResponse
    {
        try {
            $params     = (Object) $request->all();
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            ControlClosingDates::isCurrentYear($school->year);
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $fields     = json_decode($request->input('records'), true);
            $fields     = array_merge($fields, [
                'year'          => $school->year,
                'id_docente'    => $teacherId,
                'id_asig'		=> $params->pdbAsig,
                'id_grado'		=> $params->pdbGrado,
            ]);
            $fields     = (Object) $fields;
            $result     = InsertTable::insert($request, $fields, "{$db}logros_estandares");
            EducationalProcessesInsertInNotesJob::dispatch($params, $school, $teacherId);
            return $result;
        }catch (Exception $e){
            return self::getResponse500([
                'message' => $e->getMessage()
            ]);
        }
    }
    public static function update(Request $request): JsonResponse
    {
        try {
            $params     = (Object) $request->all();
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            ControlClosingDates::isCurrentYear($school->year);
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $fields     = json_decode($request->input('records'));
            $result     = UpdateTable::update($request, $fields, "{$db}logros_estandares");
            EducationalProcessesInsertInNotesJob::dispatch($params, $school, $teacherId);
            return $result;
        }catch (Exception $e){
            return self::getResponse500([
                'message' => $e->getMessage()
            ]);
        }
    }
    public static function delete(Request $request, $id): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            ControlClosingDates::isCurrentYear($school->year);
            $tableLog   = $db.TablesQuery::getTableAchievementsStandards($request->pdbGrado);
            $fields     = [
                'id_logro_estandar' => $id
            ];
            DB::beginTransaction();
            DeleteTable::delete($request, $fields, "{$tableLog}");
            DeleteTable::delete($request, ['id' => $id], "{$db}logros_estandares");
            DB::commit();
            return self::getResponse([
                'message' => 'Registro eliminado correctamente'
            ]);
        }catch (Exception $e){
            DB::rollback();
            return self::getResponse500([
                'message' => $e->getMessage()
            ]);
        }
    }

    public static function synchronize(Request $request): JsonResponse
    {
        try {
            $params     = (Object) $request->all();
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            ControlClosingDates::isCurrentYear($school->year);
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            EducationalProcessesInsertInNotesJob::dispatch($params, $school, $teacherId);
            return self::getResponse([
                'message' => 'Proceso de sincronización iniciado'
            ]);
        }catch (Exception $e){
            return self::getResponse500([
                'message' => $e->getMessage()
            ]);
        }
    }
}
