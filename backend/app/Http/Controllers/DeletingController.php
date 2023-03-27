<?php

namespace App\Http\Controllers;

use App\Modules\Upload\UploadFiles;
use Illuminate\Http\Request;

class DeletingController extends Controller
{

    public function deleteSignature(Request $request): \Illuminate\Http\JsonResponse
    {
        $path   = "settings/signature";
        return UploadFiles::delete($request, $path, 'public');
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

}
