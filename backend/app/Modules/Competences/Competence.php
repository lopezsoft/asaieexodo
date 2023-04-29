<?php

namespace App\Modules\Competences;
use App\Modules\School\SchoolQueries;
use Illuminate\Support\Facades\DB;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
class Competence
{
    use  MessagesTrait;
    public static function getCompetences($request){
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db	        = $school->db;
            $year = $request->input('year');
            $id_grade = $request->input('id_grade');
            $query1 = DB::table("{$db}competencias AS t1")
            ->select('t1.id_pk', 't1.id', 't1.competencia', 't1.porcentaje', 't1.year')
            ->leftJoin("{$db}grados_agrupados AS t2", 't1.id_grado_agrupado', '=', 't2.id')
            ->leftJoin("{$db}aux_grados_agrupados AS t3", 't3.id_grado_agrupado', '=', 't2.id')
            ->where('t1.year', '=', $year)
            ->where('t3.id_grado', '=', $id_grade)
            ->where('t1.calificable', '=', 1)
            ->where('t1.id', '>', 0)
            ->orderBy('t1.id')
            ->get();
            $query2 = DB::table("{$db}desempeños AS t1")
            ->select('t1.id', 't1.id_escala', 't1.desde', 't1.hasta', 't1.reprueba', 't4.color', 't4.nombre_escala', 't4.mensaje', 't4.abrev')
            ->leftJoin("{$db}grados_agrupados AS t2", 't1.id_grado_agrupado', '=', 't2.id')
            ->leftJoin("{$db}aux_grados_agrupados AS t3", 't3.id_grado_agrupado', '=', 't2.id')
            ->leftJoin("{$db}escala_nacional AS t4", 't1.id_escala', '=', 't4.id')
            ->where('t1.year', '=', $year)
            ->where('t3.id_grado', '=', $id_grade)
            ->orderBy('t1.id')
            ->get();
            $query3 = DB::table("{$db}columnas_notas_competencias as t1")
            ->select(DB::raw("t1.*, CONCAT('n',numero_column) as name_column"))
            ->leftJoin("{$db}competencias as tc", 't1.id_competencia', '=', 'tc.id_pk')
            ->leftJoin("{$db}grados_agrupados as t2", 'tc.id_grado_agrupado', '=', 't2.id')
            ->leftJoin("{$db}aux_grados_agrupados as t3", 't3.id_grado_agrupado', '=', 't2.id')
            ->where('tc.year', $year)
            ->where('t3.id_grado', $id_grade)
            ->orderBy('t1.id_competencia')
            ->orderBy('t1.tipo')
            ->orderBy('t1.numero_column')
            ->get();
            $query4 = DB::table("{$db}config001 AS tc")
            ->select("tc.*")
            ->leftJoin("{$db}grados_agrupados AS t2", "tc.id_grupo_grados", "=", "t2.id")
            ->leftJoin("{$db}aux_grados_agrupados AS t3", "t3.id_grado_agrupado", "=", "t2.id")
            ->where("tc.year", "=", $year)
            ->where("t3.id_grado", "=", $id_grade)
            ->get();
            if ($query1 AND $query2 AND $query3 AND $query4) {
                $request = array(
                    'success'       	=>TRUE,
                    'records_comp'		=> $query1->toArray(),
                    'records_des'		=> $query2->toArray(),
                    'records_colum'		=> $query3->toArray(),
                    'records_config' 	=> $query4->toArray()
                );
                $request = json_encode($request);
            }else{
                $request = "error";
            }
        }catch (\Exception $e){
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
     }}

