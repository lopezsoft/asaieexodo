<?php
namespace App\Modules\Settings;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class GeneralSetting
{
    use MessagesTrait;
    public static function getGeneralSettingByGrade($school, $gradeId = 5): ?object
    {
        $db     = $school->db;
        $year   = $school->year;
        return DB::table("{$db}config001","t")
            ->leftJoin($db."grados_agrupados AS t1", "t.id_grupo_grados", "=", "t1.id")
            ->leftJoin($db."aux_grados_agrupados AS t2", "t2.id_grado_agrupado", "=", "t1.id")
            ->where('t.year', $year)
            ->where('t2.id_grado', $gradeId)
            ->first();
    }

    /**
     * @throws \Exception
     */
    public static function generalSetting(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $query  = DB::table("{$db}config001", "t1")
                    ->selectRaw("t1.*, t2.nombre_grado_agrupado")
                    ->leftJoin("{$db}grados_agrupados as t2","t1.id_grupo_grados","=", "t2.id")
                    ->where("t1.year", $school->year);
        return self::getResponse([
            'records' => $query->paginate()
        ]);
    }
}
