<?php

namespace App\Models;

use App\Contracts\CrudInterface;
use App\Queries\QueryTable;
use Exception;
use Illuminate\Http\Request;

class Master Implements CrudInterface
{
    static function create(Request $request)
    {
        throw new Exception("No implements", 1);
    }

    static function read(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $table  = $request->input('pdbTable') ?? null;
        $where  = json_decode($request->where, true) ?? [];
        $order  = json_decode($request->order, true) ?? [];
        return QueryTable::query($request, $table, $where, $order);
    }

    static function update(Request $request, $id){
        throw new Exception("No implements", 1);
    }

    static function delete(Request $request, $id){
        throw new Exception("No implements", 1);
    }
}
