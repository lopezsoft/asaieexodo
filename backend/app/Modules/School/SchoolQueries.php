<?php

namespace App\Modules\School;

use App\Models\School\School;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SchoolQueries
{
    use MessagesTrait;
    public static function getSchoolRequest(Request $request): ?object
    {
        try{
            $school     = self::getSchool($request->input('schoolId') ?? 0);
            $year       = $request->input('year') ?? Date('Y');

            return (object) [
                'school'  => $school,
                'db'      => "{$school->database_name}.",
                'year'  => $year
            ];
        }catch( \Exception $e) {
            return null;
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
