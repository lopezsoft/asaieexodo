<?php
 // Path: routes/online-evaluations.php

Route::prefix('online-evaluations')->group(function () {
    Route::controller('Activities\OnlineEvaluationsController')->group(function () {
        Route::get('index', 'index');
        Route::get('show/{id}', 'show');
        Route::post('store', 'store');
        Route::put('update/{id}', 'update');
        Route::delete('destroy/{id}', 'destroy');
        Route::get('export/{id}', 'export');
    });
});
