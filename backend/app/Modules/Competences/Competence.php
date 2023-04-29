<?php

namespace App\Modules\Competences;
use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Modules\Settings\ColumnNotes;
use App\Modules\Settings\Competencies;
use App\Modules\Settings\GeneralSetting;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
class Competence
{
    use  MessagesTrait;
    public static function getCompetences(Request $request) : \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $gradeId    = $request->input('idGrado');

            $competencies   = Competencies::getCompetenciesByGroupGrades($school, $gradeId);
            $ratingScale    = RatingScale::getGroupByGrades($school, $gradeId);
            $columnNotes    = ColumnNotes::getGroupByGrades($school, $gradeId);
            $generalSetting = GeneralSetting::getGeneralSettingByGrade($school, $gradeId);
            return self::getResponse([
                'competencies'      => $competencies,
                'ratingScale'       => $ratingScale,
                'columnNotes'       => $columnNotes,
                'generalSetting'    => $generalSetting
            ]);
        } catch (\Exception $e) {
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}


