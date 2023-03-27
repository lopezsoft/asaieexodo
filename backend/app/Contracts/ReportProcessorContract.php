<?php

namespace App\Contracts;

use Illuminate\Http\Request;

interface ReportProcessorContract
{
    public function getReport(Request $request): \Illuminate\Http\JsonResponse;
}
