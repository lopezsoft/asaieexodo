<?php

namespace App\Jobs\User;

use App\Models\User\SchoolUser;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class RegisterJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(
        public $user_id,
        public $school_id,
        public array $roles,
    )
    {
        //
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // 1. Usa firstOrCreate para simplificar la creación.
        SchoolUser::firstOrCreate(
            [
                'user_id'   => $this->user_id,
                'school_id' => $this->school_id,
            ],
            [
                'state'     => 1,
            ]
        );

        // 2. Prepara los nuevos roles para una inserción masiva.
        $rolesToInsert = collect($this->roles)->map(function ($role) {
            return [
                'user_id'    => $this->user_id,
                'school_id'  => $this->school_id,
                'profile_id' => $role,
                'state'      => 1
            ];
        })->all();

        // 3. Ejecuta solo 2 consultas: una para borrar y otra para insertar todo.
        DB::transaction(function () use ($rolesToInsert) {
            DB::table('user_roles')
                ->where('user_id', $this->user_id)
                ->where('school_id', $this->school_id)
                ->delete();

            if (!empty($rolesToInsert)) {
                DB::table('user_roles')->insert($rolesToInsert);
            }
        });
    }
}
