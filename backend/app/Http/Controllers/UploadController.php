<?php

namespace App\Http\Controllers;

use App\Modules\School\SchoolQueries;
use App\Modules\Student\UploadStudentDocument;
use App\Modules\Upload\StudentUploads;
use App\Modules\Upload\UploadFiles;
use Illuminate\Http\Request;

class UploadController extends Controller
{
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
        return UploadStudentDocument::uploadDocument($request);
    }

    public function setTemplateEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentUploads::setTemplateEnrollment($request);
    }

}
