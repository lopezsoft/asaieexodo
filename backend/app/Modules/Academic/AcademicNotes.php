<?php
namespace App\Modules\Academic;
use App\Modules\Courses\Courses;
use App\Modules\School\SchoolQueries;
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

class AcademicNotes
{
    use  MessagesTrait;

    public static function getNotesByCourse(Request $request) : JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db    	    = $school->db;
            $grado	    = $request->input('pdbGrado');
            $curso	    = $request->input('pdbCurso');
            $jorn	    = $request->input('pdbJorn');
            $sede	    = $request->input('pdbSede');
            $grupo	    = $request->input('pdbGrupo');
            $periodo    = $request->input('pdbPeriodo');
            $sexo	    = $request->input('pdbSexo') ?? 'MX';
            $table 	    = TablesQuery::getTableNotes($grado);
            $year	    = $school->year;
            $where      = '';

            if ($sexo != 'MX') {
                $where = " AND tx.abrev_sexo ='{$sexo}'";
            }
            $query	= "INSERT INTO {$db}{$table} (id_matric, year, periodo, id_curso)
			SELECT tm.id, tm.year, {$periodo}, {$curso}
			FROM {$db}student_enrollment AS tm
			LEFT JOIN {$db}inscripciones AS te on tm.id_student = te.id
			LEFT JOIN {$db}sexo AS tx ON te.id_sexo = tx.id
			WHERE tm.id_headquarters = {$sede} AND tm.id_study_day = {$jorn} AND
			tm.id_grade = {$grado} AND tm.id_group = '{$grupo}' AND tm.year = {$year} AND
			tm.id_state = 2 {$where} AND NOT EXISTS(
			SELECT a.id_curso, a.id_matric, a.year, a.periodo
			FROM {$db}{$table} AS a
			WHERE a.id_curso = {$curso} AND a.id_matric = tm.id  AND a.periodo = {$periodo});";

            DB::statement($query);

            $param	= [
                $curso,
                $periodo,
                $year,
                $grado,
                $sexo
            ];

            $call	= "{$db}sp_select_notas_academicas_curso  (?, ?, ?, ?, ? )";
            return self::getResponse([
                "records" => [
                    "data" => CallExecute::execute($call, $param)
                ]
            ]);
        }catch (Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
    public static function deleteNotes(Request $request, $id):  JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $gradeId    = $request->input('pdbCodGrado');
            $table      = TablesQuery::getTableNotes($gradeId ?? 4);
            $fields     = json_decode($request->input('records'));
            return DeleteTable::delete($request, $fields, "{$db}{$table}");
        }catch (Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
    public static function updateNotes(Request $request, $id):  JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $gradeId    = $request->input('pdbCodGrado');
            $table      = TablesQuery::getTableNotes($gradeId ?? 4);
            $fields     = json_decode($request->input('records'));
            return UpdateTable::update($request, $fields, "{$db}{$table}");
        }catch (Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
    public static function getNotes(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $year       = $school->year;
            $grade      = $request->input('pdbCodGrado');
            $period     = $request->input('pdbPeriodo');
            $enrolledId = $request->input('pdbMatric');
            $query      = CallExecute::execute("{$db}sp_select_notas_academicas_periodo(?,?,?,?)", [$enrolledId, $period, $year, $grade]);
            return self::getResponse([
                'records' => [
                    'data' => $query
                ]
            ]);
       }catch (Exception $e){
           return self::getResponse500([
               "message" => $e->getMessage()
           ]);
       }
    }

    public static function addSubjects(Request $request) : JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $year       = $school->year;
            $grade      = $request->input('pdbGrado');
            $fields     = json_decode($request->input('records'));
            $table	    = TablesQuery::getTableNotes($grade ?? 4);
            $fields->year = $year;
            return InsertTable::insert($request, $fields, "{$db}{$table}");
        }catch (Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }

    public static function transferNotes(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $grade      = $request->input('pdbGrado');
            $table	    = TablesQuery::getTableNotes($grade ?? 4);  // Función auxiliar que devuelve el nombre de la tabla de notas según el grado
            $fields     = json_decode($request->input('pdbList'));
            DB::beginTransaction();
            foreach ($fields as $field) {
                $course = Courses::getActiveCourse($field->id_curso, $db);
                if (($course <> $field->id_curso) AND ($course > 0)) {
                    DB::Table("{$db}{$table}")->where('id', $field->id)->update(['id_curso' => $course]);
                }
            }
            DB::commit();
            return self::getResponse();
        }catch (Exception $e){
            DB::rollBack();
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
}
