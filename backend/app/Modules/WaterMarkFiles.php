<?php

namespace App\Modules;
use App\Models\WatermarkFile;
use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WaterMarkFiles
{
    use MessagesTrait;
    public static function index(Request $request): JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $watermarks = WaterMarkFile::query()
                ->where('school_id', $school->school->id)
                ->where('state', '<>', 2);
            return self::getResponse([
                'records' => $watermarks->paginate(10),
            ]);
        }catch (Exception $e) {
            return self::getResponse500([
                'message' => $e->getMessage(),
            ]);
        }
    }

    public static function update(Request $request, $id): JsonResponse
    {
        try {
            $school                     = SchoolQueries::getSchoolRequest($request);
            $watermarkFile              = WaterMarkFile::query()->find($id);
            $watermarkFile              = self::fileData($request, $watermarkFile, $school);
            $watermarkFile->settings    = self::getSettingsData($request);
            $watermarkFile->state       =  $request->state ?? 1;
            $watermarkFile->save();
            return self::getResponse([
                'message'   => 'Archivo actualizado correctamente',
                'record'    => $watermarkFile,
            ]);
        }catch (Exception $e) {
            return self::getResponse500([
                'message' => $e->getMessage(),
            ]);
        }
    }

    public static function create(Request $request): JsonResponse
    {
        try {
            $file       = $request->file('watermark_file') ?? null;
            if(!$file) {
                throw new Exception('No se ha enviado ningún archivo');
            }
            $school                     = SchoolQueries::getSchoolRequest($request);
            $watermarkFile              = new WatermarkFile();
            $watermarkFile              = self::fileData($request, $watermarkFile, $school);
            $watermarkFile->school_id   = $school->school->id;
            $watermarkFile->settings    = self::getSettingsData($request);
            $watermarkFile->state       =  $request->state ?? 1;
            $watermarkFile->save();
            return self::getResponse([
                'message'   => 'Archivo subido correctamente',
                'record'    => $watermarkFile,
            ]);
        }catch (Exception $e) {
            return self::getResponse500([
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @throws Exception
     */
    public static function fileData(Request $request, $watermarkFile, $school): WaterMarkFile
    {
        try {
            $file           = $request->file('watermark_file') ?? null;
            if($file){
                $fileSize       = $file->getSize();
                if ($fileSize > 2048000) {
                    throw new Exception('No puede subir archivos mayores a 2 MB');
                }
                $fileDescription= $file->getClientOriginalName();
                $fileName       = $file->hashName();
                $aws_main_path  = env('AWS_MAIN_PATH', 'test');
                $filePath	    = "{$aws_main_path}/schools/{$school->path}/watermarks";
                $cloud          = Storage::cloud();
                $cloud->putFileAs($filePath, $file, "{$fileName}", 'public');

                $filePath       = "{$filePath}/{$fileName}";
                $format         = $file->extension();
                $mimeType       = $file->getMimeType();
                $sizeFile       = $file->getSize();
                $output         = $cloud->url($filePath);
                $lastModified   = $cloud->lastModified($filePath);

                $watermarkFile->file_name         =  $fileName;
                $watermarkFile->file_description  =  $fileDescription;
                $watermarkFile->file_path         =  $filePath;
                $watermarkFile->url               =  $output;
                $watermarkFile->extension_file    =  $format;
                $watermarkFile->mime_type         =  $mimeType;
                $watermarkFile->size_file         =  $sizeFile;
                $watermarkFile->last_modified     =  date('Y-m-d H:i:s', $lastModified);
            }
            return $watermarkFile;
        }catch (Exception $e) {
           throw new Exception($e->getMessage());
        }
    }
    private static function getSettingsData(Request $request): array
    {
        return  [
            'paper_size'    => $request->paper_size ?? 'A4',
            'available_in'  => $request->available_in ?? 4,
            'hide_header'   => $request->hide_header ?? 1,
            'hide_footer'   => $request->hide_footer ?? 1,
            'margin_top'    => $request->margin_top ?? '5cm',
            'margin_bottom' => $request->margin_bottom ?? '0cm',
        ];
    }

    public static function deleteWatermark($id): JsonResponse
    {
        try {
            $watermarkFile              = WaterMarkFile::query()->find($id);
            $watermarkFile->state       = 2;
            $watermarkFile->save();
            return self::getResponse([
                'message'   => 'Archivo eliminado correctamente',
                'record'    => $watermarkFile,
            ]);
        }catch (Exception $e) {
            return self::getResponse500([
                'message' => $e->getMessage(),
            ]);
        }
    }
}
