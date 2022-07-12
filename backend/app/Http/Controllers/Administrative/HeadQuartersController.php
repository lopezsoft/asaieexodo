<?php

namespace App\Http\Controllers\Administrative;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Contracts\ResourceActionsInterface;
use App\Models\Administrative\HeadQuarters;

class HeadQuartersController extends Controller implements ResourceActionsInterface
{
    function index(Request $request){
        return HeadQuarters::read($request, null);
    }

    function store(Request $request){
        return HeadQuarters::create($request);
    }

    function show(Request $request, $id){
        return HeadQuarters::read($request, $id);
    }

    function edit(Request $request, $id){
        return HeadQuarters::read($request, $id);
    }

    function update(Request $request, $id){
        return HeadQuarters::update($request, $id);
    }

    function destroy(Request $request, $id){
        return HeadQuarters::delete($request, $id);
    }
}
