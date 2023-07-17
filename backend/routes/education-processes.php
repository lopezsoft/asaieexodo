<?php
Route::prefix('educational-processes')->group(function () {
    Route::controller('Academic\EducationalProcessesController')->group(function () {
        Route::prefix('by-teacher')->group(function () {
            Route::get('/last-year', 'getByTeacherLastYear');
            Route::post('/create-by-student', 'createForStudent');
            Route::post('/synchronize', 'synchronizeByTeacher');
            Route::post('/', 'createByTeacher');
            Route::get('/', 'getByTeacher');
            Route::post('/update', 'updateByTeacher');
            Route::put('/', 'updateByTeacher');
            Route::post('/delete', 'deleteByStudents');
            Route::delete('/', 'deleteByStudents');
        });
        Route::prefix('by-students')->group(function () {
            Route::get('/', 'getByStudents');
            Route::delete('/', 'deleteByStudents');
            Route::post('/delete', 'deleteByStudents');
        });
        Route::get('verify', 'getVerify');
    });
});

