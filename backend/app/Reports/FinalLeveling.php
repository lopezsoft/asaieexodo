<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\Request;

class FinalLeveling implements ReportProcessorContract
{
    use MessagesTrait;
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $format     = $school->format ?? 'pdf';
            $year       = $school->year;
            $teacherId  = $request->input('pdbDocente') ?? 0;
            $gradeId    = $request->input('pdbGrade');
            if($teacherId == 0)
                $teacherId  = CoursesOfTeacher::getTeacherId($db);

            $report	        = 'recuperacionesfinales';
            $report_export	= 'Actividades de apoyo finales';

            $query	        = "CALL {$db}sp_select_respeciales_docente('{$year}','{$teacherId}',0,{$gradeId})";
            $path           = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school);
        }catch (Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
