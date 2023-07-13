<?php
Route::controller('Academic\ObserverController')->group(function () {
    Route::prefix('observer')->group(function () {
        Route::get('/',                 'index');
        Route::get('/items-model3',     'getItemsModel3');
        Route::post('/items-model3',     'setItemsModel3');
        Route::post('/annotations',     'createAnnotations');
    });
});
