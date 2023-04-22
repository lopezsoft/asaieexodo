<?php

namespace App\Http\Controllers;

use App\Modules\Download\StudentDownloads;
use App\Modules\Student\UploadStudentDocument;
use App\Modules\Upload\UploadFiles;
use Illuminate\Http\Request;

class DownloadController extends Controller
{

    public function readSignature(Request $request): ?\Illuminate\Http\JsonResponse
    {
        
        $path   = "settings/signature";
        return UploadFiles::read($request, $path, 'public');
    }
    public function readSchoolLogo(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $path   = "settings/reports/header";
        return UploadFiles::read($request, $path, 'public');
    }

    public function readStudentDocuments(Request $request): ?\Illuminate\Http\JsonResponse
    {
        return UploadStudentDocument::getDocuments($request);
    }

    public function getTemplateEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentDownloads::getTemplateEnrollment($request);
    }
}
