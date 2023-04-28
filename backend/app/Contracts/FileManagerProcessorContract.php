<?php

namespace App\Contracts;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

interface FileManagerProcessorContract
{
    /**
     * @param Request $request
     * @param FileManagerContract $object
     * @return JsonResponse
     */
    public static function get(Request $request, FileManagerContract $object): JsonResponse;

    /**
     * @param Request $request
     * @param FileManagerContract $object
     * @return JsonResponse
     */
    public static function upload(Request $request, FileManagerContract $object): JsonResponse;

    /**
     * @param Request $request
     * @param FileManagerContract $object
     * @param mixed $id
     * @return JsonResponse
     */
    public static function delete(Request $request, FileManagerContract $object, mixed $id): JsonResponse;
}
