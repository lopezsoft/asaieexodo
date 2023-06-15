<?php
Route::prefix('academic-observations')->group(function () {
    Route::controller('Academic\AcademicObservationsController')->group(function () {
        Route::get('/', 'getObservations');
        Route::get('/by-students', 'getByStudents');
        Route::delete('/by-students', 'deleteByStudents');
        Route::post('/', 'createObservations');
        Route::post('/create-for-student', 'createForStudent');
    });
});
Route::prefix('academic')->group(function () {
    Route::controller('Academic\AcademicController')->group(function () {
        Route::post('honor-frame', 'honorFrame');
    });
});
Route::prefix('academic-notes')->group(function () {
    Route::controller('Academic\AcademicNotesController')->group(function () {
        Route::get('pre-report', 'getPreReport');
        Route::post('pre-report', 'updatePreReport');
        Route::get('courses-by-notes', 'getCoursesByNotes');
        Route::get('/', 'getNotes');
        Route::get('notes-by-course', 'getNotesByCourse');
        Route::post('/', 'createNotes');
        Route::post('add-subjects', 'addSubjects');
        Route::post('transfer-notes', 'transferNotes');
        Route::put('/{id}', 'updateNotes');
        Route::prefix('teacher')->group(function () {
            Route::post('/', 'updateNotesTeacher');
        });
        Route::delete('/{id}', 'deleteNotes');
    });
});
Route::prefix('competence')->group(function () {
    Route::controller('CompetenciesController')->group(function () {
        Route::post('competences', 'getCompetencies');
        Route::get('by-group-grades', 'getByGroupGrades');
    });
});
