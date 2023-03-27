<?php

namespace App\Modules\Auth;

use App\Jobs\User\RegisterJob;
use App\Models\User;
use App\Traits\MessagesTrait;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
class UserRegister
{
    use MessagesTrait;

    public static function verify(Request $request, $user_id, $hash): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        if (!$request->hasValidSignature()) {
            return response()->json([
                "success"   => false,
                "message"   => "Enlace inválido o caducado."
            ], 401);
        }

        $user = User::findOrFail($user_id);

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
            $user->active = 1;
            $user->save();
        }


        return redirect()->to(env('MAIL_REDIRECT', 'APP_URL'));
    }

    public static function resend($user_id): \Illuminate\Http\JsonResponse
    {
        $user = User::find($user_id);
        if(!$user) {
            return self::getResponse400([
                'message'   => 'El usuario no existe.'
            ]);
        }
        if ($user->hasVerifiedEmail()) {
            return self::getResponse400([
                'message'   => 'El correo electrónico ya fue verificado.'
            ]);
        }

        $user->sendEmailVerificationNotification();

        return self::getResponse([
            'message'   => 'Enlace de verificación de correo electrónico enviado.'
        ]);
    }
    public static function register(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $request->validate([
                'email'      => 'required|string|email|unique:users',
                'profile_id' => ['required','array', 'exists:user_profiles,id'],
                'school_id'  => ['required','integer', 'exists:schools,id'],
                'first_name' => 'required|string',
                'last_name'  => 'required|string',
            ]);

            $user = User::create([
                'first_name'        => $request->first_name,
                'last_name'         => $request->last_name,
                'email'             => $request->email,
                'password'          => bcrypt($request->email),
                'active'            => 0
            ]);
            $user->sendEmailVerificationNotification();
            RegisterJob::dispatch($user->id, $request->school_id, $request->profile_id );
            return self::getResponse201();
        } catch (Exception $e) {
            return self::getResponse500(['error' => $e->getMessage()]);
        }
    }
}
