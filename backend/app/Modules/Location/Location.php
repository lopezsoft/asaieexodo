<?php

namespace App\Modules\Location;

use App\Models\Location\Cities;
use App\Queries\QueryTable;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\Request;

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

            return QueryTable::table('countries', $where);

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
                'records'   => $query->paginate($request->input('limit') ?? 15),
            ]);

        } catch (Exception $e) {
            return self::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }
}
