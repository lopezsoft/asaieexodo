<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


Route::prefix('v1')->group(function () {
    Route::controller('UserController')->group(function () {
       Route::prefix('email')->group(function () {
            Route::get('/verify/{id}/{hash}', 'verify')
                ->name('verification.verify');

            Route::get('/resend/{id}', 'resend')
                ->name('verification.resend');
       });
    });

    Route::middleware('auth:api')->get('/user', function (Request $request) {
        return response()->json([
            'records'   => $request->user()
        ]);
    });

    Route::prefix('auth')->group(function () {
        Route::controller('Auth\AuthController')->group(function () {
            Route::post('signup',                   'signup');
            Route::get('signup/activate/{token}',   'signupActivate');
            Route::post('login',                    'login');
            Route::group(['middleware' => 'auth:api'], function () {
                Route::put('user/update/{id}', 'updateAccount');
                Route::get('logout',            'logout');
            });
        });
    });

    Route::group(['middleware' => 'auth:api'], function () {
        Route::apiResource('crud', 'SchoolMasterController');
        Route::resource('/index',       'MasterController');
        Route::controller('Location\LocationController')->group(function () {
            Route::get('cities',                'getCities');
            Route::get('countries',             'getCountries');
        });
        Route::prefix('school')->group(function () {
            Route::controller('School\SchoolsController')->group(function () {
                Route::get('read',          'read');
                Route::get('users',          'users');
                Route::get('user/{id}',          'user');
                Route::put('update/{id}',   'update');
            });
            Route::prefix('user')->group(function () {
                Route::controller('UserController')->group(function () {
                    Route::post('register', 'register');
                });
            });
        });
        Route::prefix('headquarters')->group(function () {
            Route::controller('School\HeadQuartersController')->group(function () {
                Route::get('working-day',          'getWorkingDay');
                Route::get('study-levels',          'getStudyLevels');
            });
        });
        Route::apiResource('headquarters', 'School\HeadQuartersController');

        Route::prefix('group-director')->group(function () {
            Route::controller('Administrative\GroupDirectorsController')->group(function () {
               Route::get('getGroupDirectorByGrade', 'getGroupDirectorByGrade');

            });
        });




        Route::prefix('grades')->group(function () {
           Route::controller('GradesController')->group(function () {
              Route::get('', 'getGrades');
              Route::get('groups', 'getGroups');
              Route::get('periods', 'getPeriods');
           });
        });

        Route::prefix('teachers')->group(function () {
            Route::controller('Administrative\TeachersController')->group(function () {
               Route::get('get-by-year', 'getByYear');
            });
        });

        Route::prefix('academic')->group(function () {
           Route::controller('Academic\AcademicController')->group(function () {
            Route::post('honorFrame', 'getHonorFrame');
           });
        });

        Route::prefix('courses')->group(function () {
           Route::controller('CoursesController')->group(function () {
               Route::get('/', 'getCourses');
               Route::get('subjects-by-courses', 'getSubjectsByCourses');
               Route::get('subjects-by-year', 'getSubjectsByYear');
           });
        });


        Route::prefix('subject')->group(function () {
            Route::controller('SubjectController')->group(function () {
                Route::get('subject-certificate','getSubject');
            });
         });

         Route::prefix('representative')->group(function () {
            Route::controller('RepresentativeController')->group(function () {
                Route::get('votes-white-candidates','getCandidates');
                Route::get('juries','getJuries');
            });
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



        Route::prefix('students')->group(function () {
            Route::controller('Academic\StudentController')->group(function () {
                Route::get('academic-history', 'getAcademicHistory');
                Route::get('enrollment', 'getEnrollment');
                Route::get('enrollment-list', 'getEnrollmentList');
                Route::post('move-students', 'moveStudents');
                Route::post('old-registration', 'oldRegistration');
            });
        });
        Route::prefix('download')->group(function () {
            Route::controller('DownloadController')->group(function () {
                Route::prefix('excel')->group(function () {
                    Route::post('template-enrollment', 'getTemplateEnrollment');
                });
                Route::prefix('student')->group(function () {
                    Route::get('read-documents', 'readStudentDocuments');
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
                Route::prefix('student')->group(function () {
                    Route::post('upload-documents', 'uploadStudentDocuments');
                });
                Route::prefix('settings')->group(function () {
                    Route::post('upload-school-logo', 'uploadSchoolLogo');
                    Route::post('upload-signature', 'uploadSignature');
                });
            });
        });

        Route::prefix('files')->group(function () {
            Route::controller('DeletingController')->group(function () {
                Route::delete('delete/{path}', 'deleteFile');
                Route::delete('delete-school-logo/{path}', 'deleteSchoolLogo');
                Route::prefix('settings')->group(function () {
                    Route::delete('delete-signature/{path}', 'deleteSignature');
                });
            });
        });

        Route::prefix('families')->group(function () {
            Route::controller('Academic\FamiliesController')->group(function () {
                Route::get('families-student', 'getFamiliesStudent');
            });
        });


        require __DIR__.'/exports.php';
        require __DIR__.'/reports.php';
        require __DIR__.'/settings.php';

        Route::prefix('promotion')->group(function () {
           Route::controller('PromotionController')->group(function () {
              Route::post('generate-final-report', 'generateFinalReport');
              Route::post('generate-final-savannas', 'generateFinalSavannas');
              Route::post('generate-support-activities', 'generateSupportActivities');
              Route::get('advance-promotion', 'getAdvancePromotion');

           });
        });
    });
});
