<?php

namespace App\Modules\Academic;

use App\Modules\Promotion\AcademicPeriods;

class ControlClosingDates
{
    /**
     * @throws \Exception
     */
    public static function validateLevelingDate($school, $grade, $period): void
    {
        $query          = AcademicPeriods::getClosingDates($school, $grade, $period);
        $system_date	= strtotime(date('Y-m-d'));
        $leveling_date	= strtotime($query->fecha_cierre_nivelacion);
        if($system_date > $leveling_date){
            throw new \Exception("La fecha de nivelación del periodo ($period) ya ha expirado.");
        }
    }

    /**
     * @throws \Exception
     */
    public static function validatePeriodDate($school, $grade, $period): void
    {
        $query          = AcademicPeriods::getClosingDates($school, $grade, $period);
        $system_date	= strtotime(date('Y-m-d'));
        $leveling_date	= strtotime($query->fecha_cierre);
        if($system_date > $leveling_date){
            throw new \Exception("La fecha del periodo ($period) ya ha expirado.");
        }
    }
}
