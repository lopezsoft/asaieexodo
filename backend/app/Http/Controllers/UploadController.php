<?php

namespace App\Http\Controllers;

use App\Modules\Download\StudentUploads;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function setTemplateEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudentUploads::setTemplateEnrollment($request);
    }
}
