<?php

namespace App\Http\Controllers\Location;

use Illuminate\Http\Request;
use App\Models\Location\Location;
use App\Http\Controllers\Controller;

class LocationController extends Controller
{
    public static function getCities(Request $request)
    {
        return Location::getCities($request);
    }

    public static function getCountries(Request $request)
    {
        return Location::getCountries($request);
    }
}
