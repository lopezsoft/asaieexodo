<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Modules\Administrative\GroupDirectors;
use Illuminate\Http\Request;

class GroupDirectorsController extends Controller
{
    public function getGroupDirectorByGrade(Request $request): array
    {
        return GroupDirectors::getGroupDirectorByGrade($request);

    }
}
