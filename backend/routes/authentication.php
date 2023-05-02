<?php
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return response()->json([
        'records'   => $request->user()
    ]);
});
Route::controller('UserController')->group(function () {
    Route::prefix('email')->group(function () {
        Route::get('/verify/{id}/{hash}', 'verify')
            ->name('verification.verify');

        Route::get('/resend/{id}', 'resend')
            ->name('verification.resend');
    });
});
Route::prefix('auth')->group(function () {
    Route::controller('Auth\AuthController')->group(function () {
        Route::post('signup',                   'signup');
        Route::get('signup/activate/{token}',   'signupActivate');
        Route::post('login',                    'login');
        Route::group(['middleware' => 'auth:api'], function () {
            Route::put('user/update/{id}', 'updateAccount');
            Route::get('logout',            'logout');
        });
    });
});
