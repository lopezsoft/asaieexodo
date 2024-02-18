<?php
namespace App\Modules\Grades;
use App\Modules\Promotion\AcademicPeriods;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class GradesQuery
{
    use MessagesTrait;
    public static function getAuxiliaryGradesGrouped(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            $id     = $request->input('pdbIdGradoAgrupado');
            $query  = DB::Table($db.'aux_grados_agrupados as t1')
                ->select('t1.*', 't2.nombre_grado_agrupado', 't3.grado')
                ->leftJoin($db.'grados_agrupados as t2', 't1.id_grado_agrupado', '=', 't2.id')
                ->leftJoin($db.'grados as t3', 't1.id_grado', '=', 't3.id')
                ->where('t1.id_grado_agrupado', '=', $id);
            return self::getResponse([
                "records" => $query->paginate()
            ]);
        }catch (Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
    public static function getGradeCount($school, $grade = 0)
    {
        $db     = $school->db;
        $year   = $school->year;
        $query  = DB::Table($db . 'desempeños', 't1')
            ->selectRaw('COUNT(id_pk) notas_num_prees')
            ->leftJoin($db . 'grados_agrupados AS t2', 't1.id_grado_agrupado', '=', 't2.id')
            ->leftJoin($db . 'aux_grados_agrupados AS t3', 't3.id_grado_agrupado', '=', 't2.id')
            ->where('t1.year', $year)
            ->where('t3.id_grado', $grade)
            ->get();
        return $query[0] ?? null;
    }

    public static function getPromotionGrade($grade, $db)
    {
        $query  = DB::table("{$db}grados_agrupados", "t1")
                    ->leftJoin("{$db}aux_grados_agrupados AS t2", "t2.id_grado_agrupado", "=", "t1.id")
                    ->where("t2.id_grado", $grade)
                    ->where("t1.fin_ciclo_escolar", 1)
                    ->first();
        return ($query)  ? $grade : $grade + 1;
    }
    /**
     * @throws \Exception
     */
    public static function getPeriods(Request $request): \Illuminate\Http\JsonResponse {
        return AcademicPeriods::getPeriods($request);
    }

    /**
     * @throws \Exception
     */
    public static function getGroups(Request $request): \Illuminate\Http\JsonResponse
    {
        return GroupsAcademic::getGroups($request);
    }

    /**
     * @throws \Exception
     */
    public static function getSelectGrades(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db	    = $school->db;

        $query  = DB::table("{$db}grados AS tg");
        $query->leftJoin("{$db}niveles_estudio AS t2", "tg.id_nivel" ,"=", "t2.id");
        $headq  = $request->input("pdbSede") ?? null;
        $search = $request->input("query") ?? null;
        if (!empty($headq)) {
            $query->leftJoin("{$db}niveles_sedes AS tn", 'tg.id_nivel','=', 'tn.id_nivel');
            $query->where('tn.id_sede', $headq);
        }

        if($search) {
            $query->where('tg.grado', $search);
            $query->orWhere('tg.cod_grado', $search);
        }
        $query->select('tg.*', 't2.nombre_nivel');
        $query->orderBy('tg.cod_grado', 'asc');
         return self::getResponse([
             'records' => $query->paginate(24)
         ]);
    }
}
