<?php

namespace App\Queries;

class TablesQuery
{

    /**
     * Función que retorna el nombre de la tabla de pre-informes.
     */
    public static function getTablePreInforme(int $grade = 4): string
    {
        // Preescolar
        if (($grade <= 4)) {
            $table = 'preinforme_nscp00';
        } else {
            // Educación media y superior
            if ($grade > 13) {
                $table = 'preinforme_nscp003';
            } else if ($grade >= 5 and $grade <= 9) { // Educación básica primaria
                $table = 'preinforme_nscp001';
            } else {
                $table = 'preinforme_nscp002'; // Educación básica secundaria
            }
        }
        return $table;
    }

    /**
     * Función que retorna el nombre de la tabla de logros y estándares.
     */
    public static function getTableAchievementsStandards(int $grade = 4): string
    {
        if (($grade <= 4)) {
            $table = 'log_nscp00';
        } else {
            // Educación media y superior
            if ($grade > 13) {
                $table = 'log_nscp003';
            } else if ($grade >= 5 and $grade <= 9) { // Educación básica primaria
                $table = 'log_nscp001';
            } else {
                $table = 'log_nscp002'; // Educación básica secundaria
            }
        }
        return $table;
    }

    /**
     * Función que retorna el nombre de la tabla de sugerencias.
     */
    public static function getTableSuggestions(int $grade = 4): string
    {
        if (($grade <= 4)) {
            $table = 'sug_nscp00';
        } else {
            // Educación media y superior
            if ($grade > 13) {
                $table = 'sug_nscp003';
            } else if ($grade >= 5 and $grade <= 9) { // Educación básica primaria
                $table = 'sug_nscp001';
            } else {
                $table = 'sug_nscp002'; // Educación básica secundaria
            }
        }
        return $table;
    }

    /**
     * Función que retorna el nombre de la tabla de notas.
     */
    public static function getTableNotes(int $grade = 4): string
    {
        // Preescolar
        if (($grade <= 4)) {
            $table = 'nscp00';
        } else {
            // Educación media y superior
            if ($grade > 13) {
                $table = 'nscp003';
            } else if ($grade >= 5 and $grade <= 9) { // Educación básica primaria
                $table = 'nscp001';
            } else {
                $table = 'nscp002'; // Educación básica secundaria
            }
        }
        return $table;
    }
}
