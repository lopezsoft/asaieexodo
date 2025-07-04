<?php

namespace App\Jobs;

use App\Services\ProfileRegistrationService; // Importamos el nuevo servicio
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessProfilesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $schoolId;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(int $schoolId)
    {
        $this->schoolId = $schoolId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(ProfileRegistrationService $registrationService)
    {
        Log::info("Iniciando el job de procesamiento de perfiles para la escuela: {$this->schoolId}");

        try {
            // Delegamos toda la lógica pesada al servicio
            $registrationService->process($this->schoolId);
            Log::info("Job de procesamiento de perfiles finalizado con éxito para la escuela: {$this->schoolId}");
        } catch (Throwable $e) {
            Log::error("Error en el job de procesamiento de perfiles para la escuela: {$this->schoolId}. Error: {$e->getMessage()}");
            $this->fail($e); // Marcar el job como fallido
        }
    }
}
