<?php

namespace App\Core;

use App\Models\Company;
use App\User;
use Exception;
use Illuminate\Http\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Traits\MessagesTrait;
use PhpParser\Node\Stmt\TryCatch;

class MasterModel
{

	use MessagesTrait;

    function totalDecimals(string $amount, $add = 0) {
        $result = 0;
        if(strlen($amount) > 0) {
            $value = substr($amount, strpos($amount, ".") + 1);
            for ($i=0; $i < strlen($value); $i++) {
                $n  = substr($value,$i,1);
                if(intval($n) > 0){
                    $result += 1;
                }
            }
            if($result == 0) {
                $result = $add;
            }
        }else {
            $result	= 2;
        }
        return $result;
    }

    /**
     * Re
     */
    public $primaryKey  = "id";
    public $queryField  = "";
    public $queryString = "";

    public function audit($user_id, $ip, $tb, $what_did, $data)
    {
        // User
        $user = auth()->user();
        $audit  = [
            'user_id'   => $user->id,
            'ip'        => $ip,
            'table'     => $tb,
            'what_did'  => $what_did,
            'data'      => json_encode($data)
        ];
        DB::table('tb_audit')->insert($audit);
    }

    public function uploadFileData($data,$path){
        $fileSize    = file_put_contents($path, $data);
		if ($fileSize > 0) {
            $name   = basename($path);
            $format = pathinfo($path, PATHINFO_EXTENSION);
			$request = array(
                'success'       => TRUE,
                'name'          => $name,
                'format'        => $format,
				'size'			=> round((($fileSize/1024)/1024),3)
			);
        }else{
            $request = array(
                'success'       =>FALSE
			);
        }
        return json_encode($request);
    }


    /**
     * Borra los cambios en la tabla pasada como parametro
     *
     * @$tb
     */
    public function deleteData($fields = null, string $tb = null, $ip, $user_id = 0)
    {
        if ($fields) {
            try {
                DB::beginTransaction();
                foreach ($fields as $key => $value) {
                    $data[$key] = $value;
                }

                $delete  = DB::table($tb)
                                ->where($data)
                                ->get();

                $result = DB::table($tb)
                    ->where($data)
                    ->delete();

                $this->audit($user_id,$ip,$tb,'DELETE',$delete);

                DB::commit();
                $result = $this->getResponseSucces($result);
            } catch (\Throwable $th) {
                DB::rollback();
                $result = $this->getErrorResponse('Error al tratar de eliminar el registro');
                throw $th;
            }
            return  $result;
        }
    }

    /**
     * Inserta los cambios en la tabla pasada como parametro
     *
     * @$tb
     */
    public function insertData($fields = null, string $tb = null, $ip, $user_id = 0)
    {
        if ($fields) {
            try {
                DB::beginTransaction();
                $fieldstb   = $this->getColumns($tb); // Listado de las columnas de la tabla
                $data       = [];
                foreach ($fields as $key => $value) {
                    if ($key !== $this->primaryKey) {
                        foreach ($fieldstb as $field) {
                            if($field->Field == $key ){
                                if($field->Type == 'date'){
                                    $data[$key] = date('Y-m-d', strtotime(str_replace('/','-',$value)));
                                }else{
                                    $data[$key] = $value;
                                }
                                break;
                            }
                        }
                    }
                }
                $result = DB::table($tb)
                    ->insertGetId($data);

                $this->audit($user_id,$ip,$tb,'INSERT',$data);
                DB::commit();
                $data = DB::table($tb)
                    ->where($this->primaryKey, $result)
                    ->first();

                $result =  $this->getReponseJson($data, 1);
            } catch (Exception $e) {
                DB::rollback();
                $result = $this->getErrorResponse('Error en la base de datos: '. $e->getMessage());
            }

            return  $result;
        }
    }

    /**
     * Guarda los cambios en la tabla pasada como parametro
     *
     * @$tb
     */
    public function updateData($fields = null, string $tb = null, $ip, $user_id = 0)
    {
        if ($fields) {
            try {
                DB::beginTransaction();
                $fieldstb   = $this->getColumns($tb); // Listado de las columnas de la tabla
                if (is_array($fields)) {
                    foreach ($fields as $value) {
                        foreach ($value as $key => $val) {
                            foreach ($fieldstb as $field) {
                                if($field->Field == $key ){
                                    if($field->Type == 'date'){
                                        $data[$key] = date('Y-m-d', strtotime(str_replace('/','-',$val)));
                                    }else{
                                        $data[$key] = $val;
                                    }
                                    break;
                                }
                            }
                            if ($key == $this->primaryKey) {
                                $pKey = $val;
                            }
                        }
                        $result = DB::table($tb)
                                ->where($this->primaryKey, $pKey)
                                ->limit(1)
                                ->update($data);

                        $this->audit($user_id,$ip,$tb,'UPDATE',$data);
                    }
                }else{
                    foreach ($fields as $key => $value) {
                        foreach ($fieldstb as $field) {
                            if($field->Field == $key ){
                                if($field->Type == 'date'){
                                    $data[$key] = date('Y-m-d', strtotime(str_replace('/','-',$value)));
                                }else{
                                    $data[$key] = $value;
                                }
                                break;
                            }
                        }
                        if ($key == $this->primaryKey) {
                            $pKey = $value;
                        }
                    };
                    $result = DB::table($tb)
                        ->where($this->primaryKey, $pKey)
                        ->limit(1)
                        ->update($data);
                    $this->audit($user_id,$ip,$tb,'UPDATE',$data);
                }
                DB::commit();
                $result = $this->getResponseSucces($result);
            } catch (\Throwable $th) {
                DB::rollback();
                $result = $this->getErrorResponse('Error en la base de datos');
                throw $th;
            }
            return  $result;
        }
    }

    /**
     * Retorna los datos de un query
     *
    */

    public function sqlQuery(string $sqlStatement, string $sqlStatementCount, array $searchFields , $query = '', $start = 0, $limit = 30, $where = '', $order = '')
    {
        if(strlen($order) > 0){
            $order  = ' ORDER BY '.$order;
        }
        if (strlen($query) > 0) {
            $queryField = '';
            // $w      = (strlen($where) > 0) ? " WHERE ".$where." AND " : " WHERE " ;
            $w      = (strlen($where) > 0) ? " AND ".$where." " : "" ;
            foreach ($searchFields as $field) {
                $table  = DB::select($sqlStatement." WHERE ".$field." LIKE ? {$w} LIMIT 1", ["%".$query."%"]);
                if (count($table) >0 ) {
                    $queryField   = $field;
                    break;
                }
            }

            if(strlen($queryField) > 0){
                $total  = DB::select($sqlStatementCount." WHERE ".$queryField." LIKE ? {$w}", ["%".$query."%"]);
                $table  = DB::select($sqlStatement." WHERE ".$queryField." LIKE ? {$w} {$order} LIMIT ?, ?", ["%".$query."%", $start, $limit]);
                $result = $this->getReponseJson($table, $total[0]->total);
            }else {
                $table      = null;
                $result = $this->getReponseJson($table, 0);
            }
        }else {
            $w      = (strlen($where) > 0) ? " WHERE ".$where : "" ;
            $total  = DB::select($sqlStatementCount.$w);
            $table  = DB::select($sqlStatement.$w.$order." LIMIT ?, ?", [$start, $limit]);
            $result = $this->getReponseJson($table, $total[0]->total);
        }
        return $result;
    }


    /**
     * Retorna los datos de un select a una tabla
     *
    */

    public function getTable(String $tb = null, $query = '', $start = 0, $limit = 30, $where = [], $order = [], $primaryKey = 'id')
    {
        try {
            if (strlen($query) > 0) {
                $fiels      = $this->getColumns($tb);
                $queryField = '';
                foreach ($fiels as $field) {
                    if ($field->Field <> $primaryKey) {
                        $table  = DB::table($tb)
                                ->where($field->Field,'like', '%'. $query .'%')
                                ->limit(1)
                                ->get();
                        if ($table->count() > 0 ) {
                            $queryField   = $field->Field;
                            break;
                        }
                    }
                }

                if(strlen($queryField) > 0){
                    $total  = DB::table($tb)
                                ->where($queryField, 'like', '%'. $query .'%')
                                ->count();

                    $table  = DB::table($tb)->orderBy($primaryKey, 'DESC')
                                ->where($queryField, 'like', '%'. $query .'%');

                    if($limit > 0){
                        $table->offset($start)->limit($limit);
                    }

                    $table  = $table->get();

                }else {
                    $total  = 0;
                    $table  = [];
                }
            }else {
                $total  = DB::table($tb);
                $table  = DB::table($tb);

                if(count($where) > 0){
                    $total->where($where);
                    $table->where($where);
                }

                if(count($order) > 0){
                    foreach ($order as $key => $value) {
                        $table->orderBy($key, $value);
                    }
                }

                if($limit > 0){
                    $table->offset($start)->limit($limit);
                }

                $total  = $total->count();
                $table  = $table->get();
            }
            return $this->getReponseJson($table, $total);
        } catch (Exception $e) {
            return $this->getErrorResponse($e->getMessage());
        }
    }

    /**
     * Retorna la respuesta Json de la API
     */
    public function getResponseSucces($lis = null)
    {
        return json_encode(array(
            'success' => true,
            'data' => $lis,
        ));
    }

    public function getErrorResponse($msg  = '')
    {
        return response()->json([
            'success' => false,
            'message' => $msg,
            'payload' => "Error en el servidor",
        ],500);
    }


    /**
     * Retorna la respuesta Json de la API
     */

    public function getReponseJson($lis = array(), $total = 0){
        return response()->json([
            'success' => true,
            'records' => isset($lis) ? $lis : [],
            'total' => $total,
        ]);
    }

    public function getReponseMessage($msg = ''){
        return response()->json([
            'message'   => $msg,
            'success'   => true
        ]);
    }

    public function getColumns($table = '')
    {
        if (strlen($table) >0 ) {
            $select = DB::select('SHOW COLUMNS FROM '.$table);
        }else {
            $select = null;
        }

        return $select;
    }

}
