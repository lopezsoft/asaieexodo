<?php

namespace App\Modules\Upload;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadFiles
{
    use MessagesTrait;
    public static function delete(Request $request, $path, String $disk = "s3"): \Illuminate\Http\JsonResponse
    {
        try {
            Storage::disk($disk)->delete($request->pathFile ?? $path);
            return self::getResponse();
        }catch (\Exception $e) {
            return self::getResponse500([
                'error'      => $e->getMessage()
            ]);
        }
    }

    public static function read(Request $request,String $path, String $disk = "s3"): \Illuminate\Http\JsonResponse
    {
        try {
            $school         = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
            $aws_main_path  = env('AWS_MAIN_PATH', 'test');
            $filePath	    = "{$aws_main_path}/schools/{$school->folder_name}/{$path}";
            $files          = Storage::disk($disk)->allFiles($filePath);
            $documents      = [];
            foreach ($files as $file) {
                $url            = Storage::disk($disk)->url($file);
                $extension      = pathinfo($url, PATHINFO_EXTENSION);
                $documents[] = [
                    'name'          => pathinfo($url, PATHINFO_FILENAME),
                    'format'        => $extension,
                    'type'          => self::extensionToType($extension),
                    'mime'			=> Storage::disk($disk)->mimeType($file),
                    'url'           => $url,
                    'pathFile'      => $file,
                    'lastModified'  => date("m-d-Y H:i:s", Storage::disk($disk)->lastModified($file)),
                    'size'			=> round((Storage::disk($disk)->size($file)/1024)/1024,3)
                ];
            }
            return self::getResponse([
                "records" => [
                    'data' =>  $documents
                ]
            ]);
        }catch(\Exception $e) {
            return self::getResponse500([
                'error'      => $e->getMessage()
            ]);
        }
    }

    public static function upload(Request $request, $path, String $disk = "s3"): \Illuminate\Http\JsonResponse
    {
        $file       = $request->file('foto') ?? $request->file('avatar');
        $fileSize   = $file->getSize();
        if ($fileSize > 2048000) {
           return self::getResponse400([
               'error'			=> 'No puede subir archivos mayores a 2 MB'
           ]);
        }
        try {
            $school         = SchoolQueries::getSchool($request->input('schoolId') ?? 0);
            $fileName       = $file->getClientOriginalName();
            $date	        = date('Y-m-d h-m-s');
            $aws_main_path  = env('AWS_MAIN_PATH', 'test');
            $filePath	    = "{$aws_main_path}/schools/{$school->folder_name}/{$path}";
            Storage::disk($disk)->putFileAs($filePath, $file, "{$date}-{$fileName}", 'public');
            return self::getResponse([
                'pathFile'  => Storage::disk($disk)->url("{$filePath}/{$date}-{$fileName}"),
                'format'	=> $file->extension(),
            ]);
        }catch(\Exception $e) {
            return self::getResponse500([
                'error'      => $e->getMessage()
            ]);
        }
    }

    public static function extensionToType($extension): int
    {
        $ext	= strtoupper($extension);
        return match ($ext) {
            "GIF", "BMP", "JPG", "JPEG", "PNG" => 1,
            "DOC", "DOCX", "XLSX", "ZIP", "XLS", "PPT", "PPTX", "RAR", "7Z", "RTF", "PDF" => 2,
            "ACC", "WAV", "OGA" => 3,
            "MPEG", "OGV", "AVI" => 4,
            default => 0,
        };
    }
}
