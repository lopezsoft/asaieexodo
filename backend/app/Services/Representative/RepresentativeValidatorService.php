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

      /*  $startDateCarbon = Carbon::parse("{$control->start_date} {$control->start_time}");
        $endDateCarbon   = Carbon::parse("{$control->start_date} {$control->closing_time}");
        $now             = Carbon::now();

        // Antes de iniciar
        if ($now->lt($startDateCarbon)) {
            throw new Exception(
                "La jornada no inicia hasta "
                . $startDateCarbon->diffForHumans($now)
                . ". Inicio: " . $startDateCarbon->format('d-m-Y h:i A'),
                400
            );
        }

        // Después de finalizar
        if ($now->gt($endDateCarbon)) {
            throw new Exception(
                "La jornada finalizó el "
                . $endDateCarbon->format('d-m-Y h:i A')
                . ". No se puede iniciar.",
                400
            );
        }*/
        // Concatena la fecha y hora de inicio
        $startDate          = $control->start_date . ' ' . $control->start_time;
        // Convierte la cadena de fecha y hora a una instancia de Carbon
        $startDateCarbon    = Carbon::createFromFormat('Y-m-d g:i A', $startDate);
        // Compara con la fecha y hora de finalización
        $dateEnd            = $control->start_date . ' ' . $control->closing_time;
        $dateEndCarbon      = Carbon::createFromFormat('Y-m-d g:i A', $dateEnd);

        $now                = Carbon::now();

        // Antes de iniciar
        if ($now->lt($startDateCarbon)) {
            throw new Exception(
                "La fecha y hora de inicio de la jornada no ha llegado. Faltan "
                . $startDateCarbon->diffForHumans($now)
                . ". Fecha de inicio de la jornada: " . $startDateCarbon->format('d-m-Y h:i A'), 400);
        }

        // Después de finalizar
        if ($now->gt($dateEndCarbon)) {
            throw new Exception(
                "La jornada finalizó el "
                . $dateEndCarbon->format('d-m-Y h:i A')
                . ". No se puede continuar.", 400);
        }

        return (object) [
            'startDate'         => $startDateCarbon->format('d-m-Y h:i A'),
            'startDateCarbon'   => $startDateCarbon->format('Y-m-d g:i A'),
            'dateEnd'           => $dateEndCarbon->format('d-m-Y h:i A'),
            'dateEndCarbon'     => $dateEndCarbon->format('Y-m-d g:i A'),
            'currentDate'       => $now->format('Y-m-d g:i A'),
            'control'           => $control,
        ];
    }
}
