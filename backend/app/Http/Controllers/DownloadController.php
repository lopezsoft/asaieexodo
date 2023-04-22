<?php

namespace App\Http\Controllers;

use App\Modules\Download\StudentDownloads;
use App\Modules\FileManagers;
use App\Modules\Student\UploadStudentDocument;
use App\Modules\Teacher\TeacherFileManager;
use App\Modules\Upload\UploadFiles;
use App\Processors\FileManagerProcessor;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    public function readTeacherDocuments(Request $request): ?\Illuminate\Http\JsonResponse
    {
        return FileManagerProcessor::getFiles($request, new TeacherFileManager());
    }
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
        return FileManagerProcessor::getFiles($request, new UploadStudentDocument);
    }

    public function getTemplateEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentDownloads::getTemplateEnrollment($request);
    }
}
