<?php
Route::prefix('representative')->group(function () {
    Route::controller('RepresentativeController')->group(function () {
        Route::get('votes-white-candidates','getCandidates');
        Route::get('juries','getJuries');
    });
    Route::prefix('vote')->group(function () {
        Route::controller('VotesController')->group(function () {
            Route::post('new-vote','insertVotes');
        });
    });
    Route::prefix('polling-station')->group(function () {
        Route::controller('TableVoteController')->group(function () {
            Route::get('headquarters','getTableHeadquarters');
            Route::get('assigned-courses','getDegreesPerTable');
        });
    });
});
