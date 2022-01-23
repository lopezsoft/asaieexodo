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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::prefix('v1')->group(function () {

    Route::group(['middleware' => 'auth:sanctum'], function () {
        Route::get('cities',                'Location\LocationController@getCities');
        Route::get('countries',             'Location\LocationController@getCountries');
    });

    Route::prefix('admin')->group(function () {
        Route::prefix('auth')->group(function () {
            Route::post('login',            'Auth\AuthController@userLogin');
        });

        Route::group(['middleware' => 'auth:sanctum'], function () {

            Route::prefix('auth')->group(function () {
                Route::get('logout',            'Auth\AuthController@userLogout');
            });

            Route::prefix('school')->group(function () {
                Route::get('read',          'Administrative\SchoolsController@read');
                Route::put('update/{id}',   'Administrative\SchoolsController@update');
            });
        });
    });

    Route::prefix('teachers')->group(function () {

    });

    Route::prefix('students')->group(function () {

    });

    Route::prefix('families')->group(function () {

    });
});
