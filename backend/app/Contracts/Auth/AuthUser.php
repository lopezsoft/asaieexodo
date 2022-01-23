<?php

declare(strict_types=1);

namespace App\Contracts\Auth;

use Exception;
use App\Models\User;
use App\Traits\SchoolTrait;
use App\Traits\SessionTrait;
use Illuminate\Http\Request;
use App\Traits\MessagesTrait;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Contracts\Auth\AuthInterface;

class AuthUser implements AuthInterface
{

    use SessionTrait;

    function login(Request $request) {
        $user_name      = $request->user_name ?? null;
        $password       = sha1($request->password) ?? null;
        $year           = $request->year ?? null;
        $school_code    = $request->school_code ?? null;
        $make_token     = $request->make_token ?? null;
        $remember_me    = $request->remember_me ?? false;

        $school         = null;
        $user           = null;

        $user           = User::where('user_name', $user_name)
                            ->where('password', $password)
                            ->first();
        if(!$user) {
            return MessagesTrait::getResponse401();
        }

        if($school_code) {

            $school         = SchoolTrait::getSchoolByCode($school_code);

            $schoolUser     = DB::table('school_users')
                                ->where('user_id', $user->id)
                                ->where('school_id', $school->id)
                                ->where('state', 1)
                                ->first();

            if(!$schoolUser) {
                return MessagesTrait::getResponse401();
            }

        }else {

            $schoolUser     = DB::table('school_users')
                                ->where('user_id', $user->id)
                                ->where('state', 1)
                                ->first();

            if(!$schoolUser) {
                return MessagesTrait::getResponse401();
            }

            $school = SchoolTrait::getSchoolById($schoolUser->school_id);

            if(!$school) {
                return MessagesTrait::getResponse401();
            }

        }

        $token_type = null;
        $token      = null;
        try {
            $token      = $user->createToken('auth_token')->plainTextToken;
            $token_type = 'Bearer';

            $db         = $school->database_name;

            $sessionData = [
                'year'      => $year,
                'database'  => $school->database_name,
                'statecode' => $school->statecode
            ];


            $schoolFull =  DB::table($db.'.school')->first();

            Auth::login($user, $remember_me);

            return MessagesTrait::getResponse([
                'access_token'      => $token,
                'token_type'        => $token_type,
                'user'              => $user,
                'school'    => [
                    "statecode"     => $school->statecode,
                    "school_name"   => $schoolFull->school_name,
                    "lockdate"      => $school->lockdate,
                    'year'          => $year,
                ]
            ]);

        } catch (Exception $e) {
            return MessagesTrait::getResponse500([
                'message' => $e->getMessage(),
            ]);
        }


    }

    function logout(Request $request) {

        try {
            $user       = Auth::user();

            $session    = $request->session ?? null;

            if($session){
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            $request->user()->currentAccessToken()->delete();

            SessionTrait::sessionDelete();

            return MessagesTrait::getResponse([
                'user'      => $user,
                'message'   => 'Session closed successfully'
            ]);

        } catch (Exception $e) {
            return MessagesTrait::getResponse500([
                'message' => $e->getMessage(),
            ]);
        }

    }

}
