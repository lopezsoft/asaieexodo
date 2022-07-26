<?php
namespace App\Models\School;

use App\Contracts\CrudInterface;
use App\Modules\School\SchoolQueries;
use App\Queries\QueryTable;
use App\Queries\UpdateTable;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Schools Implements CrudInterface
{
    use  MessagesTrait;
    public static function create(Request $request)
    {
        throw new Exception("No implements", 1);
    }

    public static function read(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $table  = "{$school->database_name}.school";
        return QueryTable::table($table);
    }

    public static function update(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        try {
            $records    = json_decode($request->records) ?? null;
            $school     = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
            $table      = "{$school->database_name}.school";
            $schoolR    = DB::table($table)->first();

            $data       = (object)[
                'id'                => $id,
                'country_id'        => $records->country_id ?? $schoolR->country_id,
                'city_id'           => $records->city_id ?? $schoolR->city_id,
                'school_id'         => $records->school_id ?? $schoolR->school_id,
                'school_name'       => $records->school_name ?? $schoolR->school_name,
                'dni'               => $records->dni ?? $schoolR->dni,
                'director_name'     => $records->director_name ?? $schoolR->director_name,
                'suburb'            => $records->suburb ?? $schoolR->suburb,
                'address'           => $records->address ?? $schoolR->address,
                'location'          => $records->location ?? $schoolR->location,
                'phones'            => $records->phones ?? $schoolR->phones,
                'web'               => $records->web ?? $schoolR->web,
                'email'             => $records->email ?? $schoolR->email ,
                'number_locations'  => $records->number_locations ?? $schoolR->number_locations,
            ];

            return UpdateTable::update($request, $data, $table);

        } catch (Exception $e) {
            return self::getResponse500([
                'message' => $e->getMessage(),
            ]);
        }
    }

    public static function delete(Request $request, $id){
        throw new Exception("No implements", 1);
    }
}
