<?php

namespace App\Http\Controllers;

use App\Contracts\ResourceActionsInterface;
use App\Modules\School\SchoolMaster;
use Illuminate\Http\Request;

class SchoolMasterController extends Controller implements ResourceActionsInterface
{
    //
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        return SchoolMaster::read($request, null);
    }

    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        return SchoolMaster::create($request);
    }

    public function show(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        return SchoolMaster::read($request, $id);
    }

    public function update(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        return SchoolMaster::update($request, $id);
    }

    public function destroy(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        return SchoolMaster::delete($request, $id);
    }
}
