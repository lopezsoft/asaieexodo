<?php

namespace App\Modules\Administrative;

use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use Illuminate\Http\Request;

class GroupDirectors
{
    public static function getGroupDirectorByGrade(Request $request): array
    {
        $grade  = $request->input('pdbGrado') ?? 0;
        $year   = $request->input('year') ?? Date('Y');
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $fun	= "{$school->database_name}.sp_select_group_dir_grade ( ?, ? )";
        $param	= [$year, $grade];
        return CallExecute::execute($fun, $param);
    }
}
