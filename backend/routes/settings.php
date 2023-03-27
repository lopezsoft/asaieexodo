<?php
Route::prefix('settings')->group(function () {
    Route::controller('SettingsController')->group(function () {
        Route::get('final-student-state', 'getFinalStudentState');
        Route::get('general-setting', 'getGeneralSetting');
        Route::get('rating-scale', 'getRatingScale');
        Route::prefix('competencies')->group(function () {
            Route::get('/', 'getCompetencies');
            Route::get('columns-notes', 'getColumnsNotesCompetencies');
            Route::get('columns-notes-exists', 'getColumnsNotesCompetenciesExists');
        });
        Route::post('delete-notes-zero', 'deleteNotesZero');
    });
});
