<?php

namespace App\Http\Controllers;

use App\Modules\Download\StudentDownloads;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    public function getTemplateEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentDownloads::getTemplateEnrollment($request);
    }
}
