<?php

namespace App\Modules\Auth;

use App\Contracts\Auth\Authentication;
use App\Mail\SignupActivate;
use App\Models\User;
use App\Traits\MessagesTrait;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UsersAccess implements Authentication
{

    use MessagesTrait;

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
                'password'  => ['required','string', 'confirmed','min:6'],
                'first_name'=> 'required|string',
                'last_name' => 'required|string',
            ]);
            $password   = $request->password ?? bin2hex(random_bytes(6));
            $token      = Str::random(80);
            $credentials = request(['email', 'password']);
            if (Auth::attempt($credentials)) {
                return self::getResponse302(['message' => 'Ya se encuentra registrado en nuestra base de datos.']);
            }

            $user = User::create([
                'first_name'        => $request->first_name,
                'last_name'         => $request->last_name,
                'email'             => $request->email,
                'password'          => bcrypt($password),
                'remember_token'    => $token,
                'active'            => 0
            ]);
            $user->save();

            DB::commit();

            $this->sendMail($request, $password, $token);

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

    public function sendMail(Request $request, $password, $token): void {
        $message    = (Object)[
            'userName'              => "{$request->first_name} {$request->last_name}",
            'password'              => $password,
            'url'                   => url('/api/v1/auth/signup/activate/'.$token),
            'email'                 => $request->email
        ];

        Mail::to($request->email)->queue(new SignupActivate($message));
        Mail::to('registro@matias.com.co')->send(new SignupActivate($message));
    }
}
