<?php
Route::prefix('school')->group(function () {
    Route::controller('School\SchoolsController')->group(function () {
        Route::get('/',          'getSchoolData');
    });
});
Route::prefix('representative')->group(function () {
    Route::prefix('vote')->group(function () {
        Route::controller('Representative\VotesController')->group(function () {
            Route::get('voting-data','getVotingData');
            Route::post('save-voting','insertVotes');
            Route::post('validate-voting-code/{code}','validateVoteCode');
            Route::post('close-voting','closeVoting');
        });
    });
});
