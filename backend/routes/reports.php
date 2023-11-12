<?php

Route::prefix('reports')->group(function () {
    Route::controller('ReportsController')->group(function () {
        Route::prefix('generate')->group(function () {
            Route::post('consolidated', 'generateConsolidated');
        });
        Route::post('final-leveling', 'getFinalLeveling');
        Route::post('advanced-promotion', 'getAdvancedPromotion');
        Route::post('periodic-leveling', 'getPeriodicLeveling');
        Route::post('reported-notes', 'getReportedNotes');
        Route::post('family-members', 'getFamilyMembers');
        Route::post('birth-dates', 'getBirthDates');
        Route::post('school-carnes', 'getSchoolCarnes');
        Route::post('group-directors','getGroupDirectors');
        Route::post('election-results','getElectionResults');
        Route::post('electoral-certificate','getElectoralCertificate');
        Route::post('teachers-list', 'getTeachersList');
        Route::post('academic-allocation', 'getAcademicAllocation');
        Route::post('lists-with-load', 'getListsWithLoad');
        Route::post('lists-without-load', 'getListsWithoutLoad');
        Route::post('statistics-by-ages', 'getStatisticsByAges');
        Route::post('students-enrolled', 'getStudentsEnrolled');
        Route::post('displaced-students', 'getDisplacedStudents');
        Route::post('students-per-day', 'getStudentsPerDay');
        Route::post('statistics', 'getStatistics');
        Route::post('periodic-bulletin', 'getPeriodicBulletin');
        Route::post('consolidated', 'getConsolidated');
        Route::post('enrollment-sheet', 'getEnrollmentSheet');
        Route::post('certificate', 'getConstancy');
        Route::post('periodic-certificate', 'getPeriodicCertificate');
        Route::post('honor-frame', 'getHonorFrame');
        Route::post('observer-sheet', 'getObserverSheet');
        Route::post('final-report', 'getFinalReport');
        Route::post('minutes-promotion', 'getMinutesPromotion');
        Route::post('minutes-promotion-statistics', 'getMinutesPromotionStatistics');
        Route::post('final-savannas', 'getFinalSavannas');
        Route::post('final-certificate', 'getFinalCertificate');
        Route::post('academic-history', 'getAcademicHistory');
    });
});
