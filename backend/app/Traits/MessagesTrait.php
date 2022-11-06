<?php

namespace App\Traits;

use PhpOffice\PhpSpreadsheet\Shared\Date;

/**
 * Messages Trait
 */
trait MessagesTrait
{

    static function getRealTimeXls($date = null): string
    {
        $tz         = new \DateTimeZone('America/Bogota');

        $localDate  = new \DateTime(now(), $tz);
        $localDate  = $localDate->format('H:i:s');

        if ($date) {
            $objetDateTime  = Date::excelToDateTimeObject($date, $tz);
            $dateTime       = $objetDateTime->getTimestamp();
            $localDate      = date('H:i:s', $dateTime);
        }
        return $localDate;
    }

    static function getRealDateXls($date = null): string
    {
        $tz         = new \DateTimeZone('America/Bogota');
        $localDate  = new \DateTime(now(), $tz);
        $localDate  = $localDate->format('Y-m-d');

        if ($date) {
            $objetDateTime  = Date::excelToDateTimeObject($date, $tz);
            $dateTime       = $objetDateTime->getTimestamp();
            $localDate      = date('Y-m-d', $dateTime);
        }
        return $localDate;
    }

    static function getRealDate($date = null, $validateYear = false): string
    {
        if ($validateYear) {
            $date            = date('Y-m-d', strtotime(str_replace('/', '-', $date ?? date('Y-m-d'))));
            $yearNow    = intval(date('Y', strtotime(date('Y-m-d'))));
            $yearDate    = intval(date('Y', strtotime($date)));
            if ($yearDate < $yearNow) {
                $date            = date('Y-m-d', strtotime(date('Y-m-d')));
            }
            return $date;
        } else {
            return date('Y-m-d', strtotime(str_replace('/', '-', $date ?? date('Y-m-d'))));
        }
    }

    static function getResponse($data = []): \Illuminate\Http\JsonResponse
    {
        $data['success']    = true;
        return response()->json($data);
    }

    static function getResponse201($data = []): \Illuminate\Http\JsonResponse
    {
        $data['success']    = true;
        $data['message']    = 'Recurso creado exitosamente.';
        return response()->json($data, 201);
    }

    /** 302 Found */
    static function getResponse302($data = []): \Illuminate\Http\JsonResponse
    {
        $data['success']    = true;
        return response()->json($data, 302);
    }

    /**
     * 400 Bad Request
     */
    static function getResponse400($data = []): \Illuminate\Http\JsonResponse
    {
        $data['success']    = false;
        return response()->json($data, 400);
    }

    /**
     * Unauthorized
     */
    static function getResponse401(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success'   => false,
            'message'   => 'Acceso No autorizado',
        ], 401);
    }

    /**
     * Not found
     */
    static function getResponse404(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success'   => false,
            'message'   => 'Acceso No autorizado',
        ], 401);
    }

    /**
     *
     */
    static function getResponse422(): \Illuminate\Http\JsonResponse
    {
        $data['success']    = false;
        return response()->json($data, 422);
    }

    public static function getResponse500($data  = []): \Illuminate\Http\JsonResponse
    {
        $data['success']    = false;
        return response()->json($data, 500);
    }

}
