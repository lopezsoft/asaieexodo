<?php

namespace App\Modules\Promotion;

use App\Modules\Academic\ControlClosingDates;
use App\Modules\Courses\Courses;
use App\Modules\School\SchoolQueries;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Queries\CallExecute;
use App\Queries\TablesQuery;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdvancePromotion{
    use MessagesTrait;
    public static function getAdvancePromotion($request): JsonResponse
    {

        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            $year   = $school->year;
            $limit  = $school->limit;

            $query = DB::table("{$db}promoted_header AS tp")
             ->join("{$db}inscripciones AS te", "tp.student_id", "=", "te.id")
             ->join("{$db}grados AS tg", "tp.grade_id", "=", "tg.id")
             ->join("{$db}jornadas AS tj", "tp.studyday_id", "=", "tj.cod_jorn")
             ->join("{$db}sedes AS ts", "tp.headq_id", "=", "ts.ID")
             ->selectRaw("tp.*, CONCAT(RTRIM(te.apellido1), ' ', RTRIM(te.apellido2), ' ', RTRIM(te.nombre1), ' ', RTRIM(te.nombre2)) AS nombres, RTRIM(tg.grado) AS grado, RTRIM(tj.jornada) AS jornada, RTRIM(ts.headquarters_name) AS sede")
             ->where("tp.year", "=", $year)
             ->orderBy("tp.grade_id")
             ->orderBy("nombres");

        return self::getResponse(['records' => $query->paginate($limit)]);
        }catch (\Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
    public static function getFinalLeveling(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db     = $school->db;
            $params = [
                $school->year,
                $request->input('pdbDocente') ?? CoursesOfTeacher::getTeacherId($db),
                1
            ];
            return self::getResponse(['records' => [
                'data' => CallExecute::execute("{$db}sp_select_respeciales_docente(?,?,?)", $params)
            ]]);
        }catch (Exception $e){
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }

    public static function createAdvancePromotion(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $year       = $school->year;
            $grado 		= $request->input('pdbGrado');
            $grupo 		= $request->input('pdbGrupo');
            $jorn 		= $request->input('pdbJorn');
            $sede 		= $request->input('pdbSede');
            $gradoMove	= $request->input('pdbGradoMove');
            $list		= $request->input('pdbList');
            ControlClosingDates::isCurrentYear($year);
            $lista		= json_decode($list);
            $tableMove	= $db.TablesQuery::getTableNotes($gradoMove); // Tabla de donde se moverán los datos
            $tableDest	= $db.TablesQuery::getTableNotes($grado);	  // Tabla a donde se moverán los datos
            DB::beginTransaction();
            foreach($lista as  $fields){
                foreach ($fields as $field => $value) {
                    $sqlIns		= DB::Table("{$db}student_enrollment")
                                        ->select('id_student')
                                        ->where('id', $value)->first();
                    $sqlMove	= DB::Table($tableMove)
                                    ->where('id_matric', $value)
                                    ->where('year', $year)
                                    ->get();
                    $id_matric	= 0;
                    if ($sqlMove->count() > 0){
                        //Se actualiza la student_enrollment con los nuevos datos
                        if ($sqlIns->id_student > 0){
                            $id = DB::table($db . 'student_enrollment')->insertGetId([
                                'id_student'        => $sqlIns->id_student,
                                'id_grade'          => $grado,
                                'id_group'          => $grupo,
                                'id_headquarters'   => $sede,
                                'id_study_day'      => $jorn,
                                'year'              => $year,
                                'id_state'          => 2,
                            ]);
                            if ($id > 0){
                                $id_matric = $id;
                            }
                            $sqlUpdate  = "UPDATE {$db}student_enrollment SET id_state = 3, promoted = 1  WHERE id={$value}";
                        }else{
                            $sqlUpdate  = "UPDATE {$db}student_enrollment SET id_grade='{$grado}', id_group='{$grupo}'
                                ,id_headquarters={$sede}, id_study_day={$jorn} WHERE id={$value}";
                        }
                        DB::statement($sqlUpdate);
                        //Se inserta en la tabla de promovidos
                        $query = DB::table($db . "student_enrollment")
                            ->selectRaw("id_student,id_headquarters,id_grade,id_study_day,id_group,year")
                            ->where('id', $value)
                            ->first();
                        // Header
                        $promotedId	= DB::table($db . 'promoted_header')->insertGetId([
                            'student_id'        => $query->id_student,
                            'headq_id'          => $query->id_headquarters,
                            'grade_id'          => $query->id_grade,
                            'studyday_id'       => $query->id_study_day,
                            'group_id'          => $query->id_group,
                            'year'              => $query->year,
                        ]);
                        // Detail
                        $insert = "INSERT INTO {$db}detail_promoted(promoted_id,subject_id,final,faults) ".
                            " SELECT {$promotedId},tc.id_asig,tn.final,tn.faltas FROM {$tableMove} AS tn ".
                            "LEFT JOIN {$db}cursos AS tc ON (tn.id_curso=tc.id AND tn.year = tc.year)
									LEFT JOIN {$db}student_enrollment AS tm ON tn.id_matric = tm.id
									WHERE tc.year ={$year} AND tm.year = {$year} AND tm.id={$value} AND tn.periodo=1";
                        DB::statement($insert);

                        foreach ($sqlMove as $row)
                        {
                            $curso = Courses::getActiveCourse($row->id_curso, $db);
                            if ($id_matric == 0){
                                $id_matric	= $row->id_matric;
                            }
                            $_SQL = "INSERT INTO {$tableDest} (id_curso,id_matric,periodo,year,
									n1,n2,n3,n4,n5,n6,n7,n8,n9,n10,n11,
									n12,n13,n14,n15,n16,n17,n18,
									n19,n20,n21,n22,n23,n24,n25,
									n26,n27,n28,n29,n30,final,id_escala,faltas,
									nota_perdida,nota_habilitacion,injustificadas,retraso,nivelacion) ".
                                "VALUES ('".$curso."','".$id_matric."','".
                                $row->periodo."','".$year."','".$row->n1."','".$row->n2."','".
                                $row->n3."','".$row->n4."','".$row->n5."','".$row->n6."','".$row->n7."','".
                                $row->n8."','".$row->n9."','".$row->n10."','".$row->n11."','".$row->n12."','".
                                $row->n13."','".$row->n14."','".$row->n15."','".$row->n16."','".$row->n17."','".
                                $row->n18."','".$row->n19."','".$row->n20."','".$row->n21."','".
                                $row->n22."','".$row->n23."','".$row->n24."','".$row->n25."','".
                                $row->n26."','".$row->n27."','".$row->n28."','".$row->n29."','".$row->n30."','".
                                $row->final."','".$row->id_escala."','".
                                $row->faltas."','".$row->nota_perdida."','".
                                $row->nota_habilitacion."','".$row->injustificadas."','".
                                $row->retraso."','".$row->nivelacion."')";
                            DB::statement($_SQL);
                        }
                    }
                }
            }
            DB::commit();
            return self::getResponse([
                "message" => "Se ha realizado la promoción correctamente"
            ]);
        }catch (Exception $e){
            DB::rollBack();
            return self::getResponse500([
                "message" => $e->getMessage()
            ]);
        }
    }
}


