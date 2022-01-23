<?php

namespace App\Traits;

use PhpOffice\PhpSpreadsheet\Shared\Date;

/**
 * Messages Trait
 */
trait MessagesTrait
{

    static function getRealTimeXls($date = null)
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

    static function getRealDateXls($date = null)
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

    static function getRealDate($date = null, $validateYear = false)
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

    /**
     * 200 Created
     *
     * @param  mixed $data []
     * @return JSON
     */
    static function getResponse($data = [])
    {
        $data['success']    = true;
        return response()->json($data);
    }

    /**
     * 201 Created
     *
     * @param  mixed $data []
     * @return JSON
     */
    static function getResponse201($data = [])
    {
        $data['success']    = true;
        $data['message']    = 'Recurso creado exitosamente.';
        return response()->json($data, 201);
    }

    /**
     * 400 Bad Request
     *
     * @param  mixed $msg
     * @return void
     */
    static function getResponse400($data = [])
    {
        $data['success']    = false;
        return response()->json($data, 400);
    }

    static function getResponse401()
    {
        return response()->json([
            'success'   => false,
            'message'   => 'Acceso No autorizado',
        ], 401);
    }

    static function getResponse422()
    {
        $data['success']    = false;
        return response()->json($data, 422);
    }

        /**
     * 500 Internal Server Error
     * getErrorResponse: Retorna una respuesta de error 500
     *
     * @param  mixed $msg
     * @return JSON
     */
    public static function getResponse500($data  = [])
    {
        $data['success']    = false;
        return response()->json($data, 500);
    }

}
