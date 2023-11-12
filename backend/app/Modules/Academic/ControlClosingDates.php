<?php

namespace App\Modules\Academic;
use App\Common\DateFunctions;
use App\Modules\Promotion\AcademicPeriods;
use Exception;
class ControlClosingDates
{
    /**
     * @throws Exception
     */
    public static function isCurrentYear($year): void
    {
        $currentYear    = date('Y');
        if($year <> $currentYear) {
            throw new Exception("El año escolar ($year) no es válido.");
        }
    }
    /**
     * @throws \Exception
     */
    public static function validateLevelingDate($school, $grade, $period): void
    {
        $query          = AcademicPeriods::getClosingDates($school, $grade, $period);
        $system_date	= strtotime(date('Y-m-d'));
        $leveling_date	= strtotime($query->fecha_cierre_nivelacion);
        if($system_date > $leveling_date){
            throw new Exception("La fecha de nivelación del periodo ($period) ya ha expirado.");
        }
    }

    /**
     * @throws \Exception
     */
    public static function validatePeriodDate($school, $grade, $period): void
    {
        $year           = $school->year;
        if($year > 0){
            self::isCurrentYear($year);
        }
        $query          = AcademicPeriods::getClosingDates($school, $grade, $period);
        $system_date	= strtotime(date('Y-m-d'));
        $leveling_date	= strtotime($query->fecha_cierre);
        if($system_date > $leveling_date){
            throw new Exception("La fecha del periodo ($period) ya ha expirado.");
        }
    }
    /**
     * Válida que la fecha de cierre del último periodo sea menor o igual a la fecha actual
     * @throws \Exception
     */
    public static function validateFinalPeriod($school, $grade): object
    {
        $finalPeriod = AcademicPeriods::getLastPeriod($school, $grade);
        $currentDate = DateFunctions::getDateToTime();
        $finalDate   = DateFunctions::getDateToTime($finalPeriod->fecha_cierre);
        if($finalDate > $currentDate){
            throw new Exception('No es posible realizar el proceso en una fecha inferior a la fecha de cierre del ultimo periodo.');
        }

        return $finalPeriod;
    }
}
