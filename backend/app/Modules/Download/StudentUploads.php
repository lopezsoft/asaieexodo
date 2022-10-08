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
            $spreadsheet= $reader->load(storage_path("app/public/{$path}"));
            $spreadsheet->setActiveSheetIndex(3);

            $numRows	= $spreadsheet->setActiveSheetIndex(3)->getHighestRow();


            $spreadsheet->setActiveSheetIndex(1);
            return self::getResponse([
                'pathFile'  => Storage::disk('public')->url($pathFile)
            ]);
        }catch(Exception $e) {
            return self::getResponse500(['error' => $e->getMessage()]);
        }
    }

}
