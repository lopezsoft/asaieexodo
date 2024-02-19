<?php
namespace App\Models\School;

use App\Contracts\UpdateContract;
use App\Models\SchoolModule;
use App\Models\User;
use App\Modules\School\SchoolQueries;
use App\Queries\QueryTable;
use App\Queries\UpdateTable;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class Schools Implements UpdateContract
{
    use  MessagesTrait;

    /**
     * @throws Exception
     */
    public static function user(Request $request, $id = null): JsonResponse
    {
        $user   = Auth::user();
        $school = SchoolQueries::getSchoolRequest($request);
        $query  = User::query()
                    ->whereNot('id', $user->id)
                    ->where('id', $id)
                    ->whereHas('schools', function ($row) use ($school) {
                        $row->where('school_id', $school->school->id ?? 0);
                        $row->where('state', 1);
                    });
        return self::getResponse([
            'dataRecords'   => $query->paginate()
        ]);
    }
    public static function users(Request $request, $id = null): JsonResponse
    {
        $user   = Auth::user();
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $search = $request->input('query') ?? null;
        $query  = User::query()
                    ->whereNot('id', $user->id)
                    ->whereHas('schools', function ($row) use ($school) {
                        $row->where('school_id', $school->id ?? 0);
                    });
        if($id) {
            $query->where('id', $id);
        }
        if($search) {
            $query->whereRaw("CONCAT(TRIM(first_name),' ',TRIM(last_name)) like '%{$search}%'");
            $query->orWhere('email', 'like', "%{$search}%");
        }
        return self::getResponse([
            'dataRecords'   => $query->paginate(),
            'school'        => $school ?? '',
        ]);
    }

    public static function read(Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $table  = "{$school->database_name}.school";
        return QueryTable::table($table);
    }

    public static function update(Request $request, $id): JsonResponse
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

    public static function getSystemModules(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $query  = SchoolModule::query()->where('school_id', $school->school->id ?? 0);
            return self::getResponse([
                'records'   =>[
                    'data'  => $query->get(),
                ]
            ]);
        }catch (Exception $e) {
            return self::getResponse500([
                'message' => $e->getMessage(),
            ]);
        }
    }
}
