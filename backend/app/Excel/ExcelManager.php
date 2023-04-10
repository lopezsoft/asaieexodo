<?php

namespace App\Excel;

use App\Exports\ExportFormCollection;
use App\Models\School\FileManager;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;
class ExcelManager
{
    /**
     * @throws \Exception
     */
    public static function storeToS3(mixed $data, string $fileDescription, $school, $user): \Illuminate\Http\JsonResponse
    {
        try {
            $aws_main_path  = env('AWS_MAIN_PATH', 'test');
            $fileName       = Str::random(40).'_'.date('Y').".xlsx";
            $filePath       = "{$aws_main_path}/schools/{$school->path}/exports/{$user->id}/{$fileName}";
            Excel::store(new ExportFormCollection($data), $filePath, 's3',  null, [
                'visibility' => 'public',
            ]);
            $output         = Storage::url($filePath);
            $format         = 'xlsx';
            $mimeType       = Storage::mimeType($filePath);
            $sizeFile       = Storage::size($filePath);
            $lastModified   = Storage::lastModified($filePath);
            FileManager::create([
                'school_id'         =>  $school->school->id,
                'user_id'           =>  $user->id,
                'file_name'         =>  $fileName,
                'file_description'  =>  $fileDescription,
                'file_path'         =>  $output,
                'extension_file'    =>  $format,
                'mime_type'         =>  $mimeType,
                'size_file'         =>  $sizeFile,
                'last_modified'     =>  date('Y-m-d H:i:s', $lastModified),
                'state'             =>  1,
            ]);
            return response()->json([
                'success'   => true,
                'pathFile'  => $output,
            ], 200);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }
}
