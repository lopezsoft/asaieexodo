<?php

namespace App\Modules\School;

use App\Common\MessageExceptionResponse;
use App\Models\School\School;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SchoolQueries
{

    /**
     * @throws \Exception
     */
    public static function getSchoolRequest(Request $request): ?object
    {
        try{
            $school     = self::getSchool($request->input('schoolId') ?? 0);
            if (!$school) {
                throw new Exception('No se encontró la escuela');
            }
            $year       = $request->input('year') ?? Date('Y');
            return (object) [
                'id'                => $school->id,
                'school'            => $school,
                'db'                => "{$school->database_name}.",
                'database_name'     => $school->database_name,
                'year'              => $year,
                'pdbYear'           => $request->input('pdbYear'),
                'grade' 	        => $request->input('pdbGrado'),#
                'group'	            => $request->input('pdbGrupo'),#
                'headquarter'	    => $request->input('pdbSede'),#
                'workingDay'        => $request->input('pdbJorn'),#
                'format'		    => $request->input('pFormat') ?? 'pdf',
                'schoolId'		    => $request->input('schoolId') ?? 0,
                'page'		        => $request->input('page') ?? 0,
                'limit'		        => $request->input('limit') ?? 15,
                'profileId'		    => $request->input('profileId') ?? 0,
                'path'              => "{$school->folder_name}"
            ];
        }catch( Exception $e) {
            throw new Exception($e->getMessage());
        }
    }
    public static function getSchool($id): object | null
    {
        try {
            return DB::table('schools')->where('id', $id)->first();
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function getSchoolById($id = null){
        return School::where('id', $id)->first();
    }

    public static function getSchoolByCode($school_code = null){
        return School::where('statecode', $school_code)->first();
    }

    public static function getSchoolAndHeaderReportParams($db): array
    {
        $sqlData = DB::select("SELECT a.encabezado, a.logo, a.escudo, a.pie,
       b.school_name, b.dni, b.address FROM {$db}encabezado_reportes AS a, {$db}school AS b LIMIT 1")[0];
        return [
            "P_SCHOOL_NAME"     => $sqlData->school_name,
            "P_DNI"             => $sqlData->dni,
            "P_LOGO"            => $sqlData->logo,
            "P_ESCUDO"          => $sqlData->escudo,
        ];
    }
}
