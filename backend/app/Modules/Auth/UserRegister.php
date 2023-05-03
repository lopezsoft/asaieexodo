<?php

namespace App\Modules\Auth;

use App\Jobs\User\RegisterJob;
use App\Models\User;
use App\Notifications\VerifiedEmailNotification;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class UserRegister
{
    use MessagesTrait;

    public static function verify(Request $request, $user_id, $hash): JsonResponse|\Illuminate\Http\RedirectResponse
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
            $user->active = 1;
            $user->save();
            $data  = (object) [
                'fullName' => $user->name,
            ];
            Notification::send($user, new VerifiedEmailNotification($data));
        }

        return redirect()->to(env('FRONTEND_URL', 'APP_URL'));
    }

    public static function resend($user_id): JsonResponse
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
