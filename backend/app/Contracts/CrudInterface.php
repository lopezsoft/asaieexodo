<?php


namespace App\Contracts;

use Illuminate\Http\Request;

interface CrudInterface
{
    static function create(Request $request);
    static function read(Request $request, $id);
    static function update(Request $request, $id);
    static function delete(Request $request, $id);
}
