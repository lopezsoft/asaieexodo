<?php

namespace App\Modules\Academic;

use App\Jobs\EducationalProcessesInsertInNotesJob;
use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Queries\TablesQuery;
use App\Queries\UpdateTable;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicNotesTeacher
{
    use MessagesTrait;
    public static function update(Request $request) : JsonResponse
    {
        try {
            $periodo	= $request->input('pdbPeriodo');
            $params     = (Object) $request->all();
            $grado		= $request->input('pdbGrado');
            $fieldsList = json_decode($request->input('records'));
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            ControlClosingDates::validatePeriodDate($school, $grado, $periodo);
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $table	    = TablesQuery::getTableNotes($grado);
            $response   = UpdateTable::update($request, $fieldsList, "{$db}$table");
            EducationalProcessesInsertInNotesJob::dispatch($params, $school, $teacherId);
            return $response;
        }catch (Exception $e){
            return self::getResponse500([
                'error' => $e->getMessage()
            ]);
        }
    }
}
