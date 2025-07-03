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

class OnLineActivities
{
    public static function getActivities(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $activities = DB::table("{$db}ta_online_activities")
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

    public static function createActivity(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $data       = json_decode($request->input('records'), true);
            if (!$data) {
                throw new Exception('Invalid data provided for the activity.', 400);
            }
            $data['teacher_id'] = $teacherId;
            $data['year'] = $school->year;
            return InsertTable::insert($request, (object)$data, "{$db}ta_online_activities");
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
            $data = CallExecute::execute("{$db}sp_carga_activities ( ?, ?, ?, ? )", $param);
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

    public static function assignCourseToActivity(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $activityId = $request->input('activity_id');
            $courseId   = $request->input('course_id');
            if (!$activityId || !$courseId) {
                throw new Exception('Activity ID and Course ID are required.', 400);
            }
            $table = "{$db}ta_courses_online_activities";
            // Check if the course is already assigned to the activity
            $exists = DB::table($table)->updateOrInsert(
                ['activity_id' => $activityId, 'course_id' => $courseId],
                ['timestamp' => now()]
            );

            if ($exists) {
                return HttpResponseMessages::getResponse([
                    'message' => 'Course assigned to activity successfully.',
                    'records' => ['activity_id' => $activityId, 'course_id' => $courseId]
                ]);
            } else {
                throw new Exception('Failed to assign course to activity.', 500);
            }
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
                $request->input('activityId', 0),
            ];
            $data = CallExecute::execute("{$db}sp_activity_courses_students ( ?, ?)", $param);
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

    public static function deleteCourseFromActivity(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $records    = json_decode($request->input('records'), true);
            if (!$records || !isset($records['id'])) {
                throw new Exception('Invalid records provided for deletion.', 400);
            }
            $id = $records['id'];
            $table = "{$db}ta_courses_online_activities";
            $deleted = DB::table($table)->where('id', $id)->delete();
            if ($deleted) {
                return HttpResponseMessages::getResponse([
                    'message' => 'Course removed from activity successfully.',
                    'records' => [
                        'data' => ['id' => $id],
                    ]
                ]);
            } else {
                throw new Exception('Failed to delete course from activity.', 500);
            }
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }
}
