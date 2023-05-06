<?php
Route::controller('UserController')->group(function () {
    Route::prefix('user')->group(function () {
        Route::post('/register', 'register');
        Route::group(['middleware' => 'auth:api'], function () {
            Route::put('/update/{id}', 'updateAccount');
        });
    });
    Route::prefix('email')->group(function () {
        Route::get('/verify/{id}/{hash}', 'verify')
            ->name('verification.verify');

        Route::get('/resend/{id}', 'resend')
            ->name('verification.resend');
    });
});
Route::prefix('auth')->group(function () {
    Route::controller('Auth\AuthController')->group(function () {
        Route::post('register',                 'signup');
        Route::post('login',                    'login');
        Route::group(['middleware' => 'auth:api'], function () {
            Route::get('logout',            'logout');
        });
    });
});
