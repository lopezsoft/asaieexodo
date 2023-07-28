<?php

namespace App\Modules\Administrative;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Teachers
{
    use MessagesTrait;
    public static function index(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db	    = $school->db;
            $query  = self::getData($db)->select("td.*");
            return self::getResponseData($request, $query);
        }catch (\Exception $e){
            return self::getResponse500([
                'message' => $e->getMessage()
            ]);
        }
    }
    public static function getByYear(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db	    = $school->db;
            $year   = $school->year;

            $query  = self::getData($db)
                        ->join("{$db}aux_docentes AS t1", 't1.id_docente', '=','td.id_docente')
                        ->select("td.*","t1.year")
                        ->where('td.estado', 1)
                        ->where('t1.year', $year);
            return self::getResponseData($request, $query);
        }catch (\Exception $e){
            return self::getResponse500([
                'message' => $e->getMessage()
            ]);
        }
    }

    private static function getData($db): Builder
    {
        return DB::table("{$db}docentes AS td");
    }
    private static function getResponseData(Request $request, $query): JsonResponse
    {
        $search = $request->input('query') ?? null;
        $limit  = $request->input('limit') ?? 15;
        if($search){
            $query->where(function ($row) use ($search) {
                $row->where("td.documento",   'like', "%{$search}%");
                $row->orWhereRaw("CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) LIKE '%{$search}%'");
            });
        }
        $query->selectRaw("CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) AS nombres");
        $query->orderBy('nombres');
        return self::getResponse([
            'records' => $query->paginate($limit)
        ]);
    }

}
