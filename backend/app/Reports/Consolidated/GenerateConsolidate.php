<?php

namespace App\Reports\Consolidated;

use App\Contracts\GenerateConsolidateContract;
use App\Jobs\Consolidate\ConsolidatedByTeacherJob;
use App\Modules\Courses\RatingScale;
use App\Modules\School\SchoolQueries;
use App\Modules\Settings\GeneralSetting;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GenerateConsolidate
{
    use MessagesTrait;
    public function generate(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $properties = (object) [];
            $school         = SchoolQueries::getSchoolRequest($request);
            $db	            = $school->db;
            $year	        = $school->year;
            $gradeId	    = $request->input('pdbCodGrado');
            $studyDayId	    = $request->input('pdbIdJorn');
            $pdbGrupo	    = $request->input('pdbGrupo');
            $typeReport     = $request->input('pTypeReport') ?? 1;
            $pdbIdSede	    = $request->input('pdbIdSede');
            $period	        = $request->input('pdbPeriodo') ?? 1;
            $allPeriods	    = $request->input('allPer') ?? 0;
            $allGroup	    = $request->input('allGroup') ?? 0;

            $settings       = GeneralSetting::getGeneralSettingByGrade($school, $gradeId);

            $enrollments    = DB::Table("{$db}student_enrollment")
                                ->select('id')
                                ->where('year', $year)
                                ->where('id_grade', $gradeId)
                                ->where('id_headquarters', $pdbIdSede)
                                ->where('id_study_day', $studyDayId)
                                ->where('id_state', 2);
            if($allGroup == 0){
                $enrollments->where('id_group', $pdbGrupo);
            }
            $enrollments->orderByRaw('id_grade, id_group, id_study_day');
            $enrollments = $enrollments->get();

            $scale      = RatingScale::getRatingScaleReproved($school, $gradeId);

            $matCourses = DB::Table("{$db}matcurso", "tm")
                            ->leftJoin("{$db}asignaturas as ta",  "tm.id_asig", "=", "ta.id_pk")
                            ->leftJoin("{$db}aux_asignaturas as aux",  "ta.id_pk", "=", "aux.id_asign")
                            ->where('tm.year', $year)
                            ->where('aux.year', $year)
                            ->where('tm.id_grado', $gradeId)
                            ->where('tm.estado', 1);

            if($typeReport == 2){
                $matCourses->select("aux.id_area AS id_asig")
                    ->groupByRaw("aux.id_area, tm.year, aux.year")
                    ->orderBy("aux.id_area");
            } else {
                $matCourses->select("tm.id_asig")
                    ->groupByRaw("tm.id_asig, tm.year, aux.year")
                    ->orderByRaw("aux.id_area, tm.id_asig");
            }

            $matCourses = $matCourses->get();

            $subjectList    = [];
            $countSubjects  = 0;
            foreach ($matCourses as $course) {
                ++$countSubjects;
                $subjectList["ar{$countSubjects}"] = $course->id_asig;
            }

            $properties->gradeId        = $gradeId;
            $properties->groupId        = $pdbGrupo;
            $properties->studyDayId     = $studyDayId;
            $properties->headquartersId = $pdbIdSede;
            $properties->period         = $period;
            $properties->periods        = $period;
            $properties->gradeId        = $gradeId;
            $properties->typeReport     = $typeReport;
            $properties->scale          = $scale;
            $properties->columns        = $subjectList;
            $properties->settings       = $settings;
            $properties->allPeriods     = $allPeriods;
            DB::beginTransaction();
            foreach ($enrollments as $enroll){
                $properties->enrollId = $enroll->id;
                if($typeReport == 3){
                    $this->processPeriods(new ConsolidatedByTeacher(), $properties, $school);
                }else {
                    $this->processPeriods(new GeneralConsolidated(), $properties, $school);
                }
            }
            /**
             * Cuando el tipo de reporte es 1 (asignaturas) o 2 (áreas) genera el total de áreas y asignaturas perdidas
             */
            if($typeReport != 3) {
                if($allGroup == 1){
                    /**
                     * Genera todos los grupos
                     */
                    $enrollments    = DB::Table("{$db}student_enrollment")
                        ->select('id_headquarters', 'id_study_day','id_group', 'id_grade')
                        ->where('year', $year)
                        ->where('id_headquarters', $pdbIdSede)
                        ->where('id_state', 2)
                        ->groupByRaw('id_headquarters, id_study_day, id_group, id_grade')
                        ->orderByRaw('id_grade, id_group, id_study_day')
                        ->get();

                    foreach ($enrollments as $enroll){
                        $properties->gradeId        = $enroll->id_grade;
                        $properties->groupId        = $enroll->id_group;
                        $properties->studyDayId     = $enroll->id_study_day;
                        $properties->headquartersId = $enroll->id_headquarters;
                        $this->processPeriods(new TotalConsolidated(), $properties, $school);
                    }
                }else{
                    $this->processPeriods(new TotalConsolidated(), $properties, $school);
                }
            }
            DB::commit();
            return self::getResponse([
                "message" => "Se ha generado el consolidado"
            ]);
        }catch (\Exception $e){
            DB::rollBack();
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }

    /**
     * @throws \Exception
     */
    private function processPeriods(GenerateConsolidateContract $object, $properties, $school): void
    {
        /**
         * Genera el consolidado de todos los periodos
         */
        if($properties->allPeriods == 1){
            for($x = 1; $x <= strval($properties->periods); $x++){
                $properties->period = $x;
                $this->processConsolidated($object, $properties, $school);
            }
        }else{
            $this->processConsolidated($object, $properties, $school);
        }
    }

    /**
     * @throws \Exception
     */
    private function processConsolidated(GenerateConsolidateContract $object, $properties, $school): void
    {
        if($properties->typeReport == 3){
            ConsolidatedByTeacherJob::dispatch($properties, $school);
        }else {
            $object->generate($properties, $school);
        }
    }
}
