<?php

namespace App\Modules\Location;

use App\Models\Location\Cities;
use App\Modules\School\SchoolQueries;
use App\Queries\QueryTable;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Location
{
    use MessagesTrait;
    public static function getCountries(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school         = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
            $db             = "{$school->database_name}.";
            $querySearch    = $request->input('query');
            $where          = [];
            if($querySearch){
                $where[] = ['country_name', 'like', "%{$querySearch}%"];
            }
            $where[] = ['active', '=', 1];

            return QueryTable::table($db.'countries', $where);

        } catch (Exception $e) {
            return self::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }

    public static function getCities(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school         = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
            $db             = "{$school->database_name}.";
            $query = DB::table($db."cities AS c");
			$query->leftJoin($db."departments AS d", "c.id_dept", "=","d.id");
			$query->leftJoin($db."countries AS p", "d.id_country", "=", "p.id");
            $query->whereRaw('c.id_dept=d.id');
            $querySearch    = $request->input('query');
            if($querySearch){
                $query  = $query->where('name_city', 'like', "%{$querySearch}%");
                $query  = $query->orWhere('city_code', 'like', "%{$querySearch}%");
            }
            $query->select("c.id", "c.city_code",  "c.id_dept", "d.id_country");
            $query->selectRaw("CONCAT(TRIM(c.name_city),' (',TRIM(d.name_departament),' - ',TRIM(p.country_name),')') AS name_city");
            return self::getResponse([
                'records'   => $query->paginate($request->input('limit') ?? 1300),
            ]);

        } catch (Exception $e) {
            return self::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }
}
