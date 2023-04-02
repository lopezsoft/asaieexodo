<?php

namespace App\Reports\Consolidated;

use App\Contracts\GenerateConsolidateContract;
use App\Queries\TablesQuery;
use Illuminate\Support\Facades\DB;

class ConsolidatedByTeacher implements GenerateConsolidateContract
{
    /**
     * @throws \Exception
     */
    public function generate($properties, $school): void
    {
        try {
            $db	            = $school->db;
            $year	        = $school->year;
            $table          = TablesQuery::getTableNotes($properties->gradeId);
            $tableCon	    = $db.'consolidado_docentes';

            $queryCourses   = DB::Table("{$db}cursos")
                ->select("id_docente")
                ->where("year", $year)
                ->where("id_grado", $properties->gradeId)
                ->where("id_sede", $properties->headquartersId)
                ->where("id_jorn", $properties->studyDayId)
                ->where("estado", 1)
                ->groupBy("id_docente")
                ->orderBy("id_docente")
                ->get();
            foreach ($queryCourses as $course) {
                $querySelect    = "SELECT tc.id_asig, if(tn.nota_habilitacion > 0, tn.nota_habilitacion, tn.final) AS final FROM {$db}{$table} AS tn ".
                    "LEFT JOIN {$db}cursos AS tc ON (tn.id_curso = tc.id AND tn.year = tc.year) ".
                    "LEFT JOIN {$db}asignaturas AS tas ON (tc.id_asig = tas.id_pk) ".
                    "LEFT JOIN {$db}aux_asignaturas AS au ON (au.id_asign = tas.id_pk AND au.year = tc.year) ".
                    "LEFT JOIN {$db}student_enrollment AS tm ON (tn.id_matric = tm.id) ".
                    "WHERE tn.year = ? AND tn.id_matric = ? AND tn.periodo = ? AND tc.year = ? AND tc.id_grado = ? AND tc.estado = ? ".
                    "AND tc.id_docente = ? ORDER BY au.id_area, au.id_asign";
                $queryWhere     = [$year, $properties->enrollId, $properties->period, $year, $properties->gradeId, 1, $course->id_docente];

                $notesList      = DB::select($querySelect, $queryWhere);

                DB::select("DELETE FROM {$tableCon} WHERE id_matric = ? AND periodo = ? AND id_docente = ? LIMIT 1",
                        [$properties->enrollId, $properties->period, $course->id_docente]);

                $quantityReprobateAreas     = 0;
                $countRows                  = 0;
                $sumFinal                   = 0;
                $scale                      = $properties->scale;
                $settings                   = $properties->settings;
                $listInsert                 = [];

                foreach ($notesList as $note) {
                    $final      = $note->final;
                    $idAsig     = $note->id_asig;
                    /**
                     * Redondeo de notas, si aplica
                     */
                    if($settings->nota_redondeo > 0 AND $settings->aplicar_redondeo_fin_año > 0){
                        if($final >= $settings->nota_redondeo AND $final <= $scale->hasta){
                            $final = $settings->nota_final_redondeo;
                        }
                    }
                    $sumFinal   += $final;
                    $countRows++;
                    if($final >= 0 AND $final < $scale->hasta){
                        $quantityReprobateAreas++;
                    }
                    foreach ($properties->columns as $column => $value) {
                        if($idAsig == $value) {
                            $listInsert["n{$column}"]   = $final;
                            break;
                        }
                    }
                }
                if(count($listInsert) > 0){
                    foreach ($properties->columns as $column => $value) {
                        $listInsert[$column]            = $value;
                    }
                    $listInsert['id_docente']   = $course->id_docente;
                    $listInsert['id_matric']    = $properties->enrollId;
                    $listInsert['periodo']      = $properties->period;
                    $listInsert['prom']         = round($sumFinal/$countRows,2);
                    $listInsert['t']            = $quantityReprobateAreas;
                    DB::table($tableCon)->insert($listInsert);
                }
            }
        }catch (\Exception $e){
            throw new \Exception($e->getMessage());
        }
    }
}
