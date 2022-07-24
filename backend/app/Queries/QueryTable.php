<?php

namespace App\Queries;

use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Support\Facades\DB;

class QueryTable
{
    use MessagesTrait;
    public static function query(String $table, Array $where = [], $perPage = 15): \Illuminate\Http\JsonResponse
    {
        try {
            $query          = DB::table($table);
            if(count($where) > 0) {
                $query = $query->where($where);
            }
            return self::getResponse([
                'records'   => $query->paginate($perPage)
            ]);

        } catch (Exception $e) {
            return self::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }
}
