<?php
namespace App\Modules\Academic;
use App\Modules\School\SchoolQueries;
use Illuminate\Support\Facades\DB;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
class AcademicNotes
{
    use  MessagesTrait;
    public static function getAcademicNotes(Request $request): \Illuminate\Http\JsonResponse {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $limit  = $request->input('limit') ?? 15;
            $year = $request->input('year');
            $grade = $request->input('pdbGrado');
            $group = $request->input('pdbGrupo');
            $jorn = $request->input('pdbJorn');
            $headquarter = $request->input('pdbSede');
            $query = DB::select("call {$db}sp_select_cursos_notas(?,?,?,?,?)", [$headquarter, $jorn, $grade, $group, $year]);
            return self::getResponse(['records' => $query,'success' => true]);
       }catch (\Exception $e){
           return self::getResponse500([
               "error" => $e->getMessage()
           ]);
       }
    }
}
