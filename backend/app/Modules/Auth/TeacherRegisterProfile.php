<?php

namespace App\Modules\Auth;

use App\Common\HttpResponseMessages;
use App\Common\MessageExceptionResponse;
use App\Contracts\Auth\AuthenticationRegisterContract;
use App\Jobs\User\RegisterJob;
use App\Models\User;
use App\Modules\School\SchoolQueries;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
class TeacherRegisterProfile implements AuthenticationRegisterContract
{

    /**
     * @throws Exception
     */
    public function register(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            DB::beginTransaction();

            $schoolDb = SchoolQueries::getSchoolRequest($request)->db;

            // Obtener solo docentes únicos que no estén duplicados.
            $teachers = DB::table("{$schoolDb}docentes as a")
                ->select('a.id_docente', 'a.documento', 'a.nombre1', 'a.apellido1')
                ->where('a.estado', 1)
                ->whereNotExists(function ($query) use ($schoolDb) {
                    $query->select(DB::raw(1))
                        ->from("{$schoolDb}teachers_and_users_ids as b")
                        ->whereRaw('b.teacher_id = a.id_docente');
                })
                ->groupBy('a.documento')
                ->havingRaw('COUNT(a.documento) = 1')
                ->get();

            if ($teachers->isEmpty()) {
                DB::commit();
                return HttpResponseMessages::getResponse(['message' => 'No hay docentes sin acceso para procesar.']);
            }

            // 1. Pre-buscar todos los vínculos existentes para los docentes encontrados.
            $teacherIds = $teachers->pluck('id_docente');
            $existingLinks = DB::table("{$schoolDb}teachers_and_users_ids")
                ->whereIn('teacher_id', $teacherIds)
                ->get()
                ->keyBy('teacher_id'); // Clave por teacher_id para búsqueda rápida.

            $usersToUpdate = [];
            $newLinksToInsert = [];
            $jobsToDispatch = [];

            // 2. Iterar sobre los docentes para decidir si actualizar o crear.
            foreach ($teachers as $teacher) {
                // Si el teacher_id ya existe en la tabla de vínculos...
                if ($existingLinks->has($teacher->id_docente)) {
                    // 3. Preparar los datos para la ACTUALIZACIÓN del usuario existente.
                    $link = $existingLinks->get($teacher->id_docente);
                    $usersToUpdate[$link->user_id] = [ // Usar user_id como clave para evitar duplicados.
                        'first_name' => $teacher->nombre1,
                        'last_name'  => $teacher->apellido1,
                        // Considera si también debes actualizar el email/documento.
                        // 'email' => $teacher->documento,
                    ];
                } else {
                    // 4. Si NO existe el vínculo, proceder con la lógica de CREACIÓN.
                    $user = User::firstOrCreate(
                        ['email' => $teacher->documento],
                        [
                            'password'          => Hash::make($teacher->documento),
                            'first_name'        => $teacher->nombre1,
                            'last_name'         => $teacher->apellido1,
                            'email_verified_at' => now(),
                            'user_type'         => 4, // Asignar tipo de usuario como docente
                        ]
                    );

                    $newLinksToInsert[] = [
                        'teacher_id' => $teacher->id_docente,
                        'user_id'    => $user->id,
                    ];

                    // Despachar job solo si el usuario es completamente nuevo.
                    if ($user->wasRecentlyCreated) {
                        $jobsToDispatch[] = [
                            'userId'   => $user->id,
                            'schoolId' => $request->schoolId,
                            'roles'    => [4],
                        ];
                    }
                }
            }

            // 5. Ejecutar todas las operaciones de base de datos después del bucle.

            // Actualizar usuarios existentes
            if (!empty($usersToUpdate)) {
                foreach($usersToUpdate as $userId => $data) {
                    User::where('id', $userId)->update($data);
                }
            }

            // Insertar nuevos vínculos
            if (!empty($newLinksToInsert)) {
                DB::table("{$schoolDb}teachers_and_users_ids")->insertOrIgnore($newLinksToInsert);
            }

            // Despachar todos los jobs
            foreach($jobsToDispatch as $jobData) {
                RegisterJob::dispatch($jobData['userId'], $jobData['schoolId'], $jobData['roles']);
            }

            DB::commit();

            return HttpResponseMessages::getResponse([
                'message' => 'Los docentes han sido procesados y actualizados correctamente.'
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return MessageExceptionResponse::response($e);
        }
    }
}
