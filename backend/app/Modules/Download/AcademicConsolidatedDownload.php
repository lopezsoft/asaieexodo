<?php

namespace App\Modules\Download;

use App\Common\HttpResponseMessages;
use App\Common\MessageExceptionResponse;
use App\Modules\School\SchoolQueries;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;

class AcademicConsolidatedDownload
{
    public static function getAcademicConsolidated(Request $request): JsonResponse
    {
        try {
            $xtype          = $request->input('pTypeReport');
            if ($xtype == 1) {
                return self::getForSubjects($request);
            } elseif ($xtype == 2) {
                return self::getForAreas($request);
            } else {
                throw new Exception('No se encontró el tipo de reporte solicitado.', 404);
            }
        }catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function getForSubjects(Request $request): JsonResponse
    {
        try {
            $school         = SchoolQueries::getSchoolRequest($request);
            $date	        = date('Y-m-d h-m-s');
            $fileXls	    = storage_path('app/public/templates/CONSOLIDADO ASIGNATURAS.xlsx');
            $db             = $school->db;
            $sede           = $request->input('pdbIdSede');
            $jorn           = $request->input('pdbIdJorn');
            $c_gdo          = $request->input('pdbCodGrado');
            $gpo            = $request->input('pdbGrupo');
            $per            = $request->input('pdbPeriodo');
            $xtype          = 1;
            $year           = $school->year;
            $courses = CallExecute("{$db}sp_select_consolidado_asig(?,?,?,?,?,?,?)", [
                $sede, $jorn, $c_gdo, "{$gpo}", $year, $per, $xtype
            ]);
            if (count($courses) == 0) {
                throw new Exception('No se encontraron datos para el consolidado de asignaturas.', 404);
            }

            $query_ar = CallExecute("{$db}sp_select_matcurso(?, ?)", [$c_gdo, $year]);
            if (count($query_ar) == 0) {
                throw new Exception('No se encontraron datos para el consolidado de asignaturas.', 404);
            }

            $ie	    = DB::table($db.'school')->first();
            // Construir rutas de directorios y archivos

            $aws_main_path  = env('AWS_MAIN_PATH', 'test');

            $fileExport = "CONSOLIDADO ASIGNATURAS CURSO {$c_gdo}-{$gpo}-JORN {$jorn}-SEDE {$sede}-{$date}.xlsx";

            $reader         = new Xlsx();
            $spreadsheet    = $reader->load($fileXls);
            // Ejecutar procedimientos almacenados
            $spreadsheet->setActiveSheetIndex(0);
            $properties = $spreadsheet->getProperties();
            $properties->setCreator("LOPEZSOFT S.A.S")
                ->setLastModifiedBy("LOPEZSOFT S.A.S")
                ->setTitle("Plantilla de consolidado por asignaturas")
                ->setSubject("Plantilla de consolidado")
                ->setDescription("Plantilla con el consolidado de las notas académicas de los estudiantes.")
                ->setCategory("ASAIE ÉXODO -  SISTEMA ACADÉMICO Y ADMINISTRATIVO");

            $hasHeaderColumns = true;
            $lisCol = 'DEFGHIJKLMNOPQRSTUVWXYZ';
            $oldMatric = 0;
            $countTotal = 6;
            $posCell = 7;
            $reCountCell = 6;

            foreach ($courses as $field) {
                // Encabezado del informe
                if ($hasHeaderColumns) {
                    $spreadsheet->getActiveSheet()->setCellValue('C1', "{$ie->school_name}");
                    $spreadsheet->getActiveSheet()->setCellValue('E3', $field->sede);
                    $spreadsheet->getActiveSheet()->setCellValue('E4', $field->grado);
                    $spreadsheet->getActiveSheet()->setCellValue('L4', $field->id_group);
                    $spreadsheet->getActiveSheet()->setCellValue('N4', $field->jornada);
                    $spreadsheet->getActiveSheet()->setCellValue('S4', $field->year);

                    $count = 0;
                    for ($i = 0; $i < 23; $i++) {
                        $count++;
                        $ar = "ar{$count}";
                        $cellVal = "";
                        $cellValP = "0.00%";

                        foreach ($query_ar as $field_ar) {
                            if ($field_ar->id_asig == $field->$ar) {
                                $cellVal = $field_ar->abrev;
                                $cellValP = "{$field_ar->porciento}%";
                                break;
                            }
                        }

                        $celCol = substr($lisCol, $i, 1) . "5";
                        $spreadsheet->getActiveSheet()->setCellValue($celCol, $cellVal);
                        $celCol = substr($lisCol, $i, 1) . "6";
                        $spreadsheet->getActiveSheet()->setCellValue($celCol, $cellValP);
                    }
                    $hasHeaderColumns = false;
                }

                // Cuerpo del informe
                $countTotal++;
                $id_matric = $field->id_matric;

                if ($oldMatric == 0) {
                    $oldMatric = $id_matric;
                    $count = 0;
                    $spreadsheet->getActiveSheet()->setCellValue('B' . $countTotal, $field->estudiante);
                    $spreadsheet->getActiveSheet()->setCellValue('C' . $countTotal, "P-{$field->periodo}");
                    $spreadsheet->getActiveSheet()->setCellValue('AA' . $countTotal, $field->prom);
                    $spreadsheet->getActiveSheet()->setCellValue('AB' . $countTotal, $field->t);

                    for ($i = 0; $i < 20; $i++) {
                        $count++;
                        $ar = "nar{$count}";
                        $cellVal = $field->$ar;
                        $celCol = substr($lisCol, $i, 1) . $countTotal;
                        $spreadsheet->getActiveSheet()->setCellValue($celCol, $cellVal);
                    }
                } elseif ($id_matric != $oldMatric) {
                    $oldMatric = $id_matric;
                    $posCell += $reCountCell;
                    $countTotal = $posCell;
                    $count = 0;
                    $spreadsheet->getActiveSheet()->setCellValue('B' . $posCell, $field->estudiante);
                    $spreadsheet->getActiveSheet()->setCellValue('C' . $countTotal, "P-{$field->periodo}");
                    $spreadsheet->getActiveSheet()->setCellValue('AA' . $countTotal, $field->prom);
                    $spreadsheet->getActiveSheet()->setCellValue('AB' . $countTotal, $field->t);

                    for ($i = 0; $i < 20; $i++) {
                        $count++;
                        $ar = "nar{$count}";
                        $cellVal = $field->$ar;
                        $celCol = substr($lisCol, $i, 1) . $countTotal;
                        $spreadsheet->getActiveSheet()->setCellValue($celCol, $cellVal);
                    }
                } else {
                    $count = 0;
                    $spreadsheet->getActiveSheet()->setCellValue('C' . $countTotal, "P-{$field->periodo}");
                    $spreadsheet->getActiveSheet()->setCellValue('AA' . $countTotal, $field->prom);
                    $spreadsheet->getActiveSheet()->setCellValue('AB' . $countTotal, $field->t);

                    for ($i = 0; $i < 20; $i++) {
                        $count++;
                        $ar = "nar{$count}";
                        $cellVal = $field->$ar;
                        $celCol = substr($lisCol, $i, 1) . $countTotal;
                        $spreadsheet->getActiveSheet()->setCellValue($celCol, $cellVal);
                    }
                }
            }

            // Guardar el archivo Excel
            $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
            $writer->save("storage/{$fileExport}");

            $content        = Storage::disk('public')->get($fileExport);
            Storage::disk('public')->delete($fileExport);
            $filePath	    = "{$aws_main_path}/schools/{$school->path}/excel/{$fileExport}";
            Storage::put($filePath, $content, 'public');
            return HttpResponseMessages::getResponse([
                'pathFile'		=> Storage::url($filePath)
            ]);
        }catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }

    public static function getForAreas(Request $request): JsonResponse
    {
        try {
            $school         = SchoolQueries::getSchoolRequest($request);
            $date	        = date('Y-m-d h-m-s');
            $fileXls	    = storage_path('app/public/templates/CONSOLIDADO AREAS.xlsx');
            $db             = $school->db;
            $sede           = $request->input('pdbIdSede');
            $jorn           = $request->input('pdbIdJorn');
            $c_gdo          = $request->input('pdbCodGrado');
            $gpo            = $request->input('pdbGrupo');
            $per            = $request->input('pdbPeriodo');
            $xtype          = 2;
            $year           = $school->year;
            $courses = CallExecute("{$db}sp_select_consolidado_asig(?,?,?,?,?,?,?)", [
                $sede, $jorn, $c_gdo, "{$gpo}", $year, $per, $xtype
            ]);
            if (count($courses) == 0) {
                throw new Exception('No se encontraron datos para el consolidado de asignaturas.', 404);
            }
            $query_ar = DB::select("SELECT t.id AS cod_area, RTRIM(t.area) AS area, t.abrev FROM {$db}areas t WHERE t.estado = 1");
            if (count($query_ar) == 0) {
                throw new Exception('No se encontraron datos para el consolidado de asignaturas.', 404);
            }

            $ie	    = DB::table($db.'school')->first();
            $aws_main_path  = env('AWS_MAIN_PATH', 'test');

            $fileExport = "CONSOLIDADO AREAS CURSO {$c_gdo}-{$gpo}-JORN {$jorn}-SEDE {$sede}-{$date}.xlsx";
            // Configurar el informe
            $reader         = new Xlsx();
            $spreadsheet    = $reader->load($fileXls);
            $spreadsheet->setActiveSheetIndex(0);

            $properties = $spreadsheet->getProperties();
            $properties->setCreator("LOPEZSOFT S.A.S")
                ->setLastModifiedBy("LOPEZSOFT S.A.S")
                ->setTitle("Plantilla de consolidado por áreas")
                ->setSubject("Plantilla de consolidado")
                ->setDescription("Plantilla con el consolidado de las notas académicas de los estudiantes.")
                ->setCategory("ASAIE ÉXODO -  SISTEMA ACADÉMICO Y ADMINISTRATIVO");

            $hasHeaderColumns = true;
            $lisCol = 'DEFGHIJKLMNOPQRSTUVW';
            $oldMatric = 0;
            $countTotal = 5;
            $posCell = 6;
            $reCountCell = 6;

            foreach ($courses as $field) {
                // Encabezado del informe
                if ($hasHeaderColumns) {
                    $spreadsheet->getActiveSheet()->setCellValue('C1', $ie->school_name);
                    $spreadsheet->getActiveSheet()->setCellValue('E3', $field->sede);
                    $spreadsheet->getActiveSheet()->setCellValue('E4', $field->grado);
                    $spreadsheet->getActiveSheet()->setCellValue('L4', $field->id_group);
                    $spreadsheet->getActiveSheet()->setCellValue('N4', $field->jornada);
                    $spreadsheet->getActiveSheet()->setCellValue('S4', $field->year);

                    $count = 0;
                    for ($i = 0; $i < 20; $i++) {
                        $count++;
                        $ar = "ar{$count}";
                        $cellVal = "";

                        foreach ($query_ar as $field_ar) {
                            if ($field_ar->cod_area == $field->$ar) {
                                $cellVal = $field_ar->abrev;
                                break;
                            }
                        }

                        $celCol = substr($lisCol, $i, 1) . "5";
                        $spreadsheet->getActiveSheet()->setCellValue($celCol, $cellVal);
                    }
                    $hasHeaderColumns = false;
                }

                // Cuerpo del informe
                $countTotal++;
                $id_matric = $field->id_matric;

                if ($oldMatric == 0) {
                    $oldMatric = $id_matric;
                    $count = 0;
                    $spreadsheet->getActiveSheet()->setCellValue('B' . $countTotal, $field->estudiante);
                    $spreadsheet->getActiveSheet()->setCellValue('C' . $countTotal, "P-{$field->periodo}");
                    $spreadsheet->getActiveSheet()->setCellValue('X' . $countTotal, $field->prom);
                    $spreadsheet->getActiveSheet()->setCellValue('Y' . $countTotal, $field->t);

                    for ($i = 0; $i < 20; $i++) {
                        $count++;
                        $ar = "nar{$count}";
                        $cellVal = $field->$ar;
                        $celCol = substr($lisCol, $i, 1) . $countTotal;
                        $spreadsheet->getActiveSheet()->setCellValue($celCol, $cellVal);
                    }
                } elseif ($id_matric != $oldMatric) {
                    $oldMatric = $id_matric;
                    $posCell += $reCountCell;
                    $countTotal = $posCell;
                    $count = 0;
                    $spreadsheet->getActiveSheet()->setCellValue('B' . $posCell, $field->estudiante);
                    $spreadsheet->getActiveSheet()->setCellValue('C' . $countTotal, "P-{$field->periodo}");
                    $spreadsheet->getActiveSheet()->setCellValue('X' . $countTotal, $field->prom);
                    $spreadsheet->getActiveSheet()->setCellValue('Y' . $countTotal, $field->t);

                    for ($i = 0; $i < 20; $i++) {
                        $count++;
                        $ar = "nar{$count}";
                        $cellVal = $field->$ar;
                        $celCol = substr($lisCol, $i, 1) . $countTotal;
                        $spreadsheet->getActiveSheet()->setCellValue($celCol, $cellVal);
                    }
                } else {
                    $count = 0;
                    $spreadsheet->getActiveSheet()->setCellValue('C' . $countTotal, "P-{$field->periodo}");
                    $spreadsheet->getActiveSheet()->setCellValue('X' . $countTotal, $field->prom);
                    $spreadsheet->getActiveSheet()->setCellValue('Y' . $countTotal, $field->t);

                    for ($i = 0; $i < 20; $i++) {
                        $count++;
                        $ar = "nar{$count}";
                        $cellVal = $field->$ar;
                        $celCol = substr($lisCol, $i, 1) . $countTotal;
                        $spreadsheet->getActiveSheet()->setCellValue($celCol, $cellVal);
                    }
                }
            }

            // Guardar el archivo Excel
            $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
            $writer->save("storage/{$fileExport}");

            $content        = Storage::disk('public')->get($fileExport);
            Storage::disk('public')->delete($fileExport);
            $filePath	    = "{$aws_main_path}/schools/{$school->path}/excel/{$fileExport}";
            Storage::put($filePath, $content, 'public');
            return HttpResponseMessages::getResponse([
                'pathFile'		=> Storage::url($filePath)
            ]);
        } catch (Exception $e) {
            return MessageExceptionResponse::response($e);
        }
    }
}
