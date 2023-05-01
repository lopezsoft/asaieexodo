<?php
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
    require __DIR__.'/authentication.php';
    Route::group(['middleware' => 'auth:api'], function () {
        Route::apiResource('crud', 'SchoolMasterController');
        Route::resource('/index',       'MasterController');
        Route::controller('Location\LocationController')->group(function () {
            Route::get('cities',                'getCities');
            Route::get('countries',             'getCountries');
        });
        require __DIR__.'/school.php';
        require __DIR__.'/academic.php';
        require __DIR__.'/courses.php';
        Route::prefix('teachers')->group(function () {
            Route::controller('Administrative\TeachersController')->group(function () {
               Route::get('get-by-year', 'getByYear');
            });
        });
        require __DIR__.'/students.php';
        require __DIR__.'/representative.php';
        require __DIR__.'/files.php';
        require __DIR__.'/exports.php';
        require __DIR__.'/reports.php';
        require __DIR__.'/settings.php';
        require __DIR__.'/academic-leveling.php';
        require __DIR__.'/promotion.php';
    });
});
