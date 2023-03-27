<?php

namespace App\Modules\Upload;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Exception;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class StudentUploads
{
    use MessagesTrait;
    public static function setTemplateEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        $school             = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db                 = "{$school->database_name}.";
        $date	            = date('Y-m-d');
        try {
            $file       = $request->file('foto');
            $path       = "/schools/{$school->folder_name}/uploads/{$date}";
            $pathFile   = Storage::disk('public')->putFile($path, $file);

            $reader     = new Xlsx();
            $spreadsheet= $reader->load(storage_path("app/public/{$pathFile}"));
            $spreadsheet->setActiveSheetIndex(3);

            $numRows	= $spreadsheet->setActiveSheetIndex(3)->getHighestRow();

            if($numRows <= 2) {
                return self::getResponse400(['message' => 'El número de filas del documento es incorrecto.']);
            }

            $objWorksheet = $spreadsheet->getActiveSheet();
            DB::beginTransaction();
            for ($i=3; $i <= $numRows; $i++) {
                // Inscripción
                $zona		= $objWorksheet->getCell('A'.$i)->getValue();
                $tipo_doc	= $objWorksheet->getCell('B'.$i)->getValue();
                $sexo		= $objWorksheet->getCell('C'.$i)->getValue();
                $pais		= $objWorksheet->getCell('D'.$i)->getValue();
                $documento	= $objWorksheet->getCell('E'.$i)->getValue();
                $ciud_naci	= $objWorksheet->getCell('F'.$i)->getValue();
                $ciud_resi	= $objWorksheet->getCell('G'.$i)->getValue();
                $ciud_exp	= $objWorksheet->getCell('H'.$i)->getValue();
                $apellido1	= $objWorksheet->getCell('I'.$i)->getValue();
                $apellido2	= $objWorksheet->getCell('J'.$i)->getValue();
                $nombre1	= $objWorksheet->getCell('K'.$i)->getValue();
                $nombre2	= $objWorksheet->getCell('L'.$i)->getValue();
                $tipo_sangr	= $objWorksheet->getCell('M'.$i)->getValue();
                $objWorksheet->getStyle('N'.$i)->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_DATE_YYYYMMDD2);
                $fec_naci	= $objWorksheet->getCell('N'.$i)->getFormattedValue();
                $edad		= $objWorksheet->getCell('O'.$i)->getValue();
                $estrato	= $objWorksheet->getCell('P'.$i)->getValue();
                $direccion	= $objWorksheet->getCell('Q'.$i)->getValue();
                $localidad	= $objWorksheet->getCell('R'.$i)->getValue();
                $telefono	= $objWorksheet->getCell('S'.$i)->getValue();
                $movil		= $objWorksheet->getCell('T'.$i)->getValue();
                $ips		= $objWorksheet->getCell('U'.$i)->getValue();
                $email		= $objWorksheet->getCell('V'.$i)->getValue();

                $data	= [
                    'id_zona'			=> ($zona) 			?? 1,
                    'id_documento'		=> ($tipo_doc) 		?? 99,
                    'id_sexo'			=> ($sexo) 			?? 0,
                    'id_country'		=> ($pais) 			?? 45,
                    'nro_documento'		=> ($documento) 	?? rand(5,10),
                    'lug_nacimiento'	=> ($ciud_naci) 	?? 1128,
                    'lug_residencia'	=> ($ciud_resi) 	?? 1128,
                    'lug_expedicion'	=> ($ciud_exp) 		?? 1128,
                    'apellido1'			=> ($apellido1) 	?? '',
                    'apellido2'			=> ($apellido2) 	?? '',
                    'nombre1'			=> ($nombre1) 		?? '',
                    'nombre2'			=> ($nombre2) 		?? '',
                    'tipo_sangre'		=> ($tipo_sangr) 	?? 'O+',
                    'fecha_nacimiento'	=> ($fec_naci) 		?? date('Y-m-d'),
                    'edad'				=> ($edad) 			?? 0,
                    'estrato'			=> ($estrato) 		?? 1,
                    'direccion'			=> ($direccion) 	?? '',
                    'localidad'			=> ($localidad) 	?? '',
                    'telefono'			=> ($telefono) 		?? '',
                    'movil'				=> ($movil) 		?? '',
                    'ips'				=> ($ips) 			?? '',
                    'email'				=> ($email) 		?? null
                ];

                $table      = "inscripciones";

                $student    = DB::table($db.$table)
                                ->where('nro_documento', $documento)
                                ->first();
                if($student){
                    DB::table($db.$table)->where('id', $student->id)->update($data);
                    $studentId  = $student->id;
                }else{
                    $studentId  = DB::table($db.$table)->insertGetId($data);
                }

                // Matricula
                $sede		= $objWorksheet->getCell('W'.$i)->getValue();
                $jornada	= $objWorksheet->getCell('X'.$i)->getValue();
                $grado		= $objWorksheet->getCell('Y'.$i)->getValue();
                $grupo		= $objWorksheet->getCell('Z'.$i)->getValue();
                $year		= $objWorksheet->getCell('AC'.$i)->getValue();

                if($sede > 0 && $jornada > 0  && $grado > 0  && strlen($grupo) > 0 && $year > 0 ){
                    $ins_origen	= $objWorksheet->getCell('AA'.$i)->getValue() ? $objWorksheet->getCell('AA'.$i)->getValue() : 'No aplica';
                    $dir_origen	= $objWorksheet->getCell('AB'.$i)->getValue() ? $objWorksheet->getCell('AB'.$i)->getValue() : 'No aplica';
                    $objWorksheet->getStyle('AD'.$i)->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_DATE_YYYYMMDD2);
                    $fecha		= $objWorksheet->getCell('AD'.$i)->getFormattedValue();
                    $query	= sprintf("INSERT IGNORE INTO %sstudent_enrollment
                                    (id_headquarters, id_study_day, id_student, id_grade, id_state,id_group, inst_address, inst_origin, `date`, `year`)
                                        VALUES (%s,%s,%s,%s,2,'%s','%s','%s','%s',%s)", $db, $sede, $jornada, $studentId, $grado, $grupo, $dir_origen, $ins_origen, $fecha, $year);
                    DB::select($query);
                }

            }
            DB::commit();
            return self::getResponse([
                'pathFile'      => Storage::disk('public')->url($pathFile),
            ]);
        }catch(Exception $e) {
            DB::rollback();
            return self::getResponse500(['error' => $e->getMessage()]);
        }
    }

}
