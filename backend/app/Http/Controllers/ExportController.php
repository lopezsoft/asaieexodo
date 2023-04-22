<?php

namespace App\Http\Controllers;

use App\Excel\ExcelExport;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    /**
     * @throws \Exception
     */
    public function getConsolidatedWithoutNotes(Request $request): \Illuminate\Http\JsonResponse
    {
        return ExcelExport::getConsolidatedWithoutNotes($request);
    }
    /**
     * @throws \Exception
     */
    public function getConsolidatedEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        return ExcelExport::getConsolidatedEnrollment($request);
    }
}
