<?php
namespace App\Common;

use App\Common\HttpResponseMessages;
use Exception;
use Illuminate\Http\JsonResponse;

class MessageExceptionResponse
{
    public static function response(Exception $e): JsonResponse
    {
        return match ($e->getCode()) {
            400 => HttpResponseMessages::getResponse400([
                'message' => $e->getMessage()
            ]),
            401 => HttpResponseMessages::getResponse401([
                'message' => $e->getMessage()
            ]),
            402 => HttpResponseMessages::getResponse402(),
            403 => HttpResponseMessages::getResponse403(),
            404 => HttpResponseMessages::getResponse404([
                'message' => $e->getMessage()
            ]),
            default => HttpResponseMessages::getResponse500([
                'message'   => $e->getMessage(),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
            ]),
        };
    }
}
