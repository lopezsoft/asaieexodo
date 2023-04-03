<?php

namespace App\Reports\Consolidated;

use App\Contracts\GenerateConsolidateContract;
use Illuminate\Support\Facades\DB;

class TotalConsolidated implements GenerateConsolidateContract
{
    /**
     * @throws \Exception
     */
    public function generate($properties, $school): void
    {
        try {
            $db	            = $school->db;
            $year	        = $school->year;
            if ($properties->typeReport == 2) {
                $tableCon	= $db.'consolidado_areas_totales';
                $tableCon2	= $db.'consolidado_areas';
            }else {
                $tableCon	= $db.'consolidado_totales';
                $tableCon2	= $db.'consolidado';
            }
            $whereStatement = " id_sede = ? AND grupo = ? AND id_grado = ? AND id_jorn = ? AND periodo = ? AND year = ? ";
            $whereValues    = [$properties->headquartersId, $properties->groupId, $properties->gradeId, $properties->studyDayId, $properties->period, $year];
            DB::select("DELETE FROM {$tableCon} WHERE {$whereStatement} LIMIT 1", $whereValues);

            $querySelect    = "SELECT tc.*, tm.year, tg.cod_grado FROM {$tableCon2} AS tc ".
                "LEFT JOIN {$db}student_enrollment AS tm ON (tc.id_matric = tm.id) ".
                "LEFT JOIN {$db}inscripciones AS te ON (tm.id_student = te.id) ".
                "LEFT JOIN {$db}grados AS tg ON (tm.id_grade = tg.id) ".
                "LEFT JOIN {$db}jornadas AS tj ON (tm.id_study_day = tj.cod_jorn) ".
                "LEFT JOIN {$db}sedes AS ts ON (tm.id_headquarters = ts.id) ".
                "WHERE tm.id_student = te.id AND tm.id_grade = ? AND tm.id_group = ? AND tm.id_study_day = ? AND
                tm.id_headquarters = ? AND tm.year = ? AND tc.periodo = ? AND tc.t > 0 ".
                "ORDER BY tc.periodo";

            $queryWhere = [$properties->gradeId, "'{$properties->groupId}'", $properties->studyDayId, $properties->headquartersId, $year, $properties->period];

            $notesList      = DB::select($querySelect, $queryWhere);

            $scale                      = $properties->scale;
            $listInsert                 = [];

            foreach ($notesList as $note) {
                $noteData   = (array) $note;
                foreach ($properties->columns as $column => $value) {
                    $idAsig     = $noteData[$column];
                    $total      = $listInsert["{$column}"] ?? 0;
                    $final      = $noteData["n{$column}"];
                    if($idAsig == $value && $final >= $scale->desde && $final <= $scale->hasta){
                        $listInsert["{$column}"]   = ++$total;
                    }
                }
            }
            if(count($listInsert) > 0){
                $listInsert['year']         = $year;
                $listInsert['id_sede']      = $properties->headquartersId;
                $listInsert['id_jorn']      = $properties->studyDayId;
                $listInsert['id_grado']     = $properties->gradeId;
                $listInsert['grupo']        = $properties->groupId;
                $listInsert['periodo']      = $properties->period;
                DB::table($tableCon)->insert($listInsert);
            }
        }catch (\Exception $e){
            throw new \Exception($e->getMessage());
        }
    }
}
