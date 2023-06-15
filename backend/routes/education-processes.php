<?php
Route::prefix('educational-processes')->group(function () {
    Route::controller('Academic\EducationalProcessesController')->group(function () {
        Route::prefix('by-teacher')->group(function () {
            Route::get('/', 'getByTeacher');
            Route::get('/last-year', 'getByTeacherLastYear');
            Route::post('/', 'createByTeacher');
            Route::post('/create-by-student', 'createForStudent');
            Route::post('/synchronize', 'synchronizeByTeacher');
            Route::put('/{id}', 'updateByTeacher');
            Route::delete('/by-students', 'deleteByStudents');
        });
        Route::prefix('by-students')->group(function () {
            Route::get('/', 'getByStudents');
            Route::delete('/', 'deleteByStudents');
        });
        Route::get('verify', 'getVerify');
    });
});

