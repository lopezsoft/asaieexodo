<?php

namespace App\Modules\Administrative;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Teachers
{
    use MessagesTrait;
    public static function getByYear(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db	    = $school->database_name;
        $year   = $request->input('year') ?? Date('Y');
        $search = $request->input('query') ?? null;
        $limit  = $request->input('limit') ?? 15;
        $query  = DB::table("{$db}.docentes AS td");
        $query->leftJoin("{$db}.aux_docentes AS t1", 't1.id_docente', '=','td.id_docente');
        $query->where('td.estado', 1);
        $query->where('t1.year', $year);
        if($search){
            $query->where(function ($row) use ($search) {
                $row->where("td.apellido1",   'like', "%{$search}%");
                $row->orWhere("td.apellido2", 'like', "%{$search}%");
                $row->orWhere("td.nombre1",   'like', "%{$search}%");
                $row->orWhere("td.nombre2",   'like', "%{$search}%");
                $row->orWhere("td.documento",   'like', "%{$search}%");
            });
        }
        $query->select("td.*","t1.year");
        $query->selectRaw("CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) AS nombres");
        $query->orderBy('nombres');
        return self::getResponse([
           'records' => $query->paginate($limit)
        ]);
    }
}
