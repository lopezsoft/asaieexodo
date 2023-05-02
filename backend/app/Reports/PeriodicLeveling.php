<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\Academic\AcademicLevelingPeriod;
use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;

class PeriodicLeveling implements ReportProcessorContract
{
    use MessagesTrait;
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $format     = $school->format;
            $year       = $school->year;
            $teacherId  = $request->input('pdbTeacherId');
            $level      = $request->input('pdbNivel') ?? 0;
            $period     = $request->input('pdbPeriodo') ?? 1;
            $gradeId    = AcademicLevelingPeriod::getGradeId($request, $db, $level);;
            $scaleMin   = RatingScale::getRatingScaleReproved($school, $gradeId);
            $typeReport = $request->input('pdbReport') ?? 1;

            $report	        = 'recuperacionesperiodicas';
            $report_export	= 'Actividades de apoyo periodicas';

            $query	        = "CALL {$db}sp_periodic_leveling('{$typeReport}','{$period}','{$year}','{$gradeId}','{$teacherId}','{$scaleMin->desde}','{$scaleMin->hasta}')";
            $path           = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
