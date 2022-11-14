<?php

namespace App\Modules\Student;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use App\Traits\SystemTablesTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MoveStudents
{
    use SystemTablesTrait, MessagesTrait;
    public static function move(Request $request): \Illuminate\Http\JsonResponse {
        $list       = json_decode($request->input('pdbList')) ?? [];
        $grado		= $request->input('pdbGrado');
        $grupo 		= $request->input('pdbGrupo');
        $jorn 		= $request->input('pdbJorn');
        $sede 		= $request->input('pdbSede');
        $gradoMove	= $request->input('pdbGradoMove');
        $tableMove	= self::getTableNotes($gradoMove); // Tabla de donde se moverán los datos
        $tableDest	= self::getTableNotes($grado); // Tabla a donde se moverán los datos
        $school     = SchoolQueries::getSchoolRequest($request);
        $db	        = $school->db;
        $year       = $school->year;
        try{
            DB::beginTransaction();
            foreach ($list as $field => $value) {
                $sqlMove    = DB::table("{$db}{$tableMove}")
                                ->where('id_matric',$value->id_matric)
                                ->where('year', $year)
                                ->get();
                /**
                 * Actualiza los datos de la matrícula existente por los nuevos
                 */
                $object	= [
                    'id_headquarters'	=> $sede,
                    'id_group'			=> $grupo,
                    'id_grade'			=> $grado,
                    'id_study_day'		=> $jorn
                ];
                DB::table($db.'student_enrollment')
                    ->where('id', $value->id_matric)
                    ->update($object);

                $id_matric	= $value->id_matric;
                if($sqlMove->count() > 0) {
                    //Guarda los datos de las notas a mover antes de borrarlos de la tabla original
                    $sqlSend = sprintf("INSERT INTO %sbackup_notes (id,id_curso,id_matric,periodo,year,
							n1,n2,n3,n4,n5,n6,n7,n8,n9,n10,n11,n12,n13,n14,n15,n16,n17,n18,
							n19,n20,n21,n22,n23,n24,n25,n26,n27,n28,n29,n30,final,id_escala,faltas,
							nota_perdida,nota_habilitacion,injustificadas,retraso,nivelacion,fecha,table_name)
                            SELECT id,id_curso,id_matric,periodo,year,n1,n2,n3,n4,n5,n6,n7,n8,n9,n10,n11,
							n12,n13,n14,n15,n16,n17,n18,n19,n20,n21,n22,n23,n24,n25,n26,n27,n28,n29,n30,final,id_escala,faltas,
							nota_perdida,nota_habilitacion,injustificadas,retraso,nivelacion,if(fecha='0000-00-00', null, fecha),'%s' FROM {$db}{$tableMove} WHERE id_matric =%s", $db, $tableMove, $id_matric);
                    DB::select($sqlSend);
                    foreach ($sqlMove as $row) {
                        /**
                         * Nuevo curso asignado a las notas
                         */
                        $curso = self::getTeacherCourse($grado,$grupo,$sede,$jorn,$year,$row->id_curso, $db);
                        if ($curso == 0 ){
                            $curso = $row->id_curso;
                        }

                        $sql = sprintf("INSERT IGNORE INTO %s%s (id_curso,id_matric,periodo,year,
								n1,n2,n3,n4,n5,n6,n7,n8,n9,n10,n11,	n12,n13,n14,n15,n16,n17,n18,
								n19,n20,n21,n22,n23,n24,n25,n26,n27,n28,n29,n30,final,id_escala,faltas,
								nota_perdida,nota_habilitacion,injustificadas,retraso,nivelacion,fecha)
                                VALUES ('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s',
                                '%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')",
                            $db, $tableDest, $curso, $id_matric, $row->periodo, $year, $row->n1, $row->n2, $row->n3, $row->n4, $row->n5, $row->n6, $row->n7,
                            $row->n8, $row->n9, $row->n10, $row->n11, $row->n12, $row->n13, $row->n14, $row->n15, $row->n16, $row->n17,
                            $row->n18, $row->n19, $row->n20, $row->n21, $row->n22, $row->n23, $row->n24, $row->n25, $row->n26, $row->n27,
                            $row->n28, $row->n29, $row->n30, $row->final, $row->id_escala, $row->faltas, $row->nota_perdida, $row->nota_habilitacion,
                            $row->injustificadas, $row->retraso, $row->nivelacion, $row->fecha == '0000-00-00' ? date('Y-m-d') : $row->fecha);
                        DB::select($sql);
                    }
                }
            }

            DB::commit();
            return  self::getResponse([
                'message' => 'Proceso finalizado correctamente.'
            ]);
        }catch( Exception $e) {
            DB::rollback();
            return self::getResponse500([
                'error' => $e->getMessage(),
            ]);
        }
    }

}
