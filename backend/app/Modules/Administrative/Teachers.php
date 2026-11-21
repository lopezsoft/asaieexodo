<?php

namespace App\Modules\Administrative;

use App\Common\HttpResponseMessages;
use App\Modules\School\SchoolQueries;
use App\Queries\AuditTable;
use App\Queries\InsertTable;
use App\Services\TableValidationService;
use Exception;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Teachers
{
    public static function index(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db	    = $school->db;
            $query  = self::getData($db)->select("td.*");
            return self::getResponseData($request, $query);
        }catch (Exception $e){
            return HttpResponseMessages::getResponse500([
                'message' => $e->getMessage()
            ]);
        }
    }
    public static function create(Request $request): JsonResponse
    {
        try{
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $table      = "{$db}docentes";
            $records    = json_decode($request->records) ?? null;
            if (!$records || empty($records->documento)) {
                return HttpResponseMessages::getResponse400([
                    'message' => 'Los datos del docente o el documento son inválidos.'
                ]);
            }
            $teacher    = DB::table($table)
                            ->where('documento', $records->documento)->first();
            if($teacher){
                return HttpResponseMessages::getResponse400([
                    'message' => "El docente con documento {$records->documento} ya existe"
                ]);
            }
            $validator  = new TableValidationService();
            $validator  = $validator->generateValidator((array) $records, $table);
            if ($validator->fails()) {
                return HttpResponseMessages::getResponse400([
                    'message' => $validator->errors()->first()
                ]);
            }

            DB::beginTransaction();

            // Eliminar posible registro previo en la tabla legacy 'users' del colegio (ej. exalumno/acudiente)
            // para evitar colisión de clave única 'username' en el trigger 'docentes_after_insert'
            DB::table("{$db}users")
                ->where('username', $records->documento)
                ->delete();

            $primaryKey  = 'id_docente';
            $teacherData = InsertTable::getTableData($records, $table, $primaryKey);
            $teacherId   = DB::table($table)->insertGetId($teacherData);

            DB::table("{$db}aux_docentes")->insertOrIgnore([
                'id_docente' => $teacherId,
                'year'       => $school->year ?? date('Y'),
            ]);

            AuditTable::audit($request->ip(), $table, 'INSERT', $teacherData);

            $newTeacher = DB::table($table)
                ->where($primaryKey, $teacherId)
                ->first();

            DB::commit();

            return HttpResponseMessages::getResponse([
                'record' => $newTeacher
            ]);
        }catch (Exception $e){
            DB::rollBack();
            return HttpResponseMessages::getResponse500([
                'message' => $e->getMessage()
            ]);
        }
    }
    public static function getByYear(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db	    = $school->db;
            $year   = $school->year;

            $query  = self::getData($db)
                        ->join("{$db}aux_docentes AS t1", 't1.id_docente', '=','td.id_docente')
                        ->select("td.*","t1.year")
                        ->where('td.estado', 1)
                        ->where('t1.year', $year);
            return self::getResponseData($request, $query);
        }catch (Exception $e){
            return HttpResponseMessages::getResponse500([
                'message' => $e->getMessage()
            ]);
        }
    }

    private static function getData($db): Builder
    {
        return DB::table("{$db}docentes AS td");
    }
    private static function getResponseData(Request $request, $query): JsonResponse
    {
        $search = $request->input('query') ?? null;
        $limit  = $request->input('limit') ?? 15;
        if($search){
            $query->where(function ($row) use ($search) {
                $row->where("td.documento",   'like', "%{$search}%");
                $row->orWhereRaw("CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) LIKE '%{$search}%'");
            });
        }
        $query->selectRaw("CONCAT(RTRIM(td.apellido1),' ',RTRIM(td.apellido2),' ',RTRIM(td.nombre1),' ',RTRIM(td.nombre2)) AS nombres");
        $query->orderBy('nombres');
        return HttpResponseMessages::getResponse([
            'records' => $query->paginate($limit)
        ]);
    }


}
