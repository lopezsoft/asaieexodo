<?php

namespace App\Modules\Settings;

use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Competencies
{
    use MessagesTrait;
    public static function getEducationProcesses(Request $request) : JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $gradeId    = $request->input('idGrado') ?? $request->input('pdbGrado');

            $competencies   = self::getCompetenciesByGroupGrades($school, $gradeId);
            $ratingScale    = RatingScale::getGroupByGrades($school, $gradeId);
            $columnNotes    = ColumnNotes::getGroupByGrades($school, $gradeId);
            $generalSetting = GeneralSetting::getGeneralSettingByGrade($school, $gradeId);
            $bulletinSetting= BulletinSetting::get($school);
            $groupGrades    = DB::table("{$school->db}aux_grados_agrupados")->get();
            return self::getResponse([
                'competencies'      => $competencies,
                'ratingScale'       => $ratingScale,
                'columnNotes'       => $columnNotes,
                'generalSetting'    => $generalSetting,
                'bulletinSetting'   => $bulletinSetting,
                'groupGrades'       => $groupGrades,
            ]);
        } catch (\Exception $e) {
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
    public static function getByGroupGrades(Request $request): JsonResponse
    {
        try {
            $school         = SchoolQueries::getSchoolRequest($request);
            $gradeId        = $request->input('pdbGrado');
            return self::getResponse([
                'records'      => [
                    'data'  => self::getCompetenciesBuilder($school, $gradeId)->get()
                ],
            ]);
        } catch (\Exception $e) {
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
    public static function getCompetenciesByGroupGrades($school, $gradeId): \Illuminate\Support\Collection
    {
        return self::getCompetenciesBuilder($school, $gradeId)
            ->where('t1.calificable', '=', 1)
            ->get();
    }

    private static function getCompetenciesBuilder($school, $gradeId): \Illuminate\Database\Query\Builder
    {
        $db     = $school->db;
        $year   = $school->year;
        return DB::table("{$db}competencias AS t1")
            ->select('t1.id_pk', 't1.id', 't1.competencia', 't1.porcentaje', 't1.year', 't1.calificable')
            ->leftJoin("{$db}grados_agrupados AS t2", 't1.id_grado_agrupado', '=', 't2.id')
            ->leftJoin("{$db}aux_grados_agrupados AS t3", 't3.id_grado_agrupado', '=', 't2.id')
            ->where('t1.year', '=', $year)
            ->where('t3.id_grado', '=', $gradeId)
            ->orderBy('t1.id');
    }
    /**
     * @throws \Exception
     */
    public static function getColumnsNotesCompetenciesExists(Request $request): JsonResponse
    {
        return ColumnNotes::getCompetenciesExists($request);
    }
    /**
     * @throws \Exception
     */
    public static function getColumnsNotesCompetencies(Request $request): JsonResponse
    {
        return ColumnNotes::getCompetencies($request);
    }
    public static function getCompetencies(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            $query  = DB::table("{$db}competencias", "td")
                        ->selectRaw("td.*, t1.nombre_grado_agrupado")
                        ->leftJoin("{$db}grados_agrupados AS t1", "td.id_grado_agrupado", "=", "t1.id")
                        ->where("td.year", $school->year)
                        ->orderByRaw("td.year, td.id_grado_agrupado, td.id");

            return self::getResponse([
                'records' => $query->paginate()
            ]);
        }catch (Exception $e) {
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
