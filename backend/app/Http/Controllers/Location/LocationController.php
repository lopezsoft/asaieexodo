<?php

namespace App\Http\Controllers\Location;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public static function getCities(Request $request): \Illuminate\Http\JsonResponse
    {
        return \App\Modules\Location\Location::getCities($request);
    }

    public static function getCountries(Request $request): \Illuminate\Http\JsonResponse
    {
        return \App\Modules\Location\Location::getCountries($request);
    }
}
