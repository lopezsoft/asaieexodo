<?php
Route::prefix('representative')->group(function () {
    Route::controller('Representative\RepresentativeController')->group(function () {
        Route::get('votes-white-candidates','getCandidates');
        Route::get('juries','getJuries');
        Route::post('upload-candidate-photo','uploadCandidatePhoto');
    });
    Route::prefix('vote')->group(function () {
        Route::controller('Representative\VotesController')->group(function () {
            Route::post('new-vote','insertVotes');
        });
    });
    Route::prefix('polling-station')->group(function () {
        Route::controller('Representative\TableVoteController')->group(function () {
            Route::get('headquarters','getTableHeadquarters');
            Route::get('assigned-courses','getDegreesPerTable');
        });
    });
});
