<?php
Route::prefix('school')->group(function () {
    Route::prefix('statistics')->group(function () {
        Route::controller('School\StatisticsController')->group(function () {
            Route::get('students-enrolled', 'getStudentsEnrolled');
            Route::get('teachers-by-year', 'getTeachersByYear');
            Route::get('retired-by-year', 'getRetiredByYear');
            Route::get('registered-by-year', 'getRegisteredByYear');
        });
    });
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
