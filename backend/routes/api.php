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
    require_once __DIR__.'/voting-public.php';
    Route::middleware('auth:api')->get('/user', function (Request $request) {
        return response()->json([
            'records'   => $request->user()
        ]);
    });
    require_once __DIR__.'/auth-api.php';
    require_once __DIR__.'/authentication.php';
    Route::group(['middleware' => 'auth:api'], function () {
        Route::apiResource('crud', 'SchoolMasterController');
        Route::resource('/index',       'MasterController');
        Route::controller('Location\LocationController')->group(function () {
            Route::get('cities',                'getCities');
            Route::get('countries',             'getCountries');
        });
        require_once __DIR__.'/school.php';
        require_once __DIR__.'/observer.php';
        require_once __DIR__.'/academic.php';
        require_once __DIR__.'/courses.php';
        require_once __DIR__.'/teachers.php';
        require_once __DIR__.'/education-processes.php';
        require_once __DIR__.'/students.php';
        require_once __DIR__.'/representative.php';
        require_once __DIR__.'/files.php';
        require_once __DIR__.'/exports.php';
        require_once __DIR__.'/reports.php';
        require_once __DIR__.'/settings.php';
        require_once __DIR__.'/academic-leveling.php';
        require_once __DIR__.'/promotion.php';
    });
});
