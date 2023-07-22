<?php
Route::prefix('school')->group(function () {
    Route::controller('School\SchoolsController')->group(function () {
        Route::get('system-modules', 'getSystemModules');
        Route::get('read',          'read');
        Route::get('users',          'users');
        Route::get('user/{id}',          'user');
        Route::put('update/{id}',   'update');
    });
    Route::prefix('user')->group(function () {
        Route::controller('UserController')->group(function () {
            Route::post('register', 'register');
        });
    });
});
Route::prefix('headquarters')->group(function () {
    Route::controller('School\HeadQuartersController')->group(function () {
        Route::get('working-day',          'getWorkingDay');
        Route::get('study-levels',          'getStudyLevels');
    });
});
Route::apiResource('headquarters', 'School\HeadQuartersController');
Route::prefix('group-director')->group(function () {
    Route::controller('Administrative\GroupDirectorsController')->group(function () {
        Route::get('getGroupDirectorByGrade', 'getGroupDirectorByGrade');

    });
});
