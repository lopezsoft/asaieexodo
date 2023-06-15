<?php

namespace App\Modules\Academic;

use App\Contracts\CreateContract;
use App\Contracts\ReadContract;
use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Queries\CallExecute;
use App\Queries\InsertTable;
use App\Queries\TablesQuery;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicObservations implements CreateContract, ReadContract
{
    use MessagesTrait;
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
                $request->input('pdbPeriodo') ?? 0,
                $request->input('pdbGrupo'),
                $request->input('pdbSede'),
                $request->input('pdbJorn'),
                $request->input('pdbAsig'),
            ];

            return self::getResponse([
                'records' => [
                    'data'  => CallExecute::execute($db.'sp_select_sugerencias_estudiante_all(?, ?, ?, ?, ?, ?, ?, ?)',$param)
                ]
            ]);
        }catch (Exception $exception) {
            return self::getResponse500([
                'message' => $exception->getMessage()
            ]);
        }
    }
    public static function createForStudent(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $year       = $school->year;
            ControlClosingDates::isCurrentYear($year);
            $table      = $db.TablesQuery::getTableSuggestions($request->pdbGrado);
            $fields     = json_decode($request->input('records'));
            if(!is_array($fields)){
                $fields = [$fields];
            }
            DB::beginTransaction();
            foreach ($fields as $field) {
                $id_nota		= $field->id_nota;
                $id_sugerencia  = $field->id_sugerencia;
                $query	        = "INSERT IGNORE INTO {$table} (id_nota,id_sugerencia) VALUES ({$id_nota},{$id_sugerencia})";
                DB::statement($query);
            }
            DB::commit();
            return self::getResponse([
                'message' => 'Se ha creado la observación correctamente',
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
            $table      = $db.TablesQuery::getTableSuggestions($request->pdbGrado);
            $year       = $school->year;
            ControlClosingDates::isCurrentYear($year);
            $fields     = json_decode($request->input('records'));
            if(!is_array($fields)){
                $fields = [$fields];
            }
            DB::beginTransaction();
            foreach ($fields as $field) {
                $id_nota		= $field->id_nota;
                $id_sugerencia  = $field->id_sugerencia;
                $query	        = "DELETE FROM {$table} WHERE id_nota = {$id_nota} AND id_sugerencia = {$id_sugerencia}";
                DB::statement($query);
            }
            DB::commit();
            return self::getResponse([
                'message' => 'Se ha eliminado la observación correctamente',
                'data' => $fields
            ]);
        }catch (Exception $exception) {
            DB::rollBack();
            return self::getResponse500([
                'message' => $exception->getMessage()
            ]);
        }
    }

    public function create(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $year       = $school->year;
            ControlClosingDates::isCurrentYear($year);
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $extra	    = [
                'id_docente'	=> $teacherId,
                'year'			=> $year
            ];
            $fields     = json_decode($request->input('records'), true);
            $fields     = (object) array_merge($fields, $extra);
            return InsertTable::insert($request, $fields, "{$db}sugerencias");
        }catch (Exception $exception) {
            return self::getResponse500([
                'message' => $exception->getMessage()
            ]);
        }
    }

    public function read(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $year       = $school->year;
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $period     = $request->input('pdbPeriodo') ?? 0;
            $params     = [
                'id_docente'    => $teacherId,
                'year'          => $year,
            ];
            if(intval($period) > 0) {
                $params['periodo'] = $period;
            }
            $query = DB::Table("{$db}sugerencias")->where($params);
            return self::getResponse([
                'records'   => $query->paginate()
            ]);
        }catch (Exception $exception) {
            return self::getResponse500([
                'message' => $exception->getMessage()
            ]);
        }
    }
}
