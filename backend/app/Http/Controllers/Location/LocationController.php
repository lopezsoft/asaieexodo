<?php

namespace App\Http\Controllers\Location;

use App\Http\Controllers\Controller;
use App\Modules\Location\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public static function getCities(Request $request): \Illuminate\Http\JsonResponse
    {
        return Location::getCities($request);
    }

    public static function getCountries(Request $request): \Illuminate\Http\JsonResponse
    {
        return Location::getCountries($request);
    }
}
