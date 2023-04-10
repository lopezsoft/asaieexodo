<?php

Route::prefix('exports')->group(function () {
    Route::controller('ExportController')->group(function () {
        Route::prefix('excel')->group(function () {
            Route::post('consolidated-enrollment', 'getConsolidatedEnrollment');
            Route::post('consolidated-without-notes', 'getConsolidatedWithoutNotes');
        });
    });
});
