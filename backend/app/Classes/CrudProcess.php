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


}
