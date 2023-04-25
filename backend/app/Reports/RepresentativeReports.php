<?php

namespace App\Reports;

use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use Illuminate\Http\Request;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;

class RepresentativeReports implements  ReportProcessorContract
{

    use MessagesTrait;
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db	            = $school->db;
            $format         = $school->format;
            $grade_id	= $request->input('pdbGrado');
		    $headquarter_id	= $request->input('pdbSede');
            // $report	        = $request->input('pdbReport');
            $year	        = $school->year;
            $report_export	= "certificado electoral";
			$report			=	'certificado_electoral';
            $query	=null;

            $params         = [
                // 'P_DB'   =>$db,
                'P_YEAR'    => $year,
                'P_GRADE_ID' => $grade_id,
                'P_HEADQUARTER_ID'=>$headquarter_id
            ];
            $path           = "{$school->path}";
            return (new JReportModel())->getReportExport($report, $report_export, $format,$query, $path, $school->school, $params);
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
}
//CALL sp_certificado_ficha_informes(  $P{P_DB} $P{P_YEAR} $P{P_GRADE_ID}  $P{P_HEADQUARTER_ID} )
 // "SELECT tm.*, CONCAT(RTRIM(ti.apellido1),' ',RTRIM(ti.apellido2),' ',
			// 	RTRIM(ti.nombre1),' ',RTRIM(ti.nombre2)) AS nombres,
			// 	RTRIM(tg.grado) AS grado, RTRIM(ts.headquarters_name) AS sede, ti.foto, ti.mime
			// 	FROM {$db}.student_enrollment AS tm
			// 	LEFT JOIN {$db}.inscripciones AS ti ON tm.id_student = ti.id
			// 	LEFT JOIN {$db}.grados AS tg ON tm.id_grade = tg.id
			// 	LEFT JOIN {$db}.sedes AS ts ON tm.id_headquarters = ts.id
			// 	WHERE tm.year	= {$year} AND tm.id_grade = {$grade_id} AND tm.id_headquarters = {$headquarter_id}
			// 	ORDER BY tm.id_grade ,tm.id_group,nombres";
