<?php

namespace App\Http\Controllers;

use App\Contracts\FileManageControllerContract;
use App\Modules\FileManagers;
use App\Modules\WaterMarkFiles;
use App\Processors\FileManagerProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FileManagerController extends Controller implements FileManageControllerContract
{
    public function deleteWatermark($id): JsonResponse
    {
        return WaterMarkFiles::deleteWatermark($id);
    }
    public function getWatermarks(Request $request): JsonResponse
    {
        return WaterMarkFiles::index($request);
    }
    public function uploadWatermark(Request $request): JsonResponse
    {
        return WaterMarkFiles::create($request);
    }
    public function updateWatermark(Request $request, $id): JsonResponse
    {
        return WaterMarkFiles::update($request, $id);
    }
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
