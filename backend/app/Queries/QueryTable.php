<?php

namespace App\Queries;

use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QueryTable
{
    use MessagesTrait;
    public static function query(Request $request, String $table = null, $where = [], $order = []): \Illuminate\Http\JsonResponse
    {
        try {
            $primaryKey = 'id';
            $query      = $request->input('query') ?? '';
            $limit      = $request->input('limit') ?? 15;
            $tableQuery = DB::table($table);
            if (strlen($query) > 0) {
                $fields     = ShowColumns::getColumns($table);
                $queryField = '';
                foreach ($fields as $field) {
                    if ($field->Field <> $primaryKey) {
                        $tableQ  = DB::table($table)
                                    ->where($field->Field,'like', '%'. $query .'%')
                                    ->first();
                        if ($tableQ) {
                            $queryField   = $field->Field;
                            break;
                        }
                    }
                }

                if(strlen($queryField) > 0){
                    $tableQuery = $tableQuery->where($queryField, 'like', '%'. $query .'%');
                }else {
                    $limit  = 0;
                }
            }

            if(count($where) > 0){
                $tableQuery = $tableQuery->where($where);
            }

            if(count($order) > 0){
                foreach ($order as $key => $value) {
                    $tableQuery = $tableQuery->orderBy($key, $value);
                }
            }

            return self::getResponse([
                'records' => $tableQuery->paginate($limit)
            ]);
        } catch (Exception $e) {
            return self::getResponse500([
                'error'   => $e->getMessage()
            ]);
        }
    }

    public static function table(String $table, Array $where = [], $perPage = 15): \Illuminate\Http\JsonResponse
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
