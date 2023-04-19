<?php

namespace App\Http\Controllers;
use App\Modules\Table\Headquarter;
use Illuminate\Http\Request;


class TableVoteController extends Controller{

    public function getTableHeadquarters(Request $request): \Illuminate\Http\JsonResponse
    {

        return Headquarter::getTableHeadquarters($request);
    }


}
