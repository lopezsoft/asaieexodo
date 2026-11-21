<?php

namespace App\Services;

use App\Jobs\User\RegisterJob;
use App\Models\User;
use App\Modules\School\SchoolQueries;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProfileRegistrationService
{
    private string $db;
    private int $schoolId;

    /**
     * Procesa la creación y vinculación de usuarios para una escuela.
     *
     * @param int $schoolId
     * @throws \Throwable
     */
    public function process(int $schoolId): void
    {
        $this->schoolId = $schoolId;
        $this->db       = SchoolQueries::getSchool($schoolId)->database_name. '.';

        // DB::beginTransaction();
        try {
            $this->processProfileType('student', [5]);
            $this->processProfileType('family', [7]);
            // DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e; // Relanzar la excepción para que el job la capture
        }
    }

    /**
     * Procesa un tipo de perfil (student o family) en lotes.
     */
    private function processProfileType(string $profileType, array $roles): void
    {
        $query = $this->getBaseQuery($profileType);

        // Procesar en lotes de 200 para mantener el uso de memoria bajo
        $query->chunkById(200, function ($batch) use ($profileType, $roles) {
            $this->processBatch($batch, $profileType, $roles);
        }, 'a.id', 'id');
    }

    /**
     * Procesa un lote específico de perfiles, creando usuarios y vínculos de forma masiva.
     */
    private function processBatch(Collection $batch, string $profileType, array $roles): void
    {
        if ($batch->isEmpty()) {
            return;
        }

        // 1. Recolectar todos los documentos del lote.
        $documents = $batch->pluck('document')->unique()->all();

        // 2. Encontrar usuarios que YA existen con UNA SOLA consulta.
        $existingUsers = User::whereIn('email', $documents)->get()->keyBy('email');

        // 3. Filtrar para obtener solo los usuarios que se deben crear.
        $newUsersToCreate = $batch->filter(fn($item) => !$existingUsers->has($item->document))
            ->map(fn($item) => [
                'email' => $item->document,
                'password' => Hash::make($item->document),
                'first_name' => $item->nombre1,
                'last_name' => $item->apellido1,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ])->values()->all();

        // 4. Insertar todos los usuarios nuevos, asegurándose de que no haya emails duplicados DENTRO del lote.
        if (!empty($newUsersToCreate)) {
            // La corrección clave está aquí:
            $uniqueNewUsers = collect($newUsersToCreate)->unique('email')->values()->all();

            if(!empty($uniqueNewUsers)) {
                User::insert($uniqueNewUsers);
            }
        }

        // 5. Obtener TODOS los usuarios relevantes del lote (existentes + recién creados).
        $allRelevantUsers = User::whereIn('email', $documents)->get()->keyBy('email');

        // 6. Preparar y crear todos los VÍNCULOS de forma masiva.
        $linksToInsert = $batch->map(function ($item) use ($allRelevantUsers, $profileType) {
            if ($user = $allRelevantUsers->get($item->document)) {
                return [
                    'family_id' => $item->id,
                    'user_id' => $user->id,
                    'profile' => $profileType
                ];
            }
            return null;
        })->filter()->values()->all();

        if (!empty($linksToInsert)) {
            DB::table("{$this->db}family_and_users_ids")->insertOrIgnore($linksToInsert);
        }

        // 7. Despachar Jobs para los usuarios recién creados.
        foreach($newUsersToCreate as $userData) {
            if ($user = $allRelevantUsers->get($userData['email'])) {
                // Se podría optimizar para despachar un solo job con un array de usuarios,
                // pero despachar individualmente también es robusto.
                RegisterJob::dispatch($user->id, $this->schoolId, $roles);
            }
        }
    }

    /**
     * Construye la consulta base para obtener perfiles sin usuario.
     */
    private function getBaseQuery(string $profileType): \Illuminate\Database\Query\Builder
    {
        $table      = ($profileType === 'student') ? 'inscripciones' : 'families';
        $name1      = ($profileType === 'student') ? 'a.nombre1' : 'a.name1 as nombre1';
        $lastname1  = ($profileType === 'student') ? 'a.apellido1' : 'a.lastname1 as apellido1';
        $document   = ($profileType === 'student') ? 'a.nro_documento as document' : 'a.document';
        $documentCol    = ($profileType === 'student') ? 'nro_documento' : 'document';
        $documentGroup  = ($profileType === 'student') ? 'a.nro_documento' : 'a.document';

        return DB::table("{$this->db}{$table} as a")
            ->select('a.id', $document, $name1, $lastname1)
            ->whereNotNull("a.{$documentCol}")
            ->where("a.{$documentCol}", '!=', '0')
            ->where("a.{$documentCol}", '!=', '000000000')
            ->whereRaw("a.{$documentCol} REGEXP '^[0-9]+$'") // Asegura que sea 100% numérico
            ->leftJoin("{$this->db}family_and_users_ids as b", function ($join) use ($profileType) {
                $join->on('a.id', '=', 'b.family_id')->where('b.profile', '=', $profileType);
            })
            ->whereNull('b.family_id') // La clave para un rendimiento óptimo
            ->groupBy($documentGroup) // Asumiendo que quieres usuarios únicos por documento
            ->havingRaw("COUNT({$documentGroup}) = 1");
    }
}
