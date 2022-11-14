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
        // Preescolar
        if(($grade <= 4)) {
            $table = 'nscp00';
        }else{
            // Educación media y superior
            if ($grade > 13) {
                $table = 'nscp003';
            }else if ($grade >=5 AND $grade <=9) { // Educación básica primaria
                $table = 'nscp001';
            }else{
                $table = 'nscp002'; // Educación básica secundaria
            }
        }
        return $table;
    }

    /**
     * Función que retorna el nombre de la tabla de pre-informes.
     */
    public static function getTablePreInforme(Int $grade = 4): string
    {
        // Preescolar
        if(($grade <= 4)) {
            $table = 'preinforme_nscp00';
        }else{
            // Educación media y superior
            if ($grade > 13) {
                $table = 'preinforme_nscp003';
            }else if ($grade >=5 AND $grade <=9) { // Educación básica primaria
                $table = 'preinforme_nscp001';
            }else{
                $table = 'preinforme_nscp002'; // Educación básica secundaria
            }
        }
        return $table;
    }



    /**
     * Función que retorna el nombre de la tabla de sugerencias.
     */
    public static function getTableSuggestions(Int $grade = 4): string
    {
        if(($grade <= 4)) {
            $table = 'sug_nscp00';
        }else{
            // Educación media y superior
            if ($grade > 13) {
                $table = 'sug_nscp003';
            }else if ($grade >=5 AND $grade <=9) { // Educación básica primaria
                $table = 'sug_nscp001';
            }else{
                $table = 'sug_nscp002'; // Educación básica secundaria
            }
        }
        return $table;
    }

    /**
     * Función que retorna el nombre de la tabla de logros y estándares.
     */
    public static function getTableAchievementsStandards(Int $grade = 4): string
    {
        if(($grade <= 4)) {
            $table = 'log_nscp00';
        }else{
            // Educación media y superior
            if ($grade > 13) {
                $table = 'log_nscp003';
            }else if ($grade >=5 AND $grade <=9) { // Educación básica primaria
                $table = 'log_nscp001';
            }else{
                $table = 'log_nscp002'; // Educación básica secundaria
            }
        }
        return $table;
    }
}
