<?php

namespace App\Http\Controllers;

use App\Contracts\FileManageControllerContract;
use App\Modules\FileManagers;
use App\Processors\FileManagerProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FileManagerController extends Controller implements FileManageControllerContract
{
    public function get(Request $request): JsonResponse
    {
        return FileManagerProcessor::get($request, new FileManagers());
    }

    /**
     * @throws \Exception
     */
    public function upload(Request $request): JsonResponse
    {
        return FileManagerProcessor::upload($request, new FileManagers());
    }

    public function delete(Request $request, mixed $id): JsonResponse
    {
        return FileManagerProcessor::delete($request, new FileManagers(), $id);
    }

}
