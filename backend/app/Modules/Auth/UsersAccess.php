<?php

namespace App\Modules\Auth;

use App\Contracts\Auth\Authentication;
use App\Traits\MessagesTrait;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;

class UsersAccess implements Authentication
{
    use MessagesTrait;
    public function register($request): JsonResponse
    {
        $request->validate([
            'email'     => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password'  => ['required', 'confirmed', Rules\Password::defaults()],
            'first_name'=> 'required|string',
            'last_name' => 'required|string',
        ]);
        DB::beginTransaction();
        try {
            RegisteredUser::store($request);
            DB::commit();
            return self::getResponse201();
        } catch (Exception $e) {
            DB::rollBack();
            return self::getResponse500(['error' => $e->getMessage()]);
        }
    }

    public function login(Request $request): JsonResponse
    {
        $emailValidated = $request->withOutEmail ? 'required|string' : 'required|string|email' ;
        $request->validate([
            'email'       => $emailValidated,
            'password'    => 'required|string',
            'remember_me' => 'boolean',
        ]);

        $credentials = request(['email', 'password']);
        $credentials['active'] = 1;
        if (!Auth::attempt($credentials)) {
            return self::getResponse401();
        }

        $user           = $request->user();
        $tokenResult    = $user->createToken($user->email);
        $token          = $tokenResult->token;
        if ($request->remember_me) {
            $token->expires_at = Carbon::now()->addWeeks(1);
        }
        $token->save();

        return response()->json([
            'access_token'  => $tokenResult->accessToken,
            'token_type'    => 'Bearer',
            'user'          => [
                'id'          => $user->id,
                'email'       => $user->email,
                'avatar'      => $user->avatar,
                'first_name'  => $user->first_name,
                'last_name'   => $user->last_name,
                'fullname'    => $user->fullname,
            ],
            'message'       => 'Token de acceso generado con exitoso',
            'success'       => true,
            'expires_at'    => Carbon::parse($tokenResult->token->expires_at)->toDateTimeString()
        ]);

    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->token()->revoke();
            return self::getResponse(['message' => 'Successfully logged out']);
        } catch (Exception $e) {
            return self::getResponse500([
                'message' => $e->getMessage(),
            ]);
        }
    }
}
