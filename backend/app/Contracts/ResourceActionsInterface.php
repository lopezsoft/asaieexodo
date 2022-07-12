<?php

namespace App\Contracts;

use Illuminate\Http\Request;

interface ResourceActionsInterface{
    function index(Request $request);
    function store(Request $request);
    function show(Request $request, $id);
    function edit(Request $request, $id);
    function update(Request $request, $id);
    function destroy(Request $request, $id);
}
