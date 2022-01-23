<?php

namespace App\Models\Location;

use Exception;
use App\Traits\SessionTrait;
use Illuminate\Http\Request;
use App\Traits\MessagesTrait;
use Illuminate\Support\Facades\DB;

class Location
{

    public static function getCountries(Request $request)
    {
        try {
            $db     = SessionTrait::getDatabase();

            $query  = DB::table($db.".countries")
                        ->where('active', 1)->get();

            return MessagesTrait::getResponse([
                'records'   => $query,
                'total'     => count($query)
            ]);

        } catch (Exception $e) {
            return MessagesTrait::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }

    public static function getCities(Request $request)
    {
        try {
            $db     = SessionTrait::getDatabase();

            $query  = DB::select("SELECT a.*, b.name_department FROM $db.cities AS a LEFT JOIN $db.departments AS b ON a.department_id = b.id");

            return MessagesTrait::getResponse([
                'records'   => $query,
                'total'     => count($query)
            ]);

        } catch (Exception $e) {
            return MessagesTrait::getResponse500(
                [
                    'message'   => $e->getMessage()
                ]
            );
        }
    }
}
