<?php
namespace App\Modules\Settings;
use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use App\Queries\UpdateTable;
use App\Traits\MessagesTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ColumnNotes
{
    use MessagesTrait;

    public static function getCall($grade, $school) : string
    {
        $db     = $school->db;
        $year   = $school->year;
        $result = CallExecute::execute("{$db}sp_get_columns_notas (?, ?)", [
            $grade,
            $year
        ]);

        return $result[0]->filas ?? "";
    }
    public static function getByCourse(Request $request): JsonResponse {

        try {
            $curso      = $request->input('pdbCurso') ?? 0;
            $grado      = $request->input('pdbGrado');
            $periodo    = $request->input('pdbPeriodo') ?? '1';
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $year       = $school->year;

            $create = "SELECT t.id,t.numero_column, CONCAT('#',t.numero_column) name_column,
                        t.tipo, t.porciento, t.descripcion, t.abrev, t.modificable,
                        ROW_NUMBER() OVER (PARTITION BY tipo ORDER BY t.id_competencia, t.tipo, t.numero_column) AS row_num
                        FROM {$db}columnas_notas_competencias t
                        JOIN {$db}competencias AS tc ON t.id_competencia = tc.id_pk
                        JOIN {$db}grados_agrupados AS t1 ON tc.id_grado_agrupado = t1.id
                        JOIN {$db}aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
                        WHERE tc.year = {$year} AND t2.id_grado = {$grado}
                        ORDER BY t.id_competencia, t.tipo, t.numero_column";

            $queryX = DB::select($create);

            $sqlInsert= "";

            if (!($curso > 0)){
                throw new Exception("Debe seleccionar un curso");
            }
            if (count($queryX) == 0) {
                throw new Exception("No hay columnas de notas para este grado");
            };

            $query = "SELECT COUNT(id) total  FROM {$db}config_columns_theacher tc
                    WHERE tc.id_curso = {$curso} AND tc.periodo = '{$periodo}'";
            $select = DB::select($query);

            if (count($select) == 0){
                throw new Exception("No hay columnas de notas para este curso");
            }

            if (count($select) < count($queryX)){
                foreach($queryX as $key => $value){
                    switch($value->tipo){
                        case 'PROM':
                            $nombre         = "PROM";
                            $modify         = 0;
                            $description    = 'PROMEDIO DE NOTAS';
                            $activa         = 0;
                            break;
                        case 'PORC':
                            $nombre         = "%";
                            $modify         = 0;
                            $description    = 'NOTA PORCENTUAL';
                            $activa         = 0;
                            break;
                        default:
                            $nombre         = strlen($value->abrev) > 0 ? $value->abrev : '#'.$value->row_num;
                            $modify         = strlen($value->descripcion) > 0 ? $value->modificable : 1;
                            $description    = strlen($value->descripcion) > 0 ? $value->descripcion.' '.$value->porciento.' %' : 'Nota académica';
                            $activa         = 1;
                            break;
                    }
                    $sqlInsert = $sqlInsert."('".$curso.
                        "','".$value->id."','".$nombre."','".$description."','".$value->porciento.
                        "','".$periodo."','".$modify."','".$activa."'),";
                }
                $aInsert = substr($sqlInsert, 0, strlen($sqlInsert)-1);

                DB::beginTransaction();
                $sqlInsert = "INSERT IGNORE INTO ".$db."`config_columns_theacher` (`id_curso`,`id_column`,
                        `nombre`,`descripcion`,`porcentual`,`periodo`,`modificable`,`activa`) VALUES ".$aInsert;
                DB::select($sqlInsert);
                DB::commit();
            }
            $queryC = "SELECT t.*, CONCAT('n',t1.numero_column) AS name_column, t1.id_competencia,
                    t1.tipo, t1.porciento,
                    CONCAT(t2.id_pk,'- ',t2.competencia) AS grupo, te.nombre des_evaluacion,
                    te.auto_calificar
                    FROM {$db}config_columns_theacher t
                    JOIN {$db}columnas_notas_competencias AS t1 ON t.id_column = t1.id
                    JOIN {$db}competencias AS t2 ON t1.id_competencia = t2.id_pk
                    LEFT JOIN {$db}grados_agrupados AS t3 ON t2.id_grado_agrupado = t3.id
                    LEFT JOIN {$db}aux_grados_agrupados AS t4 ON t4.id_grado_agrupado = t3.id
                    LEFT JOIN {$db}te_evaluation_courses tc ON tc.column_note_id = t.id
                    LEFT JOIN {$db}te_evaluations te ON (tc.evaluation_id = te.id AND tc.course_id = t.id_curso)
                    WHERE t.id_curso = {$curso} AND t.periodo ='{$periodo}' AND t2.year = {$year}
                    AND t4.id_grado = {$grado}
                    ORDER BY t1.id_competencia,t1.tipo, t1.numero_column";

            $request = DB::select($queryC);

            return self::getResponse([
                "records" => [
                    "data" => $request,
                ],
            ]);
        }catch (\Exception $e) {
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }

    public static function getGroupByGrades($school, $gradeId): \Illuminate\Support\Collection
    {
        $db     = $school->db;
        $year   = $school->year;
        return DB::table("{$db}columnas_notas_competencias as t1")
            ->select(DB::raw("t1.*, CONCAT('n',numero_column) as name_column"))
            ->join("{$db}competencias as tc", 't1.id_competencia', '=', 'tc.id_pk')
            ->join("{$db}grados_agrupados as t2", 'tc.id_grado_agrupado', '=', 't2.id')
            ->join("{$db}aux_grados_agrupados as t3", 't3.id_grado_agrupado', '=', 't2.id')
            ->where('tc.year', $year)
            ->where('t3.id_grado', $gradeId)
            ->orderBy('t1.id_competencia')
            ->orderBy('t1.tipo')
            ->orderBy('t1.numero_column')
            ->get();
    }
    /**
     * @throws \Exception
     */
    public static function getCompetenciesExists(Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $id     = $request->input('pdbGroupGradeId');
        $query  = DB::table("{$db}competencias", "t1")
            ->selectRaw("t2.*")
            ->join("{$db}columnas_notas_competencias AS t2", "t2.id_competencia", "=", "t1.id_pk")
            ->whereRaw("t2.id_competencia = t1.id_pk")
            ->where("t1.id_grado_agrupado", $id)
            ->where("t1.year", $school->year);

        return self::getResponse([
            'records' => $query->paginate(30)
        ]);
    }
    /**
     * @throws \Exception
     */
    public static function getCompetencies(Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $id     = $request->input('pdbId');
        $query  = DB::table("{$db}columnas_notas_competencias")
            ->selectRaw("*, CONCAT('#',numero_column) name")
            ->where("id_competencia", $id);

        return self::getResponse([
            'records' => $query->paginate()
        ]);
    }

    /**
     * @throws \Exception
     */
    public static function setColumnNotes(Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $fields = json_decode($request->input('records'));
        return UpdateTable::update($request, $fields, "{$db}config_columns_theacher");
    }
}
