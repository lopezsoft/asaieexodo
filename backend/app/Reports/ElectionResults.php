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
    public function getReport(Request $request): \Illuminate\Http\JsonResponse
    {

        try {

            $school = SchoolQueries::getSchoolRequest($request);
            $format         = $school->format;
            $db	            = $school->db;
            $year	        = $school->year;
            $report	        = $request->input('pdbReport');

            switch($report){
                case '1':
                    //Reporte a Procesar : Este nombre es del reporte creado en JasReport
                    $report			=	'representative_results';
                    // Nombre dado al informe de salida
                    $report_export	= 'Resultado electoral por candidatos';
                    break;
                case '2':
                    //Reporte a Procesar : Este nombre es del reporte creado en JasReport
                    $report			=	'representative_results_polling_stations';
                    // Nombre dado al informe de salida
                    $report_export	= 'Resultado electoral por mesas';
                    break;
                case '3':
                    //Reporte a Procesar : Este nombre es del reporte creado en JasReport
                    $report			=	'representative_results_white_vote';
                    // Nombre dado al informe de salida
                    $report_export	= 'Resultado electoral por voto en blanco';
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
