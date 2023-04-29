<?php
namespace App\Reports;
use App\Contracts\ReportProcessorContract;
use App\Core\JReportModel;
use Illuminate\Http\Request;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\JsonResponse;
class ElectionResults implements  ReportProcessorContract
{
    use MessagesTrait;
    public function getReport(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $format         = $school->format;
            $year	        = $school->year;
            $report	        = $request->input('pdbReport');
            switch($report){
                case '2':
                    $report			=	'representative_results_polling_stations';
                    $report_export	= 'Resultado electoral por mesas';
                    break;
                case '3':
                    $report			=	'representative_results_white_vote';
                    $report_export	= 'Resultado electoral por voto en blanco';
                    break;
                default:
                    $report			=	'representative_results';
                    $report_export	= 'Resultado electoral por candidatos';
                    break;
            }
            $query	        = null;
            $params         = [
                'P_YEAR'    => $year
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
