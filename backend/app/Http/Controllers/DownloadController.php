<?php

namespace App\Http\Controllers;

use App\Modules\Download\StudentDownloads;
use App\Modules\Download\TeacherDownloads;
use App\Modules\Upload\UploadFiles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    public function getTemplateNotesByCourse(Request $request): JsonResponse
    {
        return TeacherDownloads::getTemplateNotesByCourse($request);
    }
    public function readSignature(Request $request): ?JsonResponse
    {
        $path   = "settings/signature";
        return UploadFiles::read($request, $path, 'public');
    }
    public function readSchoolLogo(Request $request): ?JsonResponse
    {
        $path   = "settings/reports/header";
        return UploadFiles::read($request, $path, 'public');
    }

    public function getTemplateEnrollment(Request $request): JsonResponse
    {
        return StudentDownloads::getTemplateEnrollment($request);
    }
}
