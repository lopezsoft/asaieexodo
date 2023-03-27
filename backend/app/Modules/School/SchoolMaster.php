<?php

namespace App\Modules\School;

use App\Contracts\CrudInterface;
use App\Queries\DeleteTable;
use App\Queries\InsertTable;
use App\Queries\QueryTable;
use App\Queries\UpdateTable;
use Illuminate\Http\Request;

class SchoolMaster implements CrudInterface
{
    public static function create(Request $request): \Illuminate\Http\JsonResponse
    {
       $params  = self::extractParams($request);
        return InsertTable::insert($request, $params->records, $params->table);
    }

    public static function read(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $params = self::extractParams($request);
        return QueryTable::query($request, $params->table, $params->where, $params->order);
    }

    public static function update(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $params     = self::extractParams($request);
        $records    = $params->records;
//        $records->id= $id;

        return UpdateTable::update($request, $records, $params->table);
    }

    public static function delete(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $params = self::extractParams($request);
        return DeleteTable::delete($request, $params->records, $params->table);
    }

    protected static function extractParams(Request $request): object
    {
        $pdbTable   = $request->input('pdbTable') ?? null;
        $school     = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $table      = "{$school->database_name}.{$pdbTable}";
        $records    = json_decode($request->records) ?? null;
        $where      = json_decode($request->where, true) ?? [];
        $order      = json_decode($request->order, true) ?? [];

        return (object) [
            'table'     => $table,
            'records'   => $records,
            'where'     => $where,
            'order'     => $order,
        ];
    }

}
