<?php

namespace App\Modules\Observer;

use App\Common\HttpResponseMessages;
use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Queries\CallExecute;
use App\Queries\InsertTable;
use App\Queries\UpdateTable;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Observer
{
    public static function index(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            $type   = $request->type ?? 3;
            $year   = $school->year;
            $id     = $request->pdbId ?? 0;
            $tableObserver = match ($type) {
                4, 1 => "obs_observador_mod_1",
                2 => "obs_observador_mod2",
                default => "obs_observador_mod_3",
            };
            $result = DB::table("{$db}{$tableObserver}",'tob')
                ->join($db.'student_enrollment as tm', 'tob.id_matric', '=', 'tm.id')
                ->join($db.'grados as tg', 'tm.id_grade', '=', 'tg.id')
                ->join($db.'jornadas as tj', 'tm.id_study_day', '=', 'tj.cod_jorn')
                ->selectRaw('tob.*,tm.id_grade, tm.id_group, tm.id_headquarters, tm.id_study_day,
                    rtrim(tg.grado) as grado, rtrim(tj.jornada) as jornada')
                ->where('tob.id_matric', $id)
                ->where('tm.year', $year)
                ->where('tob.estado', 1);

            return HttpResponseMessages::getResponse([
                'records'   => $result->paginate()
            ]);
        }catch (Exception $e) {
            return HttpResponseMessages::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }

    public static function importCriteria(Request $request): JsonResponse
    {
        try {
            $school         = SchoolQueries::getSchoolRequest($request);
            $db             = $school->db;
            $tableCriteria  = $db.'obs_criterios';
            $tableItems     = $db.'obs_items_modelos';
            $oldYear        = DB::table($tableItems)->max('year');
            if (!$oldYear > 0) {
                return HttpResponseMessages::getResponse500([
                    'message'   => 'No se encontraron registros para importar'
                ]);
            }
            $currentYear    = DB::table($tableItems)
                                ->where('year', $school->year)->first();
            if ($currentYear) {
                return HttpResponseMessages::getResponse500([
                    'message'   => 'Ya se importaron los criterios para este año: '.$school->year
                ]);
            }
            $aspects    = DB::table($tableItems)
                ->where('year', $oldYear)->get();

            $criteria   = DB::table($tableCriteria, 'oc')
                ->join($tableItems.' as oim', 'oc.id_item_modelo', '=', 'oim.id')
                ->where('oim.year', $oldYear)
                ->selectRaw('oc.*')
                ->get();
            DB::beginTransaction();
            foreach ($aspects as $aspect) {
               $aspectId    = DB::table($tableItems)->insertGetId([
                   'id_modelo'      => $aspect->id_modelo,
                   'year'           => $school->year,
                   'descripcion'    => $aspect->descripcion,
                   'estado'         => $aspect->estado,
                   'convivencia'    => $aspect->convivencia,
               ]);
               $criteriaFilter = $criteria->where('id_item_modelo', $aspect->id);
                foreach ($criteriaFilter as $criterion) {
                     DB::table($tableCriteria)->insert([
                          'id_item_modelo' => $aspectId,
                          'descripcion'    => $criterion->descripcion,
                          'estado'         => $criterion->estado,
                     ]);
                }
            }
            DB::commit();
            return HttpResponseMessages::getResponse([
                'message'   => 'Se importaron los criterios correctamente'
            ]);
        }catch (Exception $e) {
            DB::rollBack();
            return HttpResponseMessages::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }

    public static function createAnnotations(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $records    = json_decode($request->records);
            $records->id_docente = $teacherId;
            return InsertTable::insert($request, $records, $db.'obs_anotaciones_mod_3');
        }catch (Exception $e) {
            return HttpResponseMessages::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }

    public static function getItemsModel3(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $teacherId  = CoursesOfTeacher::getTeacherId($db);
            $year       = $school->year;
            $id        = $request->pdbObserverId ?? 0;
            $param	= [
                $id,
                $teacherId,
                $year
            ];
            $result = CallExecute::execute($db.'sp_criterios_obs_m3 (?, ?, ?)', $param);
            return HttpResponseMessages::getResponse([
                'records'   => [
                    'data'    => $result,
                ]
            ]);
        }catch (Exception $e) {
            return HttpResponseMessages::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }

    public static function setItemsModel3(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $fieldList  = json_decode($request->records ?? []);
            return UpdateTable::update($request, $fieldList, $db.'obs_items_modelo_3');
        }catch (Exception $e) {
            return HttpResponseMessages::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }
}
