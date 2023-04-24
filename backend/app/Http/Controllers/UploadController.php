<?php

namespace App\Http\Controllers;

use App\Modules\FileManagers;
use App\Modules\Upload\StudentUploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function uploadSignature(Request $request): JsonResponse
    {
        $path           = "settings/signature";
        return FileManagers::upload($request, $path, 'public');
    }
    public function uploadSchoolLogo(Request $request): JsonResponse
    {
        $path   = "settings/reports/header";
        return FileManagers::upload($request, $path, 'public');
    }

    public function setTemplateEnrollment(Request $request): JsonResponse
    {
        return StudentUploads::setTemplateEnrollment($request);
    }

}
