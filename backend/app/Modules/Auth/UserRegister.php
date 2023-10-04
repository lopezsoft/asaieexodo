<?php

namespace App\Modules\Auth;

use App\Jobs\User\RegisterJob;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserRegister
{
    use MessagesTrait;
    public static function register(Request $request): JsonResponse
    {
        $request->validate([
            'email'      => 'required|string|email|unique:users',
            'profile_id' => ['required','array', 'exists:user_profiles,id'],
            'school_id'  => ['required','integer', 'exists:schools,id'],
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
        ]);
        try {
            DB::beginTransaction();
            $request->password  = Str::random(8);
            $user               = RegisteredUser::store($request);
            DB::commit();
            RegisterJob::dispatch($user->id, $request->school_id, $request->profile_id );
            return self::getResponse201();
        } catch (Exception $e) {
            DB::rollBack();
            return self::getResponse500(['error' => $e->getMessage()]);
        }
    }
}
