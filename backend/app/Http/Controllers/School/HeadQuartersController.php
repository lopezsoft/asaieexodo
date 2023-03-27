<?php

namespace App\Http\Controllers\School;

use App\Contracts\ResourceActionsInterface;
use App\Http\Controllers\Controller;
use App\Models\School\HeadQuarters;
use App\Models\School\StudyLevels;
use App\Models\School\WorkingDay;
use Illuminate\Http\Request;

class HeadQuartersController extends Controller implements ResourceActionsInterface
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        return HeadQuarters::read($request, null);
    }

    public static function read(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        return HeadQuarters::read($request, $id);
    }

    public function getWorkingDay(Request $request): \Illuminate\Http\JsonResponse
    {
        return WorkingDay::query($request);
    }

    public function getStudyLevels(Request $request): \Illuminate\Http\JsonResponse
    {
        return StudyLevels::query($request);
    }

    public function store(Request $request)
    {
        // TODO: Implement store() method.
    }

    public function show(Request $request, $id)
    {
        // TODO: Implement show() method.
    }

    public function update(Request $request, $id)
    {
        // TODO: Implement update() method.
    }

    public function destroy(Request $request, $id)
    {
        // TODO: Implement destroy() method.
    }
}
