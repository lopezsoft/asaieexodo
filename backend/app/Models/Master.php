<?php

namespace App\Models;

use Exception;
use App\Traits\CrudTrait;
use App\Traits\SchoolTrait;
use Illuminate\Http\Request;
use App\Contracts\CrudInterface;

class Master Implements CrudInterface
{
    use CrudTrait, SchoolTrait;
    static function create(Request $request)
    {
        throw new Exception("No implements", 1);
    }

    static function read(Request $request, $id){
        $db     = self::getDatabase();
        $table  = $db.".".$request->input('pdbTable');
        return self::getTable($request, $table);
    }

    static function update(Request $request, $id){
        try {
            $records    = json_decode($request->records) ?? null;
            $db         = self::getDatabase();
            $table      = "$db.school";

            $data       = (object)[
                'id'                => $id,
                'country_id'        => $records->country_id,
                'city_id'           => $records->city_id,
                'school_id'         => $records->school_id,
                'school_name'       => $records->school_name,
                'dni'               => $records->dni,
                'director_name'     => $records->director_name,
                'suburb'            => $records->suburb ?? null,
                'address'           => $records->address ?? null,
                'location'          => $records->location ?? null,
                'phones'            => $records->phones ?? null,
                'web'               => $records->web ?? null,
                'email'             => $records->email ?? null ,
                'number_locations'  => $records->number_locations ?? 1,
            ];

            return CrudTrait::update($request, $data, $table);

        } catch (Exception $e) {
            return self::getResponse500([
                'message' => $e->getMessage(),
            ]);
        }
    }

    static function delete(Request $request, $id){
        throw new Exception("No implements", 1);
    }
}
