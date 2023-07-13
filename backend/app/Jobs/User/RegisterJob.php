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
        $user   = SchoolUser::where('user_id', $this->user_id)
                    ->where('school_id', $this->school_id)
                    ->first();
        if (!$user) {
            SchoolUser::create([
                'user_id'   => $this->user_id,
                'school_id' => $this->school_id,
                'state'     => 1,
            ]);
        }

        foreach ($this->roles as $role) {
            DB::table('user_roles')->insert([
                'user_id'   => $this->user_id,
                'school_id' => $this->school_id,
                'profile_id'=> $role,
                'state'     => 1,
            ]);
        }
    }
}
