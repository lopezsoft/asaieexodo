<?php

namespace App\Modules\Teacher;

use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CoursesOfTeacher
{
    public static function getTeacherId($db)
    {
        $user       = auth()->user();
        $teacher    = DB::table("{$db}teachers_and_users_ids")
                        ->where('user_id', $user->id)
                        ->first();
        return $teacher->teacher_id ?? 0;
    }

    /**
     * @throws \Exception
     */
    public static function getGroupedCourses(Request $request): array
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $year       = $school->year;
        $teacherId  = self::getTeacherId($school->db);
        $fun	    = "{$school->db}sp_carga_docente_agrupada ( ?, ?, ? )";
        $param	    = [$teacherId, $year, $request->input('type') ?? 0];
        return CallExecute::execute($fun, $param);
    }

    /**
     * @throws \Exception
     */
    public static function getCourses(Request $request): array
    {
        $school     = SchoolQueries::getSchoolRequest($request);
        $year       = $school->year;
        $teacherId  = self::getTeacherId($school->db);
        $fun	    = "{$school->db}sp_carga_docente ( ?, ?, ? )";
        $param	    = [$teacherId, $year, $request->input('query') ?? ''];
        return CallExecute::execute($fun, $param);
    }
}
