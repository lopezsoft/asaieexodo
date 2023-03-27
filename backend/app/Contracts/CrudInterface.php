<?php


namespace App\Contracts;

use Illuminate\Http\Request;

interface CrudInterface
{
    public static function create(Request $request);
    public static function read(Request $request, $id);
    public static function update(Request $request, $id);
    public static function delete(Request $request, $id);
}
