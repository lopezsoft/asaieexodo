<?php

namespace App\Services\Representative;

use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

class RepresentativeValidatorService
{
    /**
     * @throws Exception
     */
    public static function panelControlValidator($db): object
    {
        // Validar si la jornada está activa.
        $control = DB::table("{$db}tp_control_panel")
            ->where('year', date('Y'))
            ->where('state', 1)
            ->first();
        if (!$control) {
            throw new Exception("La configuración de la jornada no está activa o creada.", 404);
        }
        // Concatena la fecha y hora de inicio
        $startDate          = $control->start_date . ' ' . $control->start_time;
        // Convierte la cadena de fecha y hora a una instancia de Carbon
        $startDateCarbon    = Carbon::createFromFormat('Y-m-d g:i A', $startDate);
        $startDate          = $startDateCarbon->format('d-m-Y h:i A');
        // Compara con la fecha y hora de finalización
        $dateEnd            = $control->start_date . ' ' . $control->closing_time;
        $dateEndCarbon      = Carbon::createFromFormat('Y-m-d g:i A', $dateEnd);
        $dateEnd            = $dateEndCarbon->format('d-m-Y h:i A');

        $currentDate        = Carbon::now()->format('Y-m-d g:i A');
        if($currentDate < $startDate) {
            throw new Exception(
                "La fecha y hora de inicio de la jornada no ha llegado.
                Faltan " . $startDateCarbon->diffForHumans($currentDate).
                ". Fecha de inicio de la jornada {$startDateCarbon->format('d-m-Y h-i-s A')}", 400);
        }
        if ($dateEnd > $currentDate) {
            throw new Exception("La fecha y hora de finalización ya pasó.
                No se puede iniciar la jornada", 400);
        }
        // Compara con la fecha y hora actual
        if ($dateEndCarbon->isPast()) {
            throw new Exception("La fecha y hora de finalización ya pasó.
                No se puede iniciar la jornada", 400);
        }

        return (object) [
            'startDate'         => $startDate,
            'startDateCarbon'   => $startDateCarbon->format('Y-m-d g:i A'),
            'dateEnd'           => $dateEnd,
            'dateEndCarbon'     => $dateEndCarbon->format('Y-m-d g:i A'),
            'currentDate'       => $currentDate,
            'control'           => $control,
        ];
    }
}
