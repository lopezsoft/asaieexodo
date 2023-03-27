<?php

namespace App\Reports;
use App\Core\JReportModel;
use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;

class MinutesPromotion
{
    /**
     * @throws \Exception
     */
    public static function getFinalSavannas(Request $request): \Illuminate\Http\JsonResponse {
        $school     = SchoolQueries::getSchoolRequest($request);
        $year       = $school->year;
        $db         = $school->db;
        $report	= 'sabanas_finales';
        $query	= "CALL sp_select_sabanas('".$year."','".$school->headquarter."','".$school->workingDay.
            "','".$school->grade."','".$school->group."')";
        $report_export	= 'Sabanas finales';
        $params = [
            'R_ESCALA'  => RatingScale::getScaleString($school->grade, $year, $db)
        ];
        return (new JReportModel())->getReportExport($report,$report_export,$school->format,$query,$school->path, $school->school, $params);
    }

    /**
     * @throws \Exception
     */
    public static function getMinutesPromotionStatistics(Request $request): \Illuminate\Http\JsonResponse
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $year       = $school->year;
        $db         = $school->db;
        $type 	    = $request->input('pdbType');
        if ($type == 1){
            $report	= 'actas_promocion_esta_grado';
        }else{
            $report	= 'actas_promocion_esta';
        }

        $query	        = "CALL `sp_acta_promo_estadistica`(".$year.",".$type.")";
        $report_export	= 'Acta de promocion estadística';
        $params         = [
            'P_YEAR'    => $year
        ];
        return (new JReportModel())->getReportExport($report,$report_export,$school->format,$query,$school->path, $school->school, $params);
    }

    /**
     * @throws \Exception
     */
    public static function getMinutesPromotion(Request $request): \Illuminate\Http\JsonResponse
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $year       = $school->year;
        $report	    = 'actas_promocion';
        $query	    = "CALL `sp_select_acta_promocion`('".$school->grade."','".$school->group.
                            "',".$school->workingDay.",".$school->headquarter.",".$year.")";
        $report_export	= 'Acta de promocion';
        return (new JReportModel())->getReportExport($report,$report_export,$school->format,$query,$school->path, $school->school);
    }
}
