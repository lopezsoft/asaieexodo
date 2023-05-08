<?php

namespace App\Queries;

use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InsertTable
{
    use MessagesTrait;
    public static function insert(Request $request, $fields, string $tb): \Illuminate\Http\JsonResponse
    {
        try {
            $ip         = $request->ip();
            $primaryKey = 'id';
            DB::beginTransaction();
            $fieldsTb   = ShowColumns::getColumns($tb); // Listado de las columnas de la tabla
            $data       = [];
            foreach ($fields as $key => $value) {
                foreach ($fieldsTb as $field) {
                    if($field->Key === "PRI"){
                        $primaryKey = $field->Field;
                    }
                    if($field->Field == $key && $key !== $primaryKey ){
                        if($field->Type == 'date'){
                            $data[$key] = date('Y-m-d', strtotime(str_replace('/','-',$value)));
                        }else{
                            $data[$key] = $value;
                        }
                        break;
                    }
                }
            }
            $result = DB::table($tb)->insertGetId($data);

            AuditTable::audit($ip,$tb,'INSERT',$data);
            DB::commit();
            $data = DB::table($tb)
                ->where($primaryKey, $result)
                ->first();

            return self::getResponse(['record' => $data]);
        } catch (\Exception $e) {
            DB::rollback();
            $tb  = strtoupper($tb);
            return self::getResponse500([
                "error"     => "Error al crear el registro en la tabla $tb. Es posible que esté duplicado o tenga un error.",
                "payload"   => $e->getMessage()
            ]);
        }
    }
}
