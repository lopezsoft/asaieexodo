<?php

namespace App\Modules\Auth;

use App\Common\HttpResponseMessages;
use App\Common\MessageExceptionResponse;
use App\Contracts\Auth\AuthenticationRegisterContract;
use App\Jobs\ProcessProfilesJob;
use App\Modules\School\SchoolQueries;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampusRegisterProfile implements AuthenticationRegisterContract
{
    /**
     * @throws Exception
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $schoolId = SchoolQueries::getSchoolRequest($request)->id;
            // 2. Despacha el job a la cola con el ID de la escuela
            ProcessProfilesJob::dispatch($schoolId);

            // 3. Devuelve una respuesta inmediata al usuario
            return HttpResponseMessages::getResponse([
                'message' => 'El proceso de registro de perfiles ha comenzado y se ejecutará en segundo plano.'
            ]);
        }catch (Exception $e){
            return MessageExceptionResponse::response($e);
        }

    }

}
