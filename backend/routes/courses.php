<?php
Route::prefix('courses')->group(function () {
    Route::controller('CoursesController')->group(function () {
        Route::get('/', 'getCourses');
        Route::get('subjects-by-courses', 'getSubjectsByCourses');
        Route::get('subjects-by-year', 'getSubjectsByYear');
    });
});
Route::prefix('grades')->group(function () {
    Route::controller('GradesController')->group(function () {
        Route::get('', 'getGrades');
        Route::get('groups', 'getGroups');
        Route::get('periods', 'getPeriods');
        Route::get('auxiliary-grades-grouped', 'getAuxiliaryGradesGrouped');
    });
});
Route::prefix('subject')->group(function () {
    Route::controller('SubjectController')->group(function () {
        Route::prefix('auxiliar-subjects')->group(function () {
            Route::get('/','getAuxiliarSubjects');
            Route::post('/','createAuxiliarSubjects');
        });
        Route::get('subject-certificate','getSubjectCertificate');
    });
});

