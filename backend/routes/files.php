<?php
Route::prefix('download')->group(function () {
    Route::controller('DownloadController')->group(function () {
        Route::prefix('excel')->group(function () {
            Route::post('template-enrollment', 'getTemplateEnrollment');
        });
        Route::prefix('settings')->group(function () {
            Route::get('read-school-logo', 'readSchoolLogo');
            Route::get('read-signature', 'readSignature');
        });
    });
});
Route::prefix('upload')->group(function () {
    Route::controller('UploadController')->group(function () {
        Route::prefix('excel')->group(function () {
            Route::post('template-enrollment', 'setTemplateEnrollment');
        });
        Route::prefix('settings')->group(function () {
            Route::post('upload-school-logo', 'uploadSchoolLogo');
            Route::post('upload-signature', 'uploadSignature');
        });
    });
});

Route::prefix('files')->group(function () {
    Route::controller('FileManagerController')->group(function () {
        Route::get('read', 'get');
        Route::post('upload', 'upload');
        Route::delete('delete/{id}', 'delete');
    });
    Route::controller('DeletingController')->group(function () {
        Route::delete('delete-path/{path}', 'deleteFile');
        Route::delete('delete-school-logo/{path}', 'deleteSchoolLogo');
        Route::prefix('settings')->group(function () {
            Route::delete('delete-signature/{path}', 'deleteSignature');
        });
    });
});

