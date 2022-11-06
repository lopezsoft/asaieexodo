<?php

namespace App\Http\Controllers;

use App\Modules\Upload\StudentUploads;
use App\Modules\Upload\UploadFiles;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function uploadSchoolLogo(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $path   = "settings/reports/header";
        return UploadFiles::upload($request, $path, 'public');
    }

    public function uploadStudentDocuments(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $path   = "students/".$request->input('pdbStudentId')."/documents";
        return UploadFiles::upload($request, $path);
    }

    public function setTemplateEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentUploads::setTemplateEnrollment($request);
    }

}
