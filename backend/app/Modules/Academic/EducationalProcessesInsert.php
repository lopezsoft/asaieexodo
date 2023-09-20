<?php

namespace App\Modules\Academic;
use App\Modules\Courses\RatingScale;
use Illuminate\Support\Facades\DB;
class EducationalProcessesInsert
{
    public static function queryNotes($params): void
    {
        $queryNotes = $params->queryNotes;
        $queryLog   = $params->queryLog;
        $tableLog   = $params->tableLog;
        foreach($queryNotes as $cValue){
            $id_nota		= $cValue->id;
            foreach($queryLog as $fValue){
                $id_del_log	= $fValue->id;
                $estado_del	= $fValue->estado;
                if ($estado_del == 1 OR $estado_del == 2) {
                    self::deleteTableLog($tableLog, $id_nota, $id_del_log);
                }
            }
        }
    }
    public static function queryLog($params): void
    {
        $queryLog   = $params->queryLog;
        $queryNotes = $params->queryNotes;
        $proceso    = $params->proceso;
        $school     = $params->school;
        $grado      = $params->grado;
        $tableLog   = $params->tableLog;
        foreach($queryLog as $value){
            $id_logro	    = $value->id;
            $estado		    = $value->estado;
            $scaleLogId	    = $value->id_escala;
            $id_competencia	= $value->id_competencia;
            /**
             * Recorremos el array que contiene el ID de las notas insertadas a los estudiantes
             */
            foreach($queryNotes as $nValue){
                $noteId	    = $nValue->id;
                $scaleId	= $nValue->id_escala;
                if ($proceso == 3) { //Valores para procesos por competencias
                    if ($id_competencia > 0 AND $estado == 1) { // Asignar por desempeño
                        $xValue			= (array) $nValue;
                        $x_campo		= 'prom'.$id_competencia;
                        $nota_campo		= $xValue[$x_campo];
                        $scaleId		= RatingScale::getRatingScaleId($school, $grado, $nota_campo);
                    }
                }
                if($scaleId > 0){
                    switch($estado){
                        case 1 : // Asignar según desempeño
                            if ($scaleLogId === $scaleId) {
                                self::insertTableLog($tableLog, $noteId, $id_logro);
                            }
                            break;
                        case 2 : // Asignar sin tener en cuenta el desempeño
                            self::insertTableLog($tableLog, $noteId, $id_logro);
                            break;
                    }
                }else{
                    if($estado == 2){ // Asignar sin tener en cuenta el desempeño
                        self::insertTableLog($tableLog, $noteId, $id_logro);
                    }
                }
            }
        }
    }

    public static function insertTableLog($tableLog, $noteId, $id_logro): void
    {
        $query	= "INSERT IGNORE INTO {$tableLog} (id_nota,id_logro_estandar) VALUES (?, ?)";
        DB::select($query, [$noteId, $id_logro]);
    }

    public static function deleteTableLog(string $table, $noteId, $id_logro) : void
    {
        $queryDelete 	= "DELETE FROM {$table} WHERE id_nota = ? AND id_logro_estandar = ?";
        DB::statement($queryDelete, [$noteId, $id_logro]);
    }
}
