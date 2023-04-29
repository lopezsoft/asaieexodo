<?php
namespace App\Modules\Academic;
use App\Modules\School\SchoolQueries;
use App\Queries\CallExecute;
use App\Queries\DeleteTable;
use App\Queries\TablesQuery;
use App\Queries\UpdateTable;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class AcademicNotes
{
    use  MessagesTrait;
    public static function deleteNotes(Request $request, $id):  JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $gradeId    = $request->input('pdbCodGrado');
            $table      = TablesQuery::getTableNotes($gradeId ?? 4);
            $fields     = json_decode($request->input('records'));
            return DeleteTable::delete($request, $fields, "{$db}{$table}");
        }catch (Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
    public static function updateNotes(Request $request, $id):  JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $gradeId    = $request->input('pdbCodGrado');
            $table      = TablesQuery::getTableNotes($gradeId ?? 4);
            $fields     = json_decode($request->input('records'));
            return UpdateTable::update($request, $fields, "{$db}{$table}");
        }catch (Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
    public static function getNotes(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $year       = $school->year;
            $grade      = $request->input('pdbCodGrado');
            $period     = $request->input('pdbPeriodo');
            $enrolledId = $request->input('pdbMatric');
            $query      = CallExecute::execute("{$db}sp_select_notas_academicas_periodo(?,?,?,?)", [$enrolledId, $period, $year, $grade]);
            return self::getResponse([
                'records' => [
                    'data' => $query
                ]
            ]);
       }catch (Exception $e){
           return self::getResponse500([
               "message" => $e->getMessage()
           ]);
       }
    }
}
