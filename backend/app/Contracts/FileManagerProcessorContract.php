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
    public static function get(Request $request, FileManagerContract $object): \Illuminate\Http\JsonResponse;

    /**
     * @param Request $request
     * @param FileManagerContract $object
     * @return JsonResponse
     */
    public static function upload(Request $request, FileManagerContract $object): \Illuminate\Http\JsonResponse;

    /**
     * @param Request $request
     * @param FileManagerContract $object
     * @param $id
     * @return JsonResponse
     */
    public static function delete(Request $request, FileManagerContract $object, $id): \Illuminate\Http\JsonResponse;
}
