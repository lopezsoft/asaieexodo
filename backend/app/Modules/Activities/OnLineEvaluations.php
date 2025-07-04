<?php

namespace App\Modules\Activities;

use App\Common\HttpResponseMessages;
use App\Common\MessageExceptionResponse;
use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Queries\CallExecute;
use App\Queries\InsertTable;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OnLineEvaluations
{
    public static function getEvaluations(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $activities = DB::table("{$db}te_evaluations")
                ->where('teacher_id', $teacherId)
                ->where('year', $school->year)
                ->orderBy('timestamp', 'desc');
            return HttpResponseMessages::getResponse([
                'records' => $activities->paginate($request->input('limit', 15)),
            ]);
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function createEvaluation(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $data       = json_decode($request->input('records'), true);
            if (!$data) {
                throw new Exception('Invalid data provided for the evaluation.', 400);
            }
            $data['teacher_id'] = $teacherId;
            $data['year'] = $school->year;
            return InsertTable::insert($request, (object)$data, "{$db}te_evaluations");
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function getCourses(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $year       = $school->year;
            $param       = [
                $teacherId,
                $year,
                $request->input('id', 0),
                $request->input('type', 0)
            ];
            $data = CallExecute::execute("{$db}sp_carga_evaluations ( ?, ?, ?, ? )", $param);
            return HttpResponseMessages::getResponse([
                'records' => [
                    'data' => $data,
                    'total' => count($data)
                ]
            ]);
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function getStudentsByCourse(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $param       = [
                $request->input('courseId', 0),
                $request->input('evaluationId', 0),
            ];
            $data = CallExecute::execute("{$db}sp_evaluation_courses_students ( ?, ?)", $param);
            return HttpResponseMessages::getResponse([
                'records' => [
                    'data' => $data,
                    'total' => count($data)
                ]
            ]);
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function assignCourseToEvaluation(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $evaluationId = $request->input('evaluation_id');
            $courseId   = $request->input('course_id');
            if (!$evaluationId || !$courseId) {
                throw new Exception('Evaluation ID and Course ID are required.', 400);
            }
            $table = "{$db}te_evaluation_courses";
            // Check if the course is already assigned to the evaluation
            $exists = DB::table($table)->updateOrInsert(
                ['evaluation_id' => $evaluationId, 'course_id' => $courseId],
                [
                    'column_note_id'    => $request->input('column_note_id', null),
                    'column_note'       => $request->input('column_note', null),
                ]
            );

            if ($exists) {
                return HttpResponseMessages::getResponse([
                    'records' => [
                        'message' => 'Course assigned to evaluation successfully.',
                        'evaluation_id' => $evaluationId,
                        'course_id' => $courseId
                    ]
                ]);
            } else {
                throw new Exception('Failed to assign course to evaluation.', 500);
            }
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function deleteCourseFromEvaluation(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $records    = json_decode($request->input('records'), true);
            if (!$records || !isset($records['id'])) {
                throw new Exception('Invalid records provided for deletion.', 400);
            }
            $id = $records['id'];
            $table = "{$db}te_evaluation_courses";
            $deleted = DB::table($table)->where('id', $id)->delete();
            if ($deleted) {
                return HttpResponseMessages::getResponse([
                    'message' => 'Course removed from evaluation successfully.',
                    'records' => [
                        'data' => ['id' => $id],
                    ]
                ]);
            } else {
                throw new Exception('Failed to remove course from evaluation.', 500);
            }
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function getTotalQuestions(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $evaluationId = $request->input('evaluationId');
            if (!$evaluationId) {
                throw new Exception('Evaluation ID is required.', 400);
            }
            $totalQuestions = DB::table("{$db}te_evaluation_questions")
                ->where('evaluation_id', $evaluationId)
                ->count();
            return HttpResponseMessages::getResponse([
                'records' => [
                    'total' => $totalQuestions
                ]
            ]);
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function getResultEvaluation(Request $request)
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $param       = [
                $request->input('courseId', 0),
                $request->input('evaluationId', 0),
            ];
            $data = CallExecute::execute("{$db}sp_select_evaluation_result ( ?, ?)", $param);
            return HttpResponseMessages::getResponse([
                'records' => [
                    'data' => $data,
                    'total' => count($data)
                ]
            ]);
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }
}
