<?php

namespace App\Modules\Academic;

use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;

class HonorFrame
{
    use  MessagesTrait;
    public static function getHonorFrame(Request $request): \Illuminate\Http\JsonResponse {
        $school     = SchoolQueries::getSchoolRequest($request);
        $db	        = $school->db;
        $year       = $school->year;
        $params     = [
            $year,
            $request->pdbPeriodo,
            $request->pdbCk
        ];
        return self::getResponse([
            'records'   => [
                'data'  => CallExecute::execute("{$db}sp_gen_c_honor(?, ?, ?)", $params)
            ]
        ]);
    }
}
