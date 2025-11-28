<?php

namespace App\Modules\Promotion;

use App\Common\HttpResponseMessages;
use App\Common\MessageExceptionResponse;
use App\Modules\Academic\ControlClosingDates;
use App\Modules\Courses\Courses;
use App\Modules\School\SchoolQueries;
use App\Modules\Settings\GeneralSetting;
use App\Queries\CallExecute;
use App\Traits\MessagesTrait;
use App\Traits\SystemTablesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GenerateFinalReport
{
    private int $_n_per_div     = 0;
    private int $_n_decimales   = 0;
    private int $_n_promocion   = 0;
    private int $_n_red         = 0;
    private int $_n_final_red   = 0;
    private int $_n_aplica      = 0;
    private int $_t_año_lectivo = 0;

    public static function closeYear(Request $request): JsonResponse
    {
        try {
            $school = SchoolQueries::getSchoolRequest($request);
            $db	    = $school->db;
            $year   = $school->year;
            $Grado  = 5;
            ControlClosingDates::validateFinalPeriod($school, $Grado);
            CallExecute::execute("{$db}sp_close_year(?)", [$year]);
            return HttpResponseMessages::getResponse([
                'message'   => 'El año escolar ha sido cerrado correctamente.'
            ]);
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }

    }

    use MessagesTrait, SystemTablesTrait;

    /**
     * @throws Exception
     */
    public function generateFinalSavannas(Request $request): JsonResponse {
        $all	= $request->input('pdbAll') ?? 0;
        $school = SchoolQueries::getSchoolRequest($request);
        $db	    = $school->db;
        $year   = $school->year;

        $query	= $this->getEnrollmentQuery($db, $school, $all);
        try{
            DB::beginTransaction();
            foreach($query as $row){
                $this->sp_generate_sabanas($row->id_matric,$school->grade, $year, $db);
            }
            DB::commit();
            return self::getResponse();
        }catch(Exception $e){
            DB::rollback();
            return self::getResponse500([
                'error'      => $e->getMessage(),
            ]);
        }
    }

    /**
     * @throws Exception
     */
    public function generateReport(Request $request): JsonResponse
    {
        $Grado 	= $request->input('pdbGrado');
        $Sede	= $request->input('pdbSede');
        $Jorn	= $request->input('pdbJorn');
        $all	= $request->input('pdbAll') ?? 0;

        try{
            $school = SchoolQueries::getSchoolRequest($request);
            $db	    = $school->db;
            $year   = $school->year;

            $gSettings    = GeneralSetting::getGeneralSettingByGrade($school, $Grado);
            if (!$gSettings){
                throw new Exception("No se han configurado los ajustes generales para el grado seleccionado.");
            }

            $this->_n_decimales	    = $gSettings->Ndecimales;
            $this->_n_promocion	    = $gSettings->promocion;
            $this->_n_red		    = $gSettings->nota_redondeo;
            $this->_n_final_red	    = $gSettings->nota_final_redondeo;
            $this->_n_aplica	    = $gSettings->aplicar_redondeo_fin_año;
            $this->_t_año_lectivo	= $gSettings->t_año_lectivo;

            $finalPeriod = ControlClosingDates::validateFinalPeriod($school, $Grado);
            switch($this->_n_promocion){
                case 3 : // Periodo final
                case 4 : // cuarto periodo
                    if($finalPeriod){
                        $this->_n_per_div = $finalPeriod->periodo;
                    }
                    break;
                default:
                    $totalPeriod  = AcademicPeriods::getPeriodsTotal($school, $Grado);;
                    if($totalPeriod){
                        $this->_n_per_div = $totalPeriod->total;
                    }
                    break;
            }
            $query  = $this->getEnrollmentQuery($db, $school, $all);
            DB::beginTransaction();
            foreach($query as $row){
                $this->finalBook($Sede,$Grado,$row->grupo,$year,$row->id_matric,$Jorn, $db, $gSettings);
                $this->sp_update_areasf($row->id_matric, $year, $db);
                $this->sp_generate_sabanas($row->id_matric,$Grado, $year, $db);
            }
            DB::commit();
            return self::getResponse();
        }catch(Exception $e){
            DB::rollback();
            return self::getResponse500([
                'error'      => $e->getMessage(),
            ]);
        }
    }

    private function getEnrollmentQuery($db, $school, int $all): \Illuminate\Support\Collection
    {

        $query	= DB::table($db."student_enrollment","tm")
            ->selectRaw("id_group grupo, tm.id id_matric")
            ->leftJoin($db."inscripciones AS ti", "tm.id_student", "=", "ti.id")
            ->where("tm.id_headquarters", $school->headquarter)
            ->where("tm.year", $school->year)
            ->where("tm.id_grade", $school->grade)
            ->where("tm.id_study_day", $school->workingDay)
            ->where("tm.id_state", 2);
        if($all <= 0) {
            $query->where('tm.id_group', '=', "{$school->group}");
        }
        return $query->get();
    }

    private function sp_generate_sabanas($id_matric, $grado, $year, $db): void {
        $param	= [
            $year,
            $id_matric,
            $grado
        ];
        CallExecute::execute($db.'sp_generate_sabanas( ?, ?, ? )',$param);
    }

    private function sp_update_areasf($id_matric, $year, $db): void {
        $sql = DB::table("{$db}acta_promocion")
                ->where("id_matric", $id_matric)
                ->first();
        if (!$sql){
            $query = sprintf("INSERT INTO %sacta_promocion (id_matric,promedio,promedio_rec) SELECT id_matric,ROUND(AVG(final),2), ".
                "ROUND(AVG(IF(final > recuperacion,final,recuperacion)),2) FROM %sareasf WHERE id_matric=%s GROUP BY id_matric", $db, $db, $id_matric);
            DB::statement($query);
        }else{
            $sql = DB::table("{$db}areasf")
                    ->selectRaw("ROUND(AVG(final),2) final, ROUND(AVG(IF(final > recuperacion,final,recuperacion)),2) final_r")
                    ->where('id_matric',$id_matric)
                    ->groupBy('id_matric')
                    ->get();
            if ($sql->count() > 0){
                DB::table("{$db}acta_promocion")
                        ->where('id_matric',$id_matric)
                        ->update([
                            'promedio'      => $sql[0]->final,
                            'promedio_rec'  => $sql[0]->final_r
                        ]);
            }
        }
        $param	=[
            $id_matric,
            $year
        ];
        CallExecute::execute("{$db}sp_libro_final_areas(?, ?)", $param);
    }

    private function finalBook($_id_sede,$_grado,$_grupo,$_year,$_id_matric,$_jorn, $db, $gSettings): void {
        $table	= $db.$this->getTableNotes($_grado);
        $params = [$_id_matric,$_year,$_grado,"{$_grupo}",$_id_sede,$_jorn,$this->_n_per_div,
            $gSettings->Ndecimales, $gSettings->promocion];
        $query	= CallExecute::execute("{$db}sp_final_book_notes(?, ?, ?, ?, ?, ?, ?, ?, ?)", $params);

        $select	= sprintf("SELECT t.hasta FROM %sdesempeños t".
            " LEFT JOIN %sgrados_agrupados AS t1 ON t.id_grado_agrupado = t1.id".
            " LEFT JOIN %saux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id".
            " WHERE t.year = %s AND t.reprueba = 1".
            " AND t2.id_grado = %s LIMIT 1", $db, $db, $db, $_year, $_grado);
        $select	= DB::select($select);
        switch($gSettings->promocion){
            case 3 : // Quinto periodo
            case 4 : // Cuarto periodo
                $cSQLInsert	= "";
                if (count($query) > 0 ){
                    foreach($query as $row){
                        $_p1    = 0;
                        $_p2    = 0;
                        $_p3    = 0;
                        $_p4    = 0;
                        $inj    = 0;
                        $just   = 0;
                        $ret    = 0;
                        $queryNotes	= sprintf("SELECT IF(nota_habilitacion > 0, nota_habilitacion, final) nt, periodo, faltas, injustificadas, retraso FROM %s".
							" WHERE id_curso =%s AND id_matric =%s AND periodo BETWEEN 1 AND %d", $table, $row->id_curso, $_id_matric, $this->_n_per_div);
                        $queryNotes = DB::select($queryNotes);
                        if(count($queryNotes) > 0){
                            foreach($queryNotes as $key){
                                $inj  += $key->injustificadas;
                                $just += $key->faltas;
                                $ret  += $key->retraso;
                                switch($key->periodo){
                                    case '1':
                                        $_p1 = $key->nt;
                                        break;
                                    case '2':
                                        $_p2 = $key->nt;
                                        break;
                                    case '3':
                                        $_p3 = $key->nt;
                                        break;
                                    case '4':
                                        $_p4 = $key->nt;
                                        break;
                                }
                            }
                        }
                        $final	= $row->final;
                        $curso	= $this->activeCourse($row->id_curso, $db);
                        $final  = $this->applyYearEndRounding($final, $gSettings, $select);
                        $cSQLInsert .= "(".$_id_matric.",".$curso.",'".$final."','".$just."','".$inj."','".$ret.
                            "','".$_p1."','".$_p2."','".$_p3."','".$_p4."'),";
                    }
                }
                $this->insertAreasF($cSQLInsert, $db);
                break;
            default:
                $cSQLInsert	= "";
                if (count($query) > 0 ){
                    foreach($query as $row){
                        $_p1 = 0;
                        $_p2 = 0;
                        $_p3 = 0;
                        $_p4 = 0;
                        $queryNotes	= sprintf("SELECT IF(nota_habilitacion > 0, nota_habilitacion, final) nt, periodo FROM %s".
							" AS tn LEFT JOIN %scursos AS tc ON (tn.id_curso=tc.id AND tn.year=tc.year)".
							" WHERE tc.id_asig=%s AND id_matric =%s AND periodo BETWEEN 1 AND %d", $table, $db, $row->id_asig, $_id_matric, $this->_n_per_div);

                        $queryNotes = DB::select($queryNotes);

                        if(count($queryNotes) > 0){
                            foreach($queryNotes as $key){
                                switch($key->periodo){
                                    case '1':
                                        $_p1 = $key->nt;
                                        break;
                                    case '2':
                                        $_p2 = $key->nt;
                                        break;
                                    case '3':
                                        $_p3 = $key->nt;
                                        break;
                                    case '4':
                                        $_p4 = $key->nt;
                                        break;
                                }
                            }
                        }
                        $final	= 	$row->final;
                        $curso	= $this->activeCourse($row->id_curso, $db);
                        $final  = $this->applyYearEndRounding($final, $gSettings, $select);
                        $cSQLInsert .= "(".$_id_matric.",".$curso.",'".$final.
                            "','".$row->faltas."','".$row->injustificadas."','".$row->retraso.
                            "','".$_p1."','".$_p2."','".$_p3."','".$_p4."'),";
                    }
                }
                $this->insertAreasF($cSQLInsert, $db);
                break;
        }
    }

    private function insertAreasF($cSQLInsert, $db): void {
        if (!empty($cSQLInsert)){
            $query = sprintf("INSERT INTO %sareasf (id_matric,id_curso,final,faltas,injustificadas,retraso,p1,p2,p3,p4) ".
                "VALUES %s", $db, substr($cSQLInsert, 0, strlen($cSQLInsert) - 1));
            DB::statement($query);
        }
    }

    private function activeCourse($courseId, $db){
        return Courses::getActiveCourse($courseId, $db);
    }

    /**
     * Aplicar redondeo final de año
     * 1. Primero verifica que el estudiante reprueba (nota <= hasta)
     * 2. Luego verifica que la nota está en el rango de gracia (nota >= nota_redondeo)
     * 3. Finalmente verifica que la nota es menor al valor de redondeo final
     * Si cumple todas las condiciones, redondea al valor de nota_final_redondeo
     *
     * @param float $final Nota final del estudiante
     * @param object $gSettings Configuración general del grado
     * @param array $select Resultado de la consulta de desempeños (contiene el valor 'hasta')
     * @return float Nota final (redondeada si cumple las condiciones)
     */
    private function applyYearEndRounding(float $final, object $gSettings, array $select): float
    {
        if ($gSettings->nota_redondeo > 0 && $gSettings->aplicar_redondeo_fin_año > 0 &&
            $gSettings->nota_final_redondeo > 0) {
            if (count($select) > 0) {
                if ($final <= $select[0]->hasta && $final >= $gSettings->nota_redondeo &&
                    $final < $gSettings->nota_final_redondeo) {
                    return $gSettings->nota_final_redondeo;
                }
            }
        }
        return $final;
    }
}
