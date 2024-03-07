<?php

namespace App\Modules\Representative;

use App\Common\HttpResponseMessages;
use App\Modules\School\SchoolQueries;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class Jury
{

    /**
     * @throws \Exception
     */
    public static function getJuries(Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $limit  = $request->input('limit') ?? 15;
        $id     = $request->input('pdbPolingStationId');
        $query  = DB::table("{$db}tp_juries")->where('poling_station_id', '=', $id);
        return HttpResponseMessages::getResponse([
            'records'   => $query->paginate($limit),
        ]);
    }

}
