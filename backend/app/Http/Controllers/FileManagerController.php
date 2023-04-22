<?php

namespace App\Http\Controllers;

use App\Contracts\FileManageControllerContract;
use App\Modules\FileManagers;
use App\Processors\FileManagerProcessor;
use Illuminate\Http\Request;

class FileManagerController extends Controller implements FileManageControllerContract
{
    public function get(Request $request): ?\Illuminate\Http\JsonResponse
    {
        return FileManagerProcessor::get($request, new FileManagers());
    }
    public function upload(Request $request): ?\Illuminate\Http\JsonResponse
    {
        return FileManagerProcessor::upload($request, new FileManagers());
    }

    public function delete(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        return FileManagerProcessor::delete($request, new FileManagers(), $id);
    }

}
