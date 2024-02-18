<?php

namespace App\Http\Controllers\Representative;
use App\Http\Controllers\Controller;
use App\Modules\Table\{AssignedCourses, Headquarter};
use Illuminate\Http\Request;


class TableVoteController extends Controller{

    public function getTableHeadquarters(Request $request): \Illuminate\Http\JsonResponse
    {

        return Headquarter::getTableHeadquarters($request);
    }

    public function getDegreesPerTable(Request $request): \Illuminate\Http\JsonResponse
    {
        return AssignedCourses::getDegreesPerTable($request);
    }

}
