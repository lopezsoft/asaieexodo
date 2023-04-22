<?php

namespace App\Contracts;

use Illuminate\Http\Request;

interface FileManageControllerContract
{
    public function get(Request $request): ?\Illuminate\Http\JsonResponse;
    public function upload(Request $request): ?\Illuminate\Http\JsonResponse;
    public function delete(Request $request, $id): ?\Illuminate\Http\JsonResponse;
}
