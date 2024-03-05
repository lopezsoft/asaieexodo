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
            $school         = SchoolQueries::getSchoolRequest($request);
            $db             = $school->db;
            $teacherList    = DB::table("{$db}docentes", "a")
                                ->selectRaw("a.*, COUNT(a.documento) AS total")
                                ->where('a.estado', 1)
                                ->groupBy('a.documento')
                                ->get();
            foreach ($teacherList as $teacher) {
                if ($teacher->total > 1) {
                    continue;
                }
                $user       = User::where('email', $teacher->documento)->first();
                $teacherId  = $teacher->id_docente ?? $teacher->id;
                if ($user) {
                    $teacherAndUser = DB::table("{$db}teachers_and_users_ids")
                                        ->where('teacher_id', $teacherId)
                                        ->where('user_id', $user->id)
                                        ->first();
                    if (!$teacherAndUser){
                        DB::table("{$db}teachers_and_users_ids")->insert([
                            'teacher_id'    => $teacherId,
                            'user_id'       => $user->id,
                        ]);
                        RegisterJob::dispatch($user->id, $request->schoolId, [4] );
                    }
                    continue;
                }
                $user = User::create([
                    'email'             => $teacher->documento,
                    'password'          => Hash::make($teacher->documento),
                    'first_name'        => $teacher->nombre1,
                    'last_name'         => $teacher->apellido1,
                    'active'            => 1,
                ]);
                $user->email_verified_at = now();
                $user->save();
                DB::table("{$db}teachers_and_users_ids")->insert([
                    'teacher_id'    => $teacherId,
                    'user_id'       => $user->id,
                ]);
                RegisterJob::dispatch($user->id, $request->schoolId, [4] );
            }
            DB::commit();
            return HttpResponseMessages::getResponse([
                'message' => 'Se han registrado correctamente los usuarios'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return MessageExceptionResponse::response($e);
        }
    }
}
