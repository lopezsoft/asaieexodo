<?php

namespace App\Modules\Upload;

use App\Models\School\FileManager;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadFiles
{
    use MessagesTrait;
    public static function delete(Request $request, string $path, String $disk = "s3"): \Illuminate\Http\JsonResponse
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
                    'file_name'         => pathinfo($url, PATHINFO_FILENAME),
                    'file_description'  => pathinfo($url, PATHINFO_FILENAME),
                    'extension_file'    => $extension,
                    'type'              => self::extensionToType($extension),
                    'mime_type'		    => Storage::disk($disk)->mimeType($file),
                    'file_path'         => $url,
                    'path'              => $file,
                    'last_modified'     => date("m-d-Y H:i:s", Storage::disk($disk)->lastModified($file)),
                    'size_file'		    => round((Storage::disk($disk)->size($file)/1024)/1024,3)
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

    /**
     * @throws \Exception
     */
    public static function upload(Request $request, string $path, object $school, string $disk = "s3"): object|null
    {
        try {
            $user       = $request->user();
            $file       = $request->file('foto') ?? $request->file('avatar');
            $fileSize   = $file->getSize();
            if ($fileSize > 2048000) {
               return self::getResponse400([
                   'error'			=> 'No puede subir archivos mayores a 2 MB'
               ]);
            }
            $fileDescription= $file->getClientOriginalName();
            $fileName       = date('Y')."_".$file->hashName();
            $aws_main_path  = env('AWS_MAIN_PATH', 'test');
            $filePath	    = "{$aws_main_path}/schools/{$school->path}/{$path}";
            Storage::disk($disk)->putFileAs($filePath, $file, "{$fileName}", 'public');


            $filePath       = "{$filePath}/{$fileName}";
            $format         = $file->extension();
            $mimeType       = $file->getMimeType();
            $sizeFile       = $file->getSize();
            $output         = Storage::disk($disk)->url($filePath);
            $lastModified   = Storage::disk($disk)->lastModified($filePath);
            $fileManager = FileManager::create([
                'school_id'         =>  $school->school->id,
                'user_id'           =>  $user->id,
                'file_name'         =>  $fileName,
                'file_description'  =>  $fileDescription,
                'file_path'         =>  $filePath,
                'url'               =>  $output,
                'extension_file'    =>  $format,
                'mime_type'         =>  $mimeType,
                'size_file'         =>  $sizeFile,
                'last_modified'     =>  date('Y-m-d H:i:s', $lastModified),
                'state'             =>  1,
            ]);

            return (object)compact('fileManager');
        }catch(\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public static function extensionToType(string $extension): int
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
