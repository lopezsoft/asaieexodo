<?php

namespace App\Modules\Settings;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeletingNotes
{
    use MessagesTrait;
    public static function notesZero(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $year   = $school->year;
        DB::beginTransaction();
        try {
            DB::table($db."nscp001")
                ->where('year', $year)
                ->where('final', '=', 0)
                ->delete();
            DB::table($db."nscp002")
                ->where('year', $year)
                ->where('final', '=', 0)
                ->delete();

            DB::table($db."nscp003")
                ->where('year', $year)
                ->where('final', '=', 0)
                ->delete();
            DB::commit();
            return self::getResponse();
        }catch(Exception $e) {
            return self::getResponse500([
               'error' => $e->getMessage(),
            ]);
        }
    }
}
