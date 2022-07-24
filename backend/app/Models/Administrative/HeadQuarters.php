<?php

namespace App\Models\Administrative;

use App\Classes\CrudProcess;
use App\Contracts\CrudInterface;
use App\Traits\SchoolTrait;
use Illuminate\Http\Request;


class HeadQuarters Implements CrudInterface
{
    use CrudProcess, SchoolTrait;
    static function create(Request $request){

    }

    static function read(Request $request, $id){
        $db     = self::getDatabase();
        $table  = "$db.sedes";

        if($id){

        }

        return self::getTable($request, $table);
    }

    static function update(Request $request, $id) {

    }

    static function delete(Request $request, $id){

    }

}
