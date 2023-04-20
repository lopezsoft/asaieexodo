<?php

namespace App\Modules\Table;

use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class AssignedCourses{
    use MessagesTrait;

    public static function getDegreesPerTable($request) {

        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db     = "{$school->database_name}";
        // $school    = SchoolQueries::getSchoolRequest($request);
        // $db        = $school->db;

        $limit  = $request->input('limit') ?? 15;
        // $id = $request->input('pdbPolingStationId');
        $id = $request->input('pdbPolling_stattion_id');


        $query = DB::table("{$db}.tp_degrees_per_table AS tp")
            ->leftJoin("$db.tp_polling_stations as tm", "tp.polling_station_id", "=", "tm.id")
            ->leftJoin("$db.grados as tg", "tp.grade_id", "=", "tg.id")
            ->select("tp.*", "tm.table_name", DB::raw("RTRIM(tg.grado) as grado"))
            ->where("tp.polling_station_id", $id);
        // return response()->json(['mmsj' => $id]);
        return self::getResponse(['records' => $query->paginate($limit),'success' => true]);


    }

}
