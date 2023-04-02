<?php

namespace App\Modules\Promotion;

use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Modules\Settings\GeneralSetting;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinalSupportActivities
{
    use MessagesTrait;

    private int $porcentaje_areas = 0;
    private int $areas_pierde = 0;
    private int $t_año_lectivo = 0;
    private int $promocion = 0;

    /**
     * @throws \Exception
     */
    public function generateFinalActivities(Request $request): \Illuminate\Http\JsonResponse
    {
        $teacherId	= $request->input('pdbDocente');
        $type	    = intval($request->input('pdbType')) ?? 5;
        $school     = SchoolQueries::getSchoolRequest($request);
        $gradeId    = ($type == 0) ? 5 : 24;
        try {
            $queryConfig    = GeneralSetting::getGeneralSettingByGrade($school, $gradeId);
            if ($queryConfig){
                $this->porcentaje_areas = $queryConfig->porcentaje_areas;
                $this->areas_pierde		= $queryConfig->areas_pierde;
                $this->promocion 		= $queryConfig->promocion;
                $this->t_año_lectivo	= $queryConfig->t_año_lectivo;
            }

            $queryResp  = $this->getQueryResp($school, $type);

            $queryResp->where("tc.id_docente", $teacherId);
            $queryResp  = $queryResp->first();
            if(!$queryResp) {
                $queryResp  = $this->getQueryResp($school, $type)->first();
            }
            $nro        = ($queryResp) ? $queryResp->nro_acta + 1 : 1;
            $this->generateAct($teacherId, $nro, $school, $type);
            return self::getResponse([]);
        }catch (\Exception $e){
            return self::getResponse500([
               'error'      => $e->getMessage()
            ]);
        }

    }

    private function generateAct(int $teacherId, $nro, $school, $type = 0): void {
        $query  = DB::table("{$school->db}cursos")
                    ->where('estado', 1)
                    ->where('year', $school->year)
                    ->where('id_docente', $teacherId);
        if($type == 0) {
            $query->whereNotBetween("id_grado", [18, 23]);
        }else {
            $query->whereBetween("id_grado", [18, 23]);
        }
        $query->orderByRaw("id_grado,grupo");
        $query  = $query->get();

        foreach($query as $row){
            $range      = RatingScale::getRatingScaleReproved($school, $row->id_grado);
            $lastPeriod = AcademicPeriods::getLastPeriod($school, $row->id_grado);
            $this->notes($row, $nro, $school, $range, $lastPeriod);
        }
    }

    private function notes($row, $nro, $school, $range, $lastPeriod): void {
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
        $curso  = $row->id;
        $asig   = $row->id_asig;
        $grado  = $row->id_grado;
        foreach ($query as $row) {
            $call   = "";
            $params = [
                $school->year,
                $row->id,
                $curso,
                $asig,
                $nro,
                $grado,
                $range->desde,
                $range->hasta,
                $this->areas_pierde
            ];

            if ($this->porcentaje_areas == 1) { // Si se está trabajando el año lectivo con porcentajes en las áreas
                switch($this->promocion){
                    case 1 : // Promoción por promedios
                        $call	= "{$db}sp_prom_por_area_porcentaje(?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        break;
                    case 3 : // Quinta nota, Ultimo periodo
                        $call	= "{$db}sp_prom_por_area_porcentaje_quinta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        $params[] = $lastPeriod->periodo;
                        break;
                }
            }else{
                switch($this->promocion){
                    case 1 : // Promoción por promedios
                        $call	= "{$db}sp_prom_por_area(?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        break;
                    case 3 : // Quinta nota, Ultimo periodo
                        $call	= "{$db}sp_prom_por_area_quinta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        $params[] = $lastPeriod->periodo;
                        break;
                }
            }

            CallExecute::execute($call, $params);
        }
    }

    private function getQueryResp(mixed $school, $type = 0): \Illuminate\Database\Query\Builder
    {
        $queryResp  = DB::table("{$school->db}respeciales", "t")
            ->select('t.nro_acta')
            ->leftJoin("{$school->db}student_enrollment AS tm", "t.id_matric", "=", "tm.id")
            ->leftJoin("{$school->db}cursos AS tc", "t.id_curso", "=", "tc.id")
            ->where("tc.year", $school->year);
        if($type == 0) {
            $queryResp->whereNotBetween("tc.id_grado", [18, 23]);
        }else {
            $queryResp->whereBetween("tc.id_grado", [18, 23]);
        }

        return $queryResp;
    }
}
