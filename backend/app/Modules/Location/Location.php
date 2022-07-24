<?php

namespace App\Modules\Location;

use App\Models\Location\Cities;
use App\Models\Location\Country;
use App\Queries\QueryTable;
use App\Traits\MessagesTrait;
use App\Traits\SessionTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Location
{
    use MessagesTrait;
    public static function getCountries(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $querySearch    = $request->input('query');
            $where          = [];
            if($querySearch){
                $where[] = ['country_name', 'like', "%{$querySearch}%"];
            }
            $where[] = ['active', '=', 1];

            return QueryTable::query('countries', $where);

        } catch (Exception $e) {
            return self::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }

    public static function getCities(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $query          = Cities::query();
            $querySearch    = $request->input('query');
            if($querySearch){
                $query  = $query->where('name_city', 'like', "%{$querySearch}%");
                $query  = $query->orWhere('city_code', 'like', "%{$querySearch}%");
            }
            return self::getResponse([
                'records'   => $query->paginate(),
            ]);

        } catch (Exception $e) {
            return self::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }
}
