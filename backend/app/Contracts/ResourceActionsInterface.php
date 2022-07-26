<?php

namespace App\Contracts;

use Illuminate\Http\Request;

interface ResourceActionsInterface{
    public function index(Request $request);
    public function store(Request $request);
    public function show(Request $request, $id);
    public function update(Request $request, $id);
    public function destroy(Request $request, $id);
}
