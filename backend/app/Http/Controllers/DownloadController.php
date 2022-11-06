<?php

namespace App\Http\Controllers;

use App\Modules\Download\StudentDownloads;
use App\Modules\Upload\UploadFiles;
use Illuminate\Http\Request;

class DownloadController extends Controller
{
    public function readSchoolLogo(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $path   = "settings/reports/header";
        return UploadFiles::read($request, $path, 'public');
    }

    public function deleteSchoolLogo(Request $request): \Illuminate\Http\JsonResponse
    {
        $path   = "settings/reports/header";
        return UploadFiles::delete($request, $path, 'public');
    }


    public function deleteFile(Request $request, $path): \Illuminate\Http\JsonResponse
    {
        return UploadFiles::delete($request, $path);
    }


    public function readStudentDocuments(Request $request): ?\Illuminate\Http\JsonResponse
    {
        $path   = "students/".$request->input('pdbStudentId')."/documents";
        return UploadFiles::read($request, $path);
    }

    public function getTemplateEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentDownloads::getTemplateEnrollment($request);
    }
}
