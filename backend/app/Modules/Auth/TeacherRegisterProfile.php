<?php

namespace App\Modules\Auth;

use App\Contracts\Auth\AuthenticationRegisterContract;
use App\Jobs\User\RegisterJob;
use App\Models\User;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class TeacherRegisterProfile implements AuthenticationRegisterContract
{
    use MessagesTrait;

    /**
     * @throws Exception
     */
    public function register(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            DB::beginTransaction();
            $school         = SchoolQueries::getSchoolRequest($request);
            $db             = $school->db;
            $teacherList    = DB::table("{$db}docentes", "a")
                                ->where('a.estado', 1)
                                ->whereNotExists(function ($query) use ($db) {
                                    $query->select(DB::raw(1))
                                        ->from("users as b")
                                        ->whereRaw("b.email = a.documento");
                                })
                                ->get();
            foreach ($teacherList as $teacher) {
                $user = User::create([
                    'email'             => $teacher->documento,
                    'password'          => Hash::make($teacher->documento),
                    'first_name'        => $teacher->nombre1,
                    'last_name'         => $teacher->apellido1,
                    'active'            => 1,
                ]);
                $user->email_verified_at = now();
                $user->save();
                RegisterJob::dispatch($user->id, $request->schoolId, [4] );
            }
            DB::commit();
            return self::getResponse201();
        } catch (Exception $e) {
            DB::rollBack();
            return self::getResponse500(['error' => $e->getMessage()]);
        }
    }
}
