<?php

namespace App\Http\Controllers;
use App\Modules\Table\{Headquarter,AssignedCourses};
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
