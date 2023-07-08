<?php

Route::prefix('academic-leveling')->group(function () {
    Route::prefix('period')->group(function () {
        Route::controller('Academic\AcademicLevelingController')->group(function () {
            Route::get('by-teacher', 'getByTeacherPeriod');
            Route::post('update', 'updatePeriod');
        });
    });
});
