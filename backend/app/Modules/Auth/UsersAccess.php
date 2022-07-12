<?php

namespace App\Modules\Auth;

use App\Contracts\Auth\Authentication;
use App\Mail\SignupActivate;
use App\Models\User;
use App\Traits\MessagesTrait;
use App\Traits\SchoolTrait;
use App\Traits\SessionTrait;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UsersAccess implements Authentication
{

    use SessionTrait, MessagesTrait, SchoolTrait;

    public function signupActivate($token)
    {
        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return redirect('/');
        }
        /**
         * Se activa el usuario
         */
        $user->active           = true;
        $user->remember_token   = null;
        $user->email_verified_at= date('Y-m-d H:i:s');
        $user->save();

        return redirect('/');
    }

    public function signup($request): \Illuminate\Http\JsonResponse
    {
        DB::beginTransaction();
        try {
            $request->validate([
                'email'     => 'required|string|email',
                'password'  => 'required|string',
                'first_name'=> 'required|string',
                'last_name' => 'required|string',
            ]);

            $credentials = request(['email', 'password']);
            $credentials['active'] = 1;
            if (Auth::attempt($credentials)) {
                return self::getResponse302(['message' => 'Ya se encuentra registrado en nuestra base de datos.']);
            }

            $password   = $request->password ?? bin2hex(random_bytes(6));
            $token      = Str::random(80);
            $user = User::create([
                'first_name'        => $request->first_name,
                'last_name'         => $request->last_name,
                'email'             => $request->email,
                'password'          => bcrypt($password),
                'remember_token'    => $token,
                'active'            => 0
            ]);
            $user->save();

            $message    = (object)[
                'userName'              => "{$request->first_name} {$request->last_name}",
                'password'              => $password,
                'url'                   => url('/api/v1/auth/signup/activate/'.$token),
                'email'                 => $request->email
            ];

            DB::commit();

            Mail::to('registro@matias.com.co')->queue(new SignupActivate($message));
            Mail::to($request->email)->queue(new SignupActivate($message));

            return self::getResponse201();

        } catch (Exception $e) {
            DB::rollBack();
            return self::getResponse500(['error' => $e->getMessage()]);
        }

    }

    public function login(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'email'       => 'required|string|email',
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
            'first_name'    => $user->first_name,
            'last_name'     => $user->last_name,
            'avatar'        => $user->avatar,
            'message'       => 'Token de acceso generado con exito',
            'success'       => true,
            'expires_at'    => Carbon::parse($tokenResult->token->expires_at)->toDateTimeString()
        ]);

    }

    public function logout(Request $request): \Illuminate\Http\JsonResponse
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
