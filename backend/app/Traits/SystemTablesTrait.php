<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;

trait SystemTablesTrait
{
    public static function getTeacherCourse($gdo,$gpo,$sede,$jorn,$year,$courseId, $db): int
    {
        $course	= DB::table("{$db}cursos")->where('id', $courseId)->first();
        $result	= 0;
        if($course){
            $query  = DB::table("{$db}cursos")
                        ->where('id_grado', $gdo)
                        ->where('id_sede', $sede)
                        ->where('id_jorn', $jorn)
                        ->where('year', $year)
                        ->where('id_asig', $course->id_asig)
                        ->where('estado', 1)
                        ->where('grupo', "'{$gpo}'")
                        ->first();
            if ($query){
                $result	= $query->id;
            }
        }
        return $result;
    }

    /**
     * Función que retorna el nombre de la tabla de notas.
     */
    public static function getTableNotes(Int $grade = 4): string
    {
        return TablesQuery::getTableNotes($grade);
    }

    /**
     * Función que retorna el nombre de la tabla de pre-informes.
     */
    public static function getTablePreInforme(Int $grade = 4): string
    {
        return TablesQuery::getTablePreInforme($grade);
    }

    /**
     * Función que retorna el nombre de la tabla de sugerencias.
     */
    public static function getTableSuggestions(Int $grade = 4): string
    {
        return TablesQuery::getTableSuggestions($grade);
    }

    /**
     * Función que retorna el nombre de la tabla de logros y estándares.
     */
    public static function getTableAchievementsStandards(Int $grade = 4): string
    {
        return TablesQuery::getTableAchievementsStandards($grade);
    }
}
