<?php

namespace App\Queries;

use App\Common\HttpResponseMessages;
use App\Services\TableValidationService; // Asegúrate de que esta clase exista o ajústala.
use App\Traits\MessagesTrait;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class InsertTable
{
    use MessagesTrait;

    public static function insert(Request $request, object|array $fields, string $tb, bool $canValidator = true): JsonResponse
    {
        try {
            // La validación puede permanecer como está por ahora.
            if(!is_array($fields) && $canValidator){
                $validator  = new TableValidationService();
                $validator  = $validator->generateValidator((array) $fields, $tb);
                if ($validator->fails()) {
                    return HttpResponseMessages::getResponse400([
                        'message' => $validator->errors()->first()
                    ]);
                }
            }

            // Iniciar transacción.
            DB::beginTransaction();

            // 1. Determinar si es una inserción masiva de forma más segura.
            $isBulkInsert = is_array($fields) && isset($fields[0]) && is_array($fields[0]);

            // 2. Obtener los datos y la clave primaria sin usar propiedades estáticas.
            $processedData = self::getTableData($fields, $tb, $isBulkInsert);
            $dataToInsert = $processedData['data'];
            $primaryKey = $processedData['primaryKey'];

            if ($isBulkInsert) {
                DB::table($tb)->insert($dataToInsert);
                // En una inserción masiva, no se devuelve un único ID, por lo que no podemos buscar el registro.
                $resultId = null;
            } else {
                $resultId = DB::table($tb)->insertGetId($dataToInsert);
            }

            // Asumiendo que tu clase AuditTable puede manejar un array de datos.
            AuditTable::audit($request->ip(), $tb, 'INSERT', $dataToInsert);
            DB::commit();

            // Solo buscar el registro si fue una inserción única.
            $newRecord = null;
            if ($resultId) {
                $newRecord = DB::table($tb)->where($primaryKey, $resultId)->first();
            }

            return self::getResponse(['record' => $newRecord]);

        } catch (Exception $e) {
            DB::rollback();
            $tb = strtoupper($tb);
            return self::getResponse500([
                "error" => "Error al crear el registro en la tabla {$tb}. {$e->getMessage()}",
                "payload" => $e->getMessage()
            ]);
        }
    }

    public static function getTableData(mixed $fields, string $tb, bool $isBulk = false): array
    {
        // 3. Obtener columnas de la tabla (con caché para eficiencia).
        $tableInfo = Cache::rememberForever("schema_{$tb}", function () use ($tb) {
            $columns = ShowColumns::getColumns($tb); // Asegúrate de que esta clase exista.
            $primaryKey = 'id';
            foreach ($columns as $column) {
                if ($column->Key === "PRI") {
                    $primaryKey = $column->Field;
                    break;
                }
            }
            return ['columns' => $columns, 'primaryKey' => $primaryKey];
        });

        $data = [];
        if ($isBulk) {
            foreach ($fields as $fieldList) {
                $data[] = self::filterAndFormatData($fieldList, $tableInfo['columns'], $tableInfo['primaryKey']);
            }
        } else {
            $data = self::filterAndFormatData($fields, $tableInfo['columns'], $tableInfo['primaryKey']);
        }

        return ['data' => $data, 'primaryKey' => $tableInfo['primaryKey']];
    }

    private static function filterAndFormatData(object|array $fields, array $tableColumns, string $primaryKey): array
    {
        $data = [];
        $fieldData = (array) $fields;

        // 4. Optimización del filtrado de columnas.
        $columnMap = collect($tableColumns)->keyBy('Field');

        foreach ($fieldData as $key => $value) {
            if ($key !== $primaryKey && $columnMap->has($key)) {
                $columnType = $columnMap->get($key)->Type;
                if (str_contains($columnType, 'date')) {
                    // 5. Usar Carbon para un manejo de fechas más robusto.
                    try {
                        // Ignorar valores vacíos o nulos para no intentar parsearlos.
                        if(!empty($value)) {
                            $data[$key] = Carbon::parse(str_replace('/', '-', $value))->toDateString();
                        }
                    } catch (Exception $ex) {
                        $data[$key] = null; // Asignar null si la fecha es inválida.
                    }
                } else {
                    $data[$key] = $value;
                }
            }
        }
        return $data;
    }
}
