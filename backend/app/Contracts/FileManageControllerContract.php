<?php

namespace App\Contracts;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

interface FileManageControllerContract
{
    public function get(Request $request): JsonResponse;
    public function upload(Request $request): JsonResponse;
    public function delete(Request $request, mixed $id): JsonResponse;
}
