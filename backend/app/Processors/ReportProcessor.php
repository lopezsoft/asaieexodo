<?php

namespace App\Processors;

use App\Contracts\ReportProcessorContract;
use Illuminate\Http\Request;

class ReportProcessor
{
    public static function runReport(Request $request, ReportProcessorContract $object): \Illuminate\Http\JsonResponse {
        return $object->getReport($request);
    }
}
