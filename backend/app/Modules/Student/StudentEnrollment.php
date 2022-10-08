<?php

namespace App\Modules\Student;

use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use Illuminate\Http\Request;

class StudentEnrollment
{
    public static function getAcademicHistory(Request $request): array
    {
        $studentId  = $request->input('id_student') ?? 0;
        $school     = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $fun	    = "{$school->database_name}.sp_select_historial_matriculas ( ? )";
        $param	    = [$studentId];
        return CallExecute::execute($fun, $param);
    }
}
