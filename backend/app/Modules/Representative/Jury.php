<?php

namespace App\Modules\Representative;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class Jury
{
    use MessagesTrait;

    public static function getJuries($request){

        $school    = SchoolQueries::getSchoolRequest($request);
        $db        = $school->db;
        $limit  = $request->input('limit') ?? 15;
        $id = $request->input('pdbPolingStationId');
        $query = DB::table("{$db}tp_juries")->where('poling_station_id', '=', $id)->paginate($limit);
        return self::getResponse(['records' => $query, 'success' => true]);


    }

}
