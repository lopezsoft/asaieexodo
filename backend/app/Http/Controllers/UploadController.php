<?php

namespace App\Http\Controllers;

use App\Modules\FileManagers;
use App\Modules\Student\UploadStudentDocument;
use App\Modules\Teacher\TeacherFileManager;
use App\Modules\Upload\StudentUploads;
use App\Modules\Upload\UploadFiles;
use App\Processors\FileManagerProcessor;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function uploadTeacherDocuments(Request $request): ?\Illuminate\Http\JsonResponse
    {
        return FileManagerProcessor::uploadFile($request, new TeacherFileManager);
    }
    public function uploadSignature(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $path   = "settings/signature";
        return UploadFiles::upload($request, $path, 'public');
    }
    public function uploadSchoolLogo(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $path   = "settings/reports/header";
        return UploadFiles::upload($request, $path, 'public');
    }

    public function uploadStudentDocuments(Request $request): ?\Illuminate\Http\JsonResponse
    {
        return FileManagerProcessor::uploadFile($request, new UploadStudentDocument);
    }

    public function setTemplateEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentUploads::setTemplateEnrollment($request);
    }

}
