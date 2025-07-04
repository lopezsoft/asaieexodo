<?php
 // Path: routes/online-evaluations.php

Route::prefix('online-evaluations')->group(function () {
    Route::controller('Activities\OnLineEvaluationsController')->group(function () {
        Route::get('/', 'getEvaluations');
        Route::get('/total-questions', 'getTotalQuestions');
        Route::get('/courses', 'getCourses');
        Route::get('/students-by-course', 'getStudentsByCourse');
        Route::get('/result', 'getResultEvaluation');
        Route::post('/create', 'createEvaluation');
        Route::post('/assign-course', 'assignCourseToEvaluation');
        Route::post('/delete-course', 'deleteCourseFromEvaluation');
    });
});
