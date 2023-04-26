<?php

namespace App\Modules\Recovery;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Support\Facades\DB;

class FinalRecovery{
    use MessagesTrait;

     //DIGITAR NOTA
     public static function writeNote($request){
        try {
            $school = SchoolQueries::getSchoolRequest($request);
           $db = $school->db;
           $limit  = $request->input('limit') ?? 15;
           $year = $request->input('year');
           $teacher = $request->input('pdbDocente');

           $query = "sp_select_respeciales_docente";


        // $id_doc	= $doc > 0 ? $doc : $this->get_parent();
		// $param	= $this->get_year().",".$id_doc.",1";
		// $query	= "sp_select_respeciales_docente";

		// $request = $this->get_call($query,$param);

		// return $request;


       return self::getResponse(['records' => $query ,'success' => true]);
       }catch (\Exception $e){
           return self::getResponse500([
               "error" => $e->getMessage()
           ]);
       }


    }



}


