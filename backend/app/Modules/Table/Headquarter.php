<?php

namespace App\Modules\Table;

use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class Headquarter{
    use MessagesTrait;

    public static function getTableHeadquarters($request) {

        $limit  = $request->input('limit') ?? 15;
        $school    = SchoolQueries::getSchoolRequest($request);
        $db        = $school->db;
        $id = $request->input('pdbPolingStationId');;
        $query = DB::table("{$db}tp_table_headquarters AS tp")
        ->select("tp.*", DB::raw("rtrim(ts.headquarters_name) AS sede"))
        ->leftJoin("{$db}sedes AS ts", "tp.headquarter_id", "=", "ts.id")
        ->where("tp.polling_station_id", "=", $id);
        return self::getResponse(['records' => $query->paginate($limit),'success' => true]);

    }

}
