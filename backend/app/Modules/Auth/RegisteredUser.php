<?php

namespace App\Modules\Auth;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

class RegisteredUser
{
    public static function store(Request $request) {
        $user = User::create([
            'first_name'        => $request->first_name,
            'last_name'         => $request->last_name,
            'email'             => $request->email,
            'password'          => Hash::make($request->password),
            'active'            => 0
        ]);
        $data  = (object) [
            'fullName' => "{$request->first_name} {$request->last_name}",
            'password' => $request->password
        ];
        self::sendEmail($user, $data);
        return $user;
    }
    public static function sendEmail($user, $data): void
    {
        Auth::login($user);
        Notification::send($user, new VerifyEmailNotification($data));
    }
}
