<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


Route::prefix('v1')->group(function () {
    Route::middleware('auth:api')->get('/user', function (Request $request) {
        return response()->json([
            'records'   => $request->user()
        ]);
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

    Route::group(['middleware' => 'auth:api'], function () {
        Route::get('cities',                'Location\LocationController@getCities');
        Route::get('countries',             'Location\LocationController@getCountries');
    });

    Route::prefix('admin')->group(function () {
        Route::group(['middleware' => 'auth:api'], function () {
            Route::prefix('school')->group(function () {
                Route::get('read',          'Administrative\SchoolsController@read');
                Route::put('update/{id}',   'Administrative\SchoolsController@update');
            });
            Route::resource('headquarters',  Administrative\HeadQuartersController::class);
            Route::resource('master',       MasterController::class);
        });
    });

    Route::prefix('teachers')->group(function () {

    });

    Route::prefix('students')->group(function () {

    });

    Route::prefix('families')->group(function () {

    });
});
