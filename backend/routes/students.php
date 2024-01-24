<?php
Route::prefix('students')->group(function () {
    Route::controller('Academic\StudentController')->group(function () {
        Route::get('index', 'getInscriptions');
        Route::get('academic-history', 'getAcademicHistory');
        Route::get('enrollment', 'getEnrollment');
        Route::get('enrollment-list', 'getEnrollmentList');
        Route::post('move-students', 'moveStudents');
        Route::post('old-registration', 'oldRegistration');
        Route::post('/', 'createInscription');
    });
});

Route::prefix('families')->group(function () {
    Route::controller('Academic\FamiliesController')->group(function () {
        Route::get('families-student', 'getFamiliesStudent');
    });
});
