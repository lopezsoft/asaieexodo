<?php

namespace App\Modules\Download;

use App\Modules\Academic\ControlClosingDates;
use App\Modules\Courses\RatingScale;
use App\Modules\Courses\RatingScaleBuild;
use App\Modules\School\SchoolQueries;
use App\Modules\Settings\ColumnNotes;
use App\Modules\Settings\Competencies;
use App\Modules\Teacher\CoursesOfTeacher;
use App\Modules\Upload\UploadFiles;
use App\Queries\CallExecute;
use App\Queries\TablesQuery;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;

class TeacherDownloads
{
    use MessagesTrait;

    public static function setTemplateNotesByCourse(Request $request): JsonResponse
    {
        try {
            $school             = SchoolQueries::getSchoolRequest($request);
            $db                 = $school->db;
            $grado	            = $request->input('pdbGrado');
            $per	            = $request->input('pdbPeriodo');
            $curso	            = $request->input('pdbCurso');
            ControlClosingDates::isCurrentYear($school->year);
            ControlClosingDates::validatePeriodDate($school, $grado, $per);
            //
            $teacherId          = CoursesOfTeacher::getTeacherId($db);
            $path               = "excel/upload/teachers/{$teacherId}";
            $fileManager        = UploadFiles::upload($request, $path, $school,'public');
            $fileManager        = $fileManager->fileManager;
            $filePatch          = Storage::disk('public')->path($fileManager->file_path);
            //
            $reader             = new Xlsx();
            $spreadsheet        = $reader->load($filePatch);
            $spreadsheet->setActiveSheetIndex(0);
            $worksheet  = $spreadsheet->getActiveSheet();
            $schoolCode	= $worksheet->getCell('C1')->getValue();
            $periodo	= $worksheet->getCell('G5')->getValue();
            $id_docente	= $worksheet->getCell('C6')->getValue();
            $year		= $worksheet->getCell('G8')->getValue();
            $id_curso	= $worksheet->getCell('G10')->getValue();

            if(!(($curso == $id_curso) && ($per == $periodo) && ($teacherId == $id_docente)
                && ($schoolCode == $school->school->statecode))){
                return self::getResponse([
                    'estado'  => 0,
                ]);
            }
            $query_comp    = Competencies::getCompetenciesByGroupGrades($school, $grado);
            DB::beginTransaction();
            $table	= $db.TablesQuery::getTableNotes($grado);
			$count	= 3;
            $spreadsheet->setActiveSheetIndex(1);
            $worksheet  = $spreadsheet->getActiveSheet();
            // Importando las notas
            for($i = 0; $i < 61 ; $i++){
                $count ++;
                $id_matric = $worksheet->getCell('B'.$count)->getValue() ?? 0;
                if ($id_matric > 0){
                    $queryCourse = DB::Table($table)
                        ->select('id')
                        ->where('id_curso', $curso)
                        ->where('id_matric', $id_matric)
                        ->where('periodo', $periodo)
                        ->where('year', $year)
                        ->first();
                    $cel_count	= 8;
                    $sqlSet		= '';
                    if ($queryCourse){
                        foreach ($query_comp as $field)
                        {
                            $query	= self::getCompetencesQuery($db);
                            $query	= DB::select($query,[$year,$field->id_pk,$grado]);
                            foreach($query as $value){
                                $cel_count ++;
                                switch($value->tipo){
                                    case 'PORC':
                                    case 'PROM':
                                        $beforeCol	= getRowSheet($cel_count);
                                        $val	    = $worksheet->getCell($beforeCol.$count)->getOldCalculatedValue();
                                        break;
                                    default:
                                        $beforeCol	= getRowSheet($cel_count);
                                        $val	    = $worksheet->getCell($beforeCol.$count)->getValue();
                                        break;
                                }
                                $val	= $val ?? 0;
                                $sqlSet	= $sqlSet."{$value->name_column}='{$val}',";
                            }
                        }
                        $final	    = $worksheet->getCell('AN'.$count)->getOldCalculatedValue();
                        $final		= $final ?? 0;
                        $scaleId    = RatingScale::getRatingScaleId($school, $grado, $final);
                        $sqlSet		= $sqlSet."final='{$final}',id_escala='{$scaleId}'";
                        $sqlUp	    = "UPDATE {$table} SET {$sqlSet} WHERE id = ? ";
                        DB::statement($sqlUp, [$queryCourse->id]);
                    }else{
                        $sqlCol		= '';
                        foreach ($query_comp as $field)
                        {
                            $query	= self::getCompetencesQuery($db);
                            $query	= DB::select($query,[$year,$field->id_pk,$grado]);
                            foreach($query as $value){
                                $cel_count ++;
                                $sqlCol	    = $sqlCol.$value->name_column.",";
                                switch($value->tipo){
                                    case 'PORC':
                                    case 'PROM':
                                        $beforeCol	= getRowSheet($cel_count);
                                        $val	    = $worksheet->getCell($beforeCol.$count)->getOldCalculatedValue();
                                        break;
                                    default:
                                        $beforeCol	= getRowSheet($cel_count);
                                        $val	    = $worksheet->getCell($beforeCol.$count)->getValue();
                                        break;
                                }
                                $val	= $val ?? 0;
                                $sqlSet	= $sqlSet."'".$val."',";
                            }
                        }
                        $final	    = $worksheet->getCell('AN'.$count)->getOldCalculatedValue() ?? 0;
                        $scaleId    = RatingScale::getRatingScaleId($school, $grado, $final);
                        $sqlCol		= $sqlCol."final,id_matric,year,id_curso,periodo,id_escala";
                        $sqlSet		= $sqlSet."'".$final."','".$id_matric."','".$year."','".$curso."','".$periodo."','".$scaleId."'";
                        $sqlUp		= 'INSERT IGNORE INTO '.$table.'('.$sqlCol.' VALUES ('.$sqlSet.')';
                        DB::statement($sqlUp);
                    }
                }
            }
            DB::commit();
            return self::getResponse([
                'estado'  => 1,
            ]);
        }catch (Exception $e) {
            DB::rollBack();
            return self::getResponse500([
                "error" => $e->getMessage()
            ]);
        }
    }
    public static function getTemplateNotesByCourse(Request $request): jsonResponse
    {
        try {
            $school             = SchoolQueries::getSchoolRequest($request);
            $db                 = $school->db;
            $year               = $school->year;
            $grado	            = $request->input('pdbGrado');
            $per	            = $request->input('pdbPeriodo');
            $curso	            = $request->input('pdbCurso');
            $teacherId          = CoursesOfTeacher::getTeacherId($db);
            ControlClosingDates::isCurrentYear($school->year);
            ControlClosingDates::validatePeriodDate($school, $grado, $per);
            /**
             * Trae los datos del curso a exportar
             */
            $query_cur 	= CallExecute::execute("{$db}sp_carga_curso(?, ?)", [$curso, $year])[0];
            /** Nombre de la tabla de notas */
            $table	    = TablesQuery::getTableNotes($grado);
            /** Columnas configuradas en la plantilla de notas */
            $fields	    = ColumnNotes::getCall($grado, $school);
            /** Nota minima y máxima para controlar los cambios en la plantilla excel */
            $query_min  = RatingScaleBuild::query($school->db, $school->year)
                            ->selectRaw("min(td.desde) desde, max(td.hasta) hasta");
            $query_min  = RatingScaleBuild::addGrade($query_min, $grado)->get()[0];
            /** Escala de desempeños */
            $query_escala   = RatingScale::getGroupByGrades($school, $grado);
            /** Escala de competencias */
            $query_comp = Competencies::getCompetenciesByGroupGrades($school, $grado);
            /** Listado de los estudiantes */
            $query_est = DB::table("{$db}{$table}",'tn')
                ->selectRaw("tn.id_matric, {$fields}, CONCAT(RTRIM(te.apellido1),' ',RTRIM(te.apellido2),' ',RTRIM(te.nombre1),' ',RTRIM(te.nombre2)) as estudiante")
                ->join($db.'cursos AS tc', function ($join) {
                    $join->on('tn.id_curso', '=', 'tc.id');
                    $join->on('tn.year', '=', 'tc.year');
                })
                ->join($db.'student_enrollment AS tm', function ($join) {
                    $join->on('tn.id_matric', '=', 'tm.id');
                    $join->on('tm.id_grade', '=', 'tc.id_grado');
                    $join->on('tm.year', '=', 'tc.year');
                    $join->on('tm.id_study_day', '=', 'tc.id_jorn');
                    $join->on('tm.id_group', '=', 'tc.grupo');
                    $join->on('tm.id_headquarters', '=', 'tc.id_sede');
                })
                ->join($db.'inscripciones AS te', 'tm.id_student', '=', 'te.id')
                ->where('tc.id', $curso)
                ->where('tn.periodo', $per)
                ->where('tm.id_state', 2)
                ->orderBy('estudiante')
                ->get();

            $fileXls	    = storage_path('app/public/templates/plantilla notas.xlsx');
            $reader         = new Xlsx();
            $spreadsheet    = $reader->load($fileXls);
            $spreadsheet->setActiveSheetIndex(0);
            $spreadsheet->getProperties()
                ->setCreator("LOPEZSOFT S.A.S")
                ->setLastModifiedBy("LOPEZSOFT S.A.S")
                ->setTitle("Plantilla de calificaciones")
                ->setSubject("Plantilla de calificaciones sin internet")
                ->setDescription("Plantilla para el registro de notas de los docentes.")
                ->setCategory("ASAIE ÉXODO - SISTEMA ACADÉMICO Y ADMINISTRATIVO");

            $worksheet = $spreadsheet->getActiveSheet();
            $fileName  = strtoupper(utf8_decode(normalizes($query_cur->asignatura.' '.$query_cur->grado.
                    ' '.$query_cur->grupo.' periodo'.$per." ".$query_cur->jornada.
                    " ".$query_cur->docente." ".$query_cur->sede))).".xlsx";
            // Header
            $worksheet->setCellValue('D1',$query_cur->NOMBRE_IE);
            $worksheet->setCellValue('C1',$school->school->statecode);
            $worksheet->setCellValue('G2',$query_cur->area);
            $worksheet->setCellValue('G3',$query_cur->asignatura);
            $worksheet->setCellValue('C3',$query_cur->id_asig);
            $worksheet->setCellValue('G4',$query_cur->grado);
            $worksheet->setCellValue('C4',$query_cur->cod_grado);
            $worksheet->setCellValue('G5',$per);
            $worksheet->setCellValue('G6',$query_cur->docente);
            $worksheet->setCellValue('C6',$query_cur->id_docente);
            $worksheet->setCellValue('G8',$year);
            $worksheet->setCellValue('K8',$query_cur->jornada);
            $worksheet->setCellValue('C8',$query_cur->id_jorn);
            $worksheet->setCellValue('G9',$query_cur->sede);
            $worksheet->setCellValue('G10',$curso);
            $worksheet->setCellValue('C9',$query_cur->id_sede);
            $worksheet->setCellValue('O4',$query_cur->grupo);
            //  Activa la página 2 donde se digitaran las notas
            $spreadsheet->setActiveSheetIndex(1);
            $worksheet = $spreadsheet->getActiveSheet();
            // Escala de desempeños
            $count	= 2;
            foreach ($query_escala as $field)
            {
                $count	++;
                $worksheet->setCellValue('AQ'.$count,$field->nombre_escala);
                $worksheet->setCellValue('AT'.$count,$field->desde);
                $worksheet->setCellValue('AU'.$count,$field->hasta);
                $worksheet->setCellValue('AV'.$count,$field->abrev);
                $worksheet->setCellValue('AP'.$count,$field->id);
            }
            //Data Validation
            $objValidation	= $worksheet->getCell('J4')->getDataValidation();
            $objValidation->setType( DataValidation::TYPE_DECIMAL );
            $objValidation->setErrorStyle( DataValidation::STYLE_STOP );
            $objValidation->setAllowBlank(true);
            $objValidation->setShowInputMessage(true);
            $objValidation->setShowErrorMessage(true);
            $objValidation->setErrorTitle('FUERA DE RANGO');
            $objValidation->setError('El valor ingresado está fuera del rango de la escala INSTITUCIONAL!');
            $desde  = $query_min->desde;
            $hasta  = $query_min->hasta;
            $objValidation->setFormula1($desde);
            $objValidation->setFormula2($hasta);

            // Carga listado de estudiantes
            $count	= 3;
            foreach ($query_est as $fields)
            {
                $count	++;
                $worksheet->setCellValue('B'.$count,$fields->id_matric);
                $worksheet->setCellValue('D'.$count,$fields->estudiante);
                $cel_count	= 8;
                foreach ($query_comp as $field)
                {
                    $query	= self::getCompetencesQuery($db);
                    $query	= DB::select($query,[$year,$field->id_pk,$grado]);
                    foreach($query as $value){
                        $cel_count ++;
                        switch($value->tipo){
                            case 'PORC':
                            case 'PROM':
                                break;
                            default:
                                $beforeCol	= getRowSheet($cel_count);
                                $fieldList  = (array)$fields;
                                $val	    = $fieldList[$value->name_column] ?? 0;
                                if ($val > 0){
                                    $cel	= $beforeCol.$count;
                                    $worksheet->setCellValue($cel,$val);
                                }
                                break;
                        }
                    }
                }
            }
            // Carga listado de competencias
            $count	= 8;
            foreach ($query_comp as $field)
            {
                $query	= self::getCompetencesQuery($db);
                $query	= DB::select($query,[$year,$field->id_pk,$grado]);

                $initCol= getRowSheet($count+1);
                foreach($query as $value){
                    $count	++;
                    $finalCol	= getRowSheet($count);
                    $beforeCol	= getRowSheet($count);
                   $worksheet->getColumnDimension($beforeCol)->setVisible(TRUE);
                    switch($value->tipo){
                        case 'PROM':
                            $merge	= $initCol.'2:'.$finalCol.'2';
                           $worksheet->setCellValue($beforeCol.'3','NP');
                           $worksheet->mergeCells($merge);
                            cellColor($worksheet, $initCol.'2','D8D8D8');
                            cellColor($worksheet, $beforeCol.'3','D8D8D8');
                           $worksheet->setCellValue($initCol.'2',$value->competencia);
                           $worksheet->getComment($beforeCol.'3')->setHeight(20);
                           $worksheet->getComment($beforeCol.'3')->setWidth(170);
                           $worksheet->getComment($beforeCol.'3')->getText()
                                ->createTextRun('NOTA PROMEDIO');
                            cellLocked($worksheet,$beforeCol.'4:'.$beforeCol.'64');
                            $cel_count	= 3;
                            for($i = 0; $i < 61 ; $i++){
                                $cel_count ++;
                                $prom	= '=AVERAGE('.$initCol.$cel_count.':'.
                                    getRowSheet($count-1).$cel_count.')';
                               $worksheet->setCellValue($beforeCol.$cel_count,$prom);
                                cellColor($worksheet, $beforeCol.$cel_count,'D8D8D8');
                            }
                            break;
                        case 'PORC':
                           $worksheet->setCellValue($beforeCol.'3','%');
                           $courseList  = (array)$query_cur;
                           $val	        = $courseList['proc'.$field->id] > 0 ? $courseList['proc'.$field->id] : $field->porcentaje;
                           $val	        = number_format($val,0,',', '.');
                           $worksheet->setCellValue($beforeCol.'2',$val.'%');
                           cellColor($worksheet, $beforeCol.'2','F7BE81');
                           cellColor($worksheet, $beforeCol.'3','F7BE81');
                           $worksheet->getComment($beforeCol.'3')->setHeight(20);
                           $worksheet->getComment($beforeCol.'3')->setWidth(170);
                           $worksheet->getComment($beforeCol.'3')->getText()
                                ->createTextRun('NOTA PORCENTUAL');
                            cellLocked($worksheet,$beforeCol.'4:'.$beforeCol.'64');
                            $cel_count	= 3;
                            for($i = 0; $i < 61 ; $i++){
                                $cel_count ++;
                                cellColor($worksheet, $beforeCol.$cel_count,'F7BE81');
                                $prom	= '=('.getRowSheet($count-1).$cel_count.'*$'.$beforeCol.'$2'.')';
                               $worksheet->setCellValue($beforeCol.$cel_count,$prom);
                                $val =$worksheet->getCell('AN'.$cel_count).'+'.$beforeCol.$cel_count;
                               $worksheet->setCellValue('AN'.$cel_count,$val);
                            }
                            break;
                        default:
                           $worksheet->setCellValue($beforeCol.'3',$value->row_num);
                            cellColor($worksheet, $beforeCol.'3','F2F2F2');
                            $cel_count	= 3;
                            for($i = 0; $i < 61 ; $i++){
                                $cel_count ++;
                                if($value->row_num == 1){
                                    $val	=$worksheet->getCell($beforeCol.$cel_count)->getValue();
                                    $val	= $val ? $val : 0;
                                   $worksheet->setCellValue($beforeCol.$cel_count,$val);

                                }
                               $worksheet->setDataValidation($beforeCol.$count,$objValidation);
                            }
                            break;
                    }
                }
            }

            // Comentarios en columnas
            $spreadsheet->getActiveSheet()->getComment('G3')->getText()->createTextRun('Justificadas');
            $spreadsheet->getActiveSheet()->getComment('G3')->setHeight(20);
            $spreadsheet->getActiveSheet()->getComment('H3')->getText()->createTextRun('Injustificadas');
            $spreadsheet->getActiveSheet()->getComment('H3')->setHeight(20);
            $spreadsheet->getActiveSheet()->getComment('I3')->getText()
                ->createTextRun('Retraso, llegada tarde a clase');
            $spreadsheet->getActiveSheet()->getComment('I3')->setHeight(20);
            $spreadsheet->getActiveSheet()->getComment('I3')->setWidth(220);
            $spreadsheet->getActiveSheet()->getComment('AN2')->getText()
                ->createTextRun('NOTA FINAL');
            $spreadsheet->getActiveSheet()->getComment('AN2')->setHeight(20);
            $spreadsheet->getActiveSheet()->getComment('AN2')->setWidth(120);

            $spreadsheet->getActiveSheet()->getComment('AQ2')->getText()
                ->createTextRun('ESCALA NACIONAL');
            $spreadsheet->getActiveSheet()->getComment('AQ2')->setHeight(20);
            $spreadsheet->getActiveSheet()->getComment('AQ2')->setWidth(150);

            //Protección de la hoja de cálculo
            $spreadsheet->setActiveSheetIndex(0);
            $spreadsheet->getActiveSheet()->getProtection()->setPassword('1');
            $spreadsheet->getActiveSheet()->getProtection()->setSheet(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setDeleteColumns(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setDeleteRows(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setInsertColumns(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setInsertRows(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setInsertHyperlinks(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setFormatCells(FALSE);
            $spreadsheet->getActiveSheet()->getProtection()->setFormatColumns(FALSE);
            $spreadsheet->getActiveSheet()->getProtection()->setFormatRows(FALSE);
            $spreadsheet->getActiveSheet()->getProtection()->setObjects(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setSort(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setScenarios(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setSelectLockedCells(FALSE);
            $spreadsheet->getActiveSheet()->getProtection()->setSelectUnlockedCells(FALSE);
            $spreadsheet->setActiveSheetIndex(1);
            $spreadsheet->getActiveSheet()->getProtection()->setPassword('1');
            $spreadsheet->getActiveSheet()->getProtection()->setSheet(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setDeleteColumns(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setDeleteRows(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setInsertColumns(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setInsertRows(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setInsertHyperlinks(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setFormatCells(FALSE);
            $spreadsheet->getActiveSheet()->getProtection()->setFormatColumns(FALSE);
            $spreadsheet->getActiveSheet()->getProtection()->setFormatRows(FALSE);
            $spreadsheet->getActiveSheet()->getProtection()->setObjects(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setSort(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setScenarios(TRUE);
            $spreadsheet->getActiveSheet()->getProtection()->setSelectLockedCells(FALSE);
            $spreadsheet->getActiveSheet()->getProtection()->setSelectUnlockedCells(FALSE);

            //Guardamos el archivo en formato Excel 2007
            $aws_main_path  = env('AWS_MAIN_PATH', 'test');
            $pathFolder     = "{$aws_main_path}/schools/{$school->path}/excel/download/teachers/{$teacherId}";
            Storage::disk('public')->makeDirectory($pathFolder);
            $fileExport	    = "{$pathFolder}/{$fileName}";
            $writer         = IOFactory::createWriter($spreadsheet, 'Xlsx');
            $writer->save("storage/{$fileExport}");

            return self::getResponse([
                'pathFile'		=> Storage::disk('public')->url($fileExport)
            ]);
        }catch (Exception $e){
            return self::getResponse500([
                'message'   => $e->getMessage(),
            ]);
        }
    }

    public static function getCompetencesQuery($db): string
    {
        return "SELECT t.id_competencia, t.numero_column, CONCAT('n',t.numero_column) name_column,
                    t.tipo, tc.competencia,
                    ROW_NUMBER() OVER (PARTITION BY tipo ORDER BY t.id_competencia, t.tipo, t.numero_column) AS row_num
                    FROM {$db}columnas_notas_competencias t
                    LEFT JOIN {$db}competencias AS tc ON t.id_competencia = tc.id_pk
                    LEFT JOIN {$db}grados_agrupados AS t1 ON tc.id_grado_agrupado = t1.id
                    LEFT JOIN {$db}aux_grados_agrupados AS t2 ON t2.id_grado_agrupado = t1.id
                    WHERE tc.`year` = ? AND tc.id_pk = ? AND t2.id_grado = ?
                    ORDER BY t.id_competencia, t.tipo, t.numero_column;";
    }
}
