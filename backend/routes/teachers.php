<?php
Route::prefix('teachers')->group(function () {
    Route::controller('Administrative\TeachersController')->group(function () {
        Route::get('get-by-year', 'getByYear');
        Route::get('courses', 'getCourses');
        Route::get('grouped-courses', 'getGroupedCourses');
        Route::get('column-notes', 'getColumnNotes');
        Route::post('column-notes', 'setColumnNotes');
    });
});
