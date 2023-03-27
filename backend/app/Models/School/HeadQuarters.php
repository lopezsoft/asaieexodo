<?php

namespace App\Models\School;
use App\Contracts\CrudInterface;
use App\Modules\School\SchoolQueries;
use App\Queries\QueryTable;
use Illuminate\Http\Request;


class HeadQuarters Implements CrudInterface
{
    public static function create(Request $request){

    }

    public static function read(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchool($request->input('schoolId'));
        $table  = "{$school->database_name}.sedes";
        $where  = [];
        if($id){
            $where  = ['id' => $id];
        }
        return QueryTable::query($request, $table, $where);
    }

    public static function update(Request $request, $id) {

    }

    public static function delete(Request $request, $id){

    }

}
