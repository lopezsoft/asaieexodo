<?php

namespace App\Http\Controllers\Auth;

use App\Common\HttpResponseMessages;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function change(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
        ]);
        $uuid   = $request->uuid ?? null;
        if ($uuid) {
            $user   = User::where('id', $uuid)->first();
        }else {
            $user   = User::where('email', $request->email)->first();
        }
        if(!$user) {
            return HttpResponseMessages::getResponse404([
                'message'   => 'El usuario no existe.'
            ]);
        }
        $user->email_verified_at    = null;
        $user->email                = $request->email;
        $user->save();
        $user->sendEmailVerificationNotification();
        Auth::login($user);
        return response()->json(['message' => 'Se ha enviado un correo electrónico de verificación']);
    }
    public function store(Request $request): JsonResponse
    {
        $uuid   = $request->uuid ?? null;
        if ($uuid) {
            $user   = User::where('id', $uuid)->first();
        }else {
            $user   = User::where('email', $request->email ?? '')->first();
        }
        if(!$user) {
            return HttpResponseMessages::getResponse404([
                'message'   => 'El usuario no existe.'
            ]);
        }
        if ($user->hasVerifiedEmail()) {
            return HttpResponseMessages::getResponse400([
                'message'   => 'El correo electrónico ya fue verificado.'
            ]);
        }
        $user->sendEmailVerificationNotification();
        Auth::login($user);
        return response()->json(['message' => 'Se ha enviado un correo electrónico de verificación']);
    }
}
