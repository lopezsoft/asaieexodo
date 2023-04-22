<?php

namespace App\Modules\Subject;

use App\Contracts\CreateContract;
use App\Contracts\ReadContract;
use App\Modules\School\SchoolQueries;
use App\Queries\InsertTable;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuxiliarSubject implements CreateContract, ReadContract
{
    use MessagesTrait;
    public function read(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            $query = DB::table($db.'aux_asignaturas AS t1')
                ->select('t1.*', 't2.area', 't3.asignatura')
                ->leftJoin($db.'areas AS t2', 't1.id_area', '=', 't2.id')
                ->leftJoin($db.'asignaturas AS t3', 't1.id_asign', '=', 't3.id_pk')
                ->where('t1.id_asign', $request->input('pdbId') ?? 0)
                ->orderBy('t1.year', 'desc')
                ->orderBy('t2.area');
            return self::getResponse(['records' => $query->paginate($school->limit)]);
        }catch (\Exception $e){
            return self::getResponse500(['error' => $e->getMessage()]);
        }
    }

    public function create(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            $record = json_decode($request->input('records'));
            $record->id_asign = $request->input('pdbId');
            InsertTable::insert($request, $record, $db.'aux_asignaturas');
            return self::getResponse();
        }catch (\Exception $e){
            return self::getResponse500(['error' => $e->getMessage()]);
        }
    }
}
