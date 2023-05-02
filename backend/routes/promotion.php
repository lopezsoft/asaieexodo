<?php
Route::prefix('promotion')->group(function () {
    Route::controller('PromotionController')->group(function () {
        Route::post('generate-final-report', 'generateFinalReport');
        Route::post('generate-final-savannas', 'generateFinalSavannas');
        Route::post('generate-support-activities', 'generateSupportActivities');
        Route::get('final-leveling', 'getFinalLeveling');
        Route::get('advance-promotion', 'getAdvancePromotion');
    });
});
