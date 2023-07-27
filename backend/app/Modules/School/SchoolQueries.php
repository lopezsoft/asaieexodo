<?php

namespace App\Modules\School;

use App\Models\School\School;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SchoolQueries
{
    use MessagesTrait;

    /**
     * @throws \Exception
     */
    public static function getSchoolRequest(Request $request): ?object
    {
        try{
            $school     = self::getSchool($request->input('schoolId') ?? 0);
            $year       = $request->input('year') ?? Date('Y');
            return (object) [
                'id'                => $school->id,
                'school'            => $school,
                'db'                => "{$school->database_name}.",
                'database_name'     => $school->database_name,
                'year'              => $year,
                'pdbYear'           => $request->input('pdbYear'),
                'grade' 	        => $request->input('pdbGrado'),#
                'group'	            => $request->input('pdbGrupo'),#
                'headquarter'	    => $request->input('pdbSede'),#
                'workingDay'        => $request->input('pdbJorn'),#
                'format'		    => $request->input('pFormat') ?? 'pdf',
                'schoolId'		    => $request->input('schoolId') ?? 0,
                'page'		        => $request->input('page') ?? 0,
                'limit'		        => $request->input('limit') ?? 15,
                'profileId'		    => $request->input('profileId') ?? 0,
                'path'              => "{$school->folder_name}"
            ];
        }catch( \Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }
    public static function getSchool($id): object | null
    {
        try {
            return DB::table('schools')->where('id', $id)->first();
        } catch (\Exception $e) {
            return self::getResponse500(['error' => $e->getMessage()]);
        }
    }

    public static function getSchoolById($id = null){
        return School::where('id', $id)->first();
    }

    public static function getSchoolByCode($school_code = null){
        return School::where('statecode', $school_code)->first();
    }
}
