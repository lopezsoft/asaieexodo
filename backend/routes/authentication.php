<?php
Route::prefix('user')->group(function () {
    Route::controller('UserController')->group(function () {
        Route::post('register', 'register');
        Route::group(['middleware' => 'auth:api'], function () {
            Route::put('/update/{id}', 'updateAccount');
            Route::delete('/delete/{id}', 'updateAccount');
        });
    });
});
Route::prefix('auth')->group(function () {
    Route::controller('Auth\AuthController')->group(function () {
        Route::post('teachers/register',        'teachersRegister');
        Route::post('register',                 'register');
        Route::post('login',                    'login');
        Route::group(['middleware' => 'auth:api'], function () {
            Route::get('logout',            'logout');
        });
    });
});
