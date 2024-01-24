<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Modules\Observer\Observer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ObserverController extends Controller
{
    public function importCriteria(Request $request): JsonResponse
    {
        return Observer::importCriteria($request);
    }
    public function setItemsModel3(Request $request): JsonResponse
    {
        return Observer::setItemsModel3($request);
    }
    public function getItemsModel3(Request $request): JsonResponse
    {
        return Observer::getItemsModel3($request);
    }
    public function index(Request $request): JsonResponse
    {
       return Observer::index($request);
    }
    public function createAnnotations(Request $request): JsonResponse
    {
        return Observer::createAnnotations($request);
    }
}
