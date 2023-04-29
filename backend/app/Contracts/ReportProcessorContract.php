<?php

namespace App\Contracts;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

interface ReportProcessorContract
{
    public function getReport(Request $request): JsonResponse;
}
