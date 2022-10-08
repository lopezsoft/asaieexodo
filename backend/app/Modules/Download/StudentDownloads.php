<?php

namespace App\Modules\Download;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Exception;
use PhpOffice\PhpSpreadsheet\IOFactory;
use \PhpOffice\PhpSpreadsheet\Reader\Xlsx;

class StudentDownloads
{
    use MessagesTrait;

    public  static function getTemplateEnrollment(Request $request): \Illuminate\Http\JsonResponse
    {
        $date	            = date('Y-m-d h-m-s');
        $fileXls	        = storage_path('app/public/templates/plantilla matriculas ASAIE.xlsx');
        $school             = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
        $db                 = "{$school->database_name}.";

        $ie	    = DB::table($db.'school')->first();
        $head	= DB::table($db.'sedes')->get();

        try {
            $reader         = new Xlsx();
            $spreadsheet    = $reader->load($fileXls);
            $spreadsheet->setActiveSheetIndex(1);
            $spreadsheet->getProperties()
                    ->setCreator("LOPEZSOFT S.A.S")
                    ->setLastModifiedBy("LOPEZSOFT S.A.S")
                    ->setTitle("Plantilla Inscripciones y matriculas")
                    ->setSubject("Plantilla Inscripciones y matriculas")
                    ->setDescription("Hoja de excel para realizar la importación de Inscripciones y matriculas.")
                    ->setCategory("ASAIE ÉXODO - SISTEMA ACADÉMICO Y ADMINISTRATIVO");

            $worksheet = $spreadsheet->getActiveSheet();

            $worksheet->setCellValue('A1',$ie->school_name);
            $count	= 3;
            foreach($head as $field){
                $count ++;
                $worksheet->setCellValue('A'.$count,$field->id);
                $worksheet->setCellValue('B'.$count,$field->headquarters_name);
            }
            //Guardamos el archivo en formato Excel 2007
            $aws_main_path  = env('AWS_MAIN_PATH', 'test');
            $fileExport	    = "{$ie->school_name}-Plantilla Inscripciones y matriculas ASAIE {$date}.xlsx";
            $writer         = IOFactory::createWriter($spreadsheet, 'Xlsx');
            $writer->save("storage/{$fileExport}");

            $content        = Storage::disk('public')->get($fileExport);
            Storage::disk('public')->delete($fileExport);
            $filePath	    = "{$aws_main_path}/schools/{$school->folder_name}/Plantilla Inscripciones y matriculas ASAIE {$date}.xlsx";
            Storage::put($filePath, $content, 'public');
            return self::getResponse([
                'pathFile'		=> Storage::url($filePath)
            ]);
        }catch(Exception $e) {
            return self::getResponse500(['error' => $e->getMessage()]);
        }

    }
}
