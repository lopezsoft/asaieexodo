<?php
// path: routes/online-activities.php

Route::prefix('online-activities')->group(function () {
    Route::controller('Activities\OnlineActivitiesController')->group(function () {
        Route::get('/', 'getActivities');
        Route::get('/courses', 'getCourses');
        Route::get('/students-by-course', 'getStudentsByCourse');
        Route::post('/create', 'createActivity');
        Route::post('/assign-course', 'assignCourseToActivity');
        Route::post('/delete-course', 'deleteCourseFromActivity');
    });
});
