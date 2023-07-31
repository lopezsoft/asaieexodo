<?php

namespace App\Reports;

use App\Common\BuildReportsPDF;
use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use App\Modules\Academic\AcademicLevelingPeriod;
use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Traits\MessagesTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdvancedPromotion implements ReportProcessorContract
{

    use MessagesTrait;
    public function getReport(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $year       = $school->year;
            $pdbId	    = $request->input('pdbId');
            $grade	    = $request->input('pdbGrade');
            $ratingScale= RatingScale::getScaleString($grade, $year, $db);
            $query	    = DB::Table($db.'promoted_observation')
                                ->where('promoted_id', $pdbId)
                                ->first();
            $result = DB::select("SELECT tp.*, a.`group_id`, a.grade_id, a.year, ta.asignatura, tmc.ih, d.nombre_escala, e.grado, e.cod_grado
                        FROM {$db}detail_promoted AS tp
                        JOIN {$db}promoted_header AS a ON tp.promoted_id = a.id
                        JOIN {$db}asignaturas AS ta ON tp.subject_id = ta.id_pk
                        JOIN {$db}matcurso AS tmc ON (tmc.id_asig = ta.id_pk AND tmc.year = a.year AND tmc.id_grado = a.grade_id)
                        JOIN {$db}aux_grados_agrupados AS b ON b.id_grado = a.grade_id
                        JOIN {$db}`desempeños` AS c ON (c.id_grado_agrupado = b.id_grado_agrupado AND c.year = a.year)
                        JOIN {$db}escala_nacional AS d ON c.id_escala = d.id
                        JOIN {$db}grados AS e ON a.grade_id = e.id
                        WHERE a.id = ?  AND c.id_grado_agrupado = b.id_grado_agrupado AND
                        tp.final BETWEEN c.desde AND c.hasta", [$pdbId]);

            $report_export	= 'Certificado promocion anticipada';
            $params         = [
                'school'                => $school,
                'ratingScale'           => $ratingScale,
                'promotedObservation'   => $query,
                'detailPromoted'        => $result
            ];
            $pdfBuilder     = new BuildReportsPDF('reports.promotion.advanced-promotion', $report_export, $school);
            return $pdfBuilder->build($params, ['mode' => 'utf-8', 'format' => 'Letter'], true);
        }catch (\Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
}
