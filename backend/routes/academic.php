<?php
Route::prefix('academic')->group(function () {
    Route::controller('Academic\AcademicController')->group(function () {
        Route::post('honor-frame', 'honorFrame');
    });
});
Route::prefix('academic-notes')->group(function () {
    Route::controller('Academic\AcademicNotesController')->group(function () {
        Route::get('courses-by-notes', 'getCoursesByNotes');
        Route::get('/', 'getNotes');
        Route::post('/', 'createNotes');
        Route::post('add-subjects', 'addSubjects');
        Route::post('transfer-notes', 'transferNotes');
        Route::put('/{id}', 'updateNotes');
        Route::delete('/{id}', 'deleteNotes');
    });
});
Route::prefix('competence')->group(function () {
    Route::controller('CompetenceController')->group(function () {
        Route::post('competences', 'getCompetences');
    });
});
