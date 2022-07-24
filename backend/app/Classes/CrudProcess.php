<?php

namespace App\Classes;

use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class CrudProcess
{
    use MessagesTrait;
    public static string $primaryKey  = "id";

    /**
     * Inserta los datos en la tabla especificada.
     */
    static function insert(Request $request, array $data, string $table): \Illuminate\Http\JsonResponse
    {
        try {
            DB::beginTransaction();
            $ip       = $request->ip();
            $id       = DB::table($table)->insertGetId($data);

            self::audit($ip, $table, 'INSERT', $data);
            DB::commit();
            $data[self::$primaryKey] = $id;

            $result =  self::getResponse201($data, 1);
        } catch (Exception $e) {
            DB::rollback();
            $result = self::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }

        return  $result;
    }

    /**
     * Retorna los datos de un select a una tabla
     *
    */

    public static function getTable(Request $request, String $table = null, $where = [], $order = [], $primaryKey = 'id'): \Illuminate\Http\JsonResponse
    {
        try {

            $query = $request->input('query') ?? '';
            $start = $request->input('start') ?? 0;
            $limit = $request->input('limit') ?? 30;

            if (strlen($query) > 0) {
                $fiels      = self::getColumns($table);
                $queryField = '';
                foreach ($fiels as $field) {
                    if ($field->Field <> $primaryKey) {
                        $table  = DB::table($table)
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
                    $total  = DB::table($table)
                                ->where($queryField, 'like', '%'. $query .'%')
                                ->count();
                    $table  = DB::table($table)->orderBy($primaryKey, 'DESC')
                                ->where($queryField, 'like', '%'. $query .'%')
                                ->offset($start)
                                ->limit($limit)
                                ->get();
                }else {
                    $total  = 0;
                    $table  = [];
                }
            }else {
                $total  = DB::table($table);
                $table  = DB::table($table);

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
            return self::getResponse([
                'total' => $total,
                'records' => $table,
            ]);
        } catch (Exception $e) {
            return self::getResponse500([
                'message'   => $e->getMessage()
            ]);
        }
    }

    /**
     * Inserta los datos en la tabla especificada.
     */
    static function update(Request $request, $data = null, string $table): \Illuminate\Http\JsonResponse
    {
        if ($data && $table) {
            try {
                DB::beginTransaction();
                $ip    = $request->ip();
                if (is_array($data)) { // Si es mas de un registro
                    foreach ($data as $value) {
                        $result = DB::table($table)
                            ->where(self::$primaryKey, $value[self::$primaryKey])
                            ->limit(1)
                            ->update($data);

                        self::audit($ip, $table, 'UPDATE', $data);
                    }
                } else {
                    $upData    = [];
                    foreach ($data as $key => $value) {
                        $upData[$key]    = $value;
                    }
                    $result = DB::table($table)
                        ->where(self::$primaryKey, $upData[self::$primaryKey])
                        ->limit(1)
                        ->update($upData);
                    self::audit($ip, $table, 'UPDATE', $upData);

                    $result = $upData;
                }
                DB::commit();
                $result = self::getResponse([
                    'data' => $result,
                ]);
            } catch (Exception $e) {
                DB::rollback();
                $result = self::getResponse500([
                    'message'   => $e->getMessage()
                ]);
            }

            return  $result;
        } else {
            return self::Response400();
        }
    }

    static function updateTable(Request $request, $fields = null, string $tb = null)
    {
        if ($fields) {
            $ip     = $request->ip();
            $data   = [];
            try {
                DB::beginTransaction();
                $fieldstb   = self::getColumns($tb); // Listado de las columnas de la tabla
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
                            if ($key == self::$primaryKey) {
                                $pKey = $val;
                            }
                        }
                        $result = DB::table($tb)
                                ->where(self::$primaryKey, $pKey)
                                ->limit(1)
                                ->update($data);

                        self::audit($ip,$tb,'UPDATE',$data);
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
                        if ($key == self::$primaryKey) {
                            $pKey = $value;
                        }
                    };
                    $result = DB::table($tb)
                        ->where(self::$primaryKey, $pKey)
                        ->limit(1)
                        ->update($data);
                    self::audit($ip,$tb,'UPDATE',$data);
                }
                DB::commit();
                $result = self::getResponse([
                    'records'   => $result
                ]);
            } catch (Exception $e) {
                DB::rollback();
                $result = self::getResponse500([
                    'message'   => 'Error la guardar los cambios',
                    'payload'   => $e->getMessage()
                ]);
            }
            return  $result;
        }
    }

    /**
     * Borra los cambios en la tabla pasada como parametro
     *
     * @$table: Nombre de la tabla
     */
    static function delete(Request $request, $fields = [], string $table)
    {
        if ($fields) {
            try {
                $ip    = $request->ip();
                DB::beginTransaction();
                foreach ($fields as $key => $value) {
                    $data[$key] = $value;
                }

                $delete  = DB::table($table)
                                ->where($data)
                                ->get();

                $result = DB::table($table)
                    ->where($data)
                    ->delete();

                self::audit($ip,$table,'DELETE',$delete);

                DB::commit();
                $result = self::getResponse([
                        'data' => $result
                    ]
                );
            } catch (Exception $e) {
                DB::rollback();
                $result = self::getResponse500([
                    'message'   => $e->getMessage()
                ]);
            }
            return  $result;
        }else {
            self::getResponse500();
        }
    }


    public static function audit($ip, $table, $what_did, $data): void
    {
        // User
        $user = auth()->user();
        $audit  = [
            'user_id'   => $user->id,
            'ip'        => $ip,
            'table'     => $table,
            'what_did'  => $what_did,
            'data'      => json_encode($data)
        ];
        DB::table('tb_audit')->insert($audit);
    }

    public static function getColumns($table = '')
    {
        if (strlen($table) >0 ) {
            $select = DB::select('SHOW COLUMNS FROM '.$table);
        }else {
            $select = null;
        }

        return $select;
    }
}
