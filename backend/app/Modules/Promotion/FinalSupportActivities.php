<?php

namespace App\Modules\Promotion;
use App\Modules\Academic\ControlClosingDates;
use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Modules\Settings\GeneralSetting;
use App\Queries\TablesQuery;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinalSupportActivities
{
    use MessagesTrait;
    /**
     * @throws \Exception
     */
    public function generateFinalActivities(Request $request): \Illuminate\Http\JsonResponse
    {
        $teacherId	= $request->input('pdbDocente');
        $school     = SchoolQueries::getSchoolRequest($request);
        $gradeId    = intval($request->input('pdbProcess'));;
        try {
            ControlClosingDates::validateFinalPeriod($school, $gradeId);
            $queryConfig    = GeneralSetting::getGeneralSettingByGrade($school, $gradeId);
            $queryResp      = $this->getQueryResp($school, $gradeId);

            $queryResp->where("tc.id_docente", $teacherId);
            $queryResp  = $queryResp->first();
            if(!$queryResp) {
                $queryResp  = $this->getQueryResp($school, $gradeId)->first();
                $nro        = ($queryResp) ? $queryResp->nro_acta + 1 : 1;
            }else {
                $nro        = $queryResp->nro_acta;
            }
            $this->generateAct($teacherId, $nro, $school, $gradeId, $queryConfig);
            return self::getResponse([]);
        }catch (\Exception $e){
            return self::getResponse500([
               'message'      => $e->getMessage()
            ]);
        }
    }
    private function generateAct(int $teacherId, $nro, $school, $gradeId, $setting): void {
        $query  = DB::table("{$school->db}cursos")
                    ->where('estado', 1)
                    ->where('year', $school->year)
                    ->where('id_docente', $teacherId);
        if($gradeId == 5) { // No es ciclos adultos
            $query->whereNotBetween("id_grado", [18, 23]);
        }else {
            if($gradeId == 21){
                $query->whereBetween("id_grado", [20, 21]);
            }else {
                $query->where("id_grado", $gradeId);
            }
        }
        $query->orderByRaw("id_grado,grupo");
        $query  = $query->get();

        foreach($query as $row){
            $range      = RatingScale::getRatingScaleReproved($school, $row->id_grado);
            $lastPeriod = AcademicPeriods::getLastPeriod($school, $row->id_grado);
            $this->notes($row, $nro, $school, $range, $lastPeriod, $setting);
        }
    }

    private function notes($row, $nro, $school, $range, $lastPeriod, $setting): void {
        $db     = $school->db;
        $query	= DB::table($db."student_enrollment","tm")
            ->select('id')
            ->where("tm.id_headquarters", $row->id_sede)
            ->where("tm.year", $school->year)
            ->where("tm.id_grade", $row->id_grado)
            ->where("tm.id_group", "=", "{$row->grupo}")
            ->where("tm.id_study_day", $row->id_jorn)
            ->where("tm.id_state", 2)
            ->get();
        $table  = TablesQuery::getTableNotes($row->id_grado);
        $desde  = $range->desde;
        $hasta  = $range->hasta;
        $year   = $school->year;
        $curso  = $row->id;
        $asig   = $row->id_asig;
        $grado  = $row->id_grado;
        $extraName  = "";
        $where      = "";
        if($setting->promocion == 3) {
            $where	    = " AND a.periodo ='{$lastPeriod->periodo}' ";
            $extraName	= "_periodos";
        }
        foreach ($query as $enrollment) {
            if ($setting->porcentaje_areas == 1) { // Si se está trabajando el año lectivo con porcentajes en las áreas
                $view       = "_view_porcentaje_areas";
                $queryAreas = DB::select("
                        SELECT a.id_matric, a.id_area, SUM(a.final) AS final
                        FROM {$db}{$table}{$view}{$extraName} AS a
                        WHERE a.id_matric = {$enrollment->id} AND a.id_grado = {$grado}
                            AND a.year = {$year}{$where}
                        GROUP BY a.id_matric, a.id_area
                        HAVING final BETWEEN {$desde} AND {$hasta}
                        ORDER BY a.id_area
                    ");
            }else{
                $view       = "_view_prom_por_area";
                $queryAreas = DB::select("
                        SELECT a.id_matric, a.id_area, AVG(a.final) AS final
                        FROM {$db}{$table}{$view}{$extraName} AS a
                        WHERE a.id_matric = {$enrollment->id} AND a.id_grado = {$grado}
                            AND a.year = {$year}{$where}
                        GROUP BY a.id_matric, a.id_area
                        HAVING final BETWEEN {$desde} AND {$hasta}
                        ORDER BY a.id_area
                    ");
            }
            $totalAreas = count($queryAreas);
            if ($totalAreas > 0 && ($totalAreas < $setting->areas_pierde)) {
                foreach ($queryAreas as $area) {
                    $querySubjects = DB::select("
                        SELECT a.id_matric, a.id_asig, a.id_area, a.final
                        FROM {$db}{$table}{$view}{$extraName} AS a
                        WHERE a.id_matric = {$area->id_matric} AND a.prom BETWEEN {$desde} AND {$hasta}
                            AND a.id_area = {$area->id_area} AND a.id_asig = {$asig}
                    ");

                    foreach ($querySubjects as $subject) {
                        $final = $subject->final;
                        if ($setting->nota_redondeo > 0 && $setting->aplicar_redondeo_fin_año > 0 && ($final === $setting->nota_final_redondeo)) {
                            continue;
                        }

                        $call = "{$db}sp_insert_respeciales";
                        $params = "{$area->id_matric},{$nro},{$curso},'{$final}'";
                         DB::select("CALL {$call}({$params})");
                    }
                }
            }
        }
    }

    private function getQueryResp(mixed $school, $gradeId = 5): \Illuminate\Database\Query\Builder
    {
        $queryResp  = DB::table("{$school->db}respeciales", "t")
            ->select('t.nro_acta')
            ->leftJoin("{$school->db}student_enrollment AS tm", "t.id_matric", "=", "tm.id")
            ->leftJoin("{$school->db}cursos AS tc", "t.id_curso", "=", "tc.id")
            ->where("tc.year", $school->year);
        if($gradeId == 5) { // No es ciclos adultos
            $queryResp->whereNotBetween("tc.id_grado", [18, 23]);
        }else {
            if($gradeId == 21){
                $queryResp->whereBetween("tc.id_grado", [20, 21]);
            }else {
                $queryResp->where("tc.id_grado", $gradeId);
            }
        }
        return $queryResp;
    }
}
