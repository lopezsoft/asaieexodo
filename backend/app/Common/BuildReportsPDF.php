<?php

namespace App\Common;

use App\Models\School\FileManager;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use \App\MPdf\CustomMPdf;

class BuildReportsPDF
{
    public function __construct(
        public string $view,
        public string $fileDescription,
        public $school
    )
    {}
    public function build(mixed $data, $config = ['mode' => 'utf-8', 'format' => 'A4']): JsonResponse
    {
        try {
            $view               = $this->view;
            $fileDescription    = $this->fileDescription;
            $school             = $this->school;
            $db                 = $school->db;
            $delim              = env('PATH_DELIM', '/');
            $format             = ".pdf";
            $genericName        = Str::random(12);
            $header             = DB::Table("{$db}encabezado_reportes")->first();
            $signatures         = DB::Table("{$db}firmas")->first();

            $R_MARKETING        = 'Software Académico y Administrativo ASAIE ÉXODO - https://asaie.co/';
            $user               = Auth::user();
            $userName           = $user->first_name . " " . $user->last_name;
            $publicStorage          = Storage::disk('public');

            $data['header']         = $header;
            $data['R_MARKETING']    = $R_MARKETING;
            $data['userName']       = $userName;
            $data['school']         = $school;
            $data['user']           = $user;
            $data['signatures']     = $signatures;
            $data['isScannedSignature'] = ($signatures->usar_firma_escan == 1);
            $data['publicPath']     = public_path() . $delim;
            $data['storagePath']    = $publicStorage->url("");

            $date                   = date('Y');
            $pathReports            = "schools{$delim}{$school->path}{$delim}reports";
            $publicStorage->makeDirectory($pathReports);

            $slugDescription    = Str::slug($fileDescription, '_');
            $fileName           = "{$slugDescription}_{$genericName}_{$date}{$format}";

            $pdf            = new CustomMPdf($config);
            $pdf->SetHTMLFooter('<hr/>
                <table class="table-footer">
                    <tr>
                        <td class="text-center">
                            '.$header->pie.'
                        </td>
                        <td class="footer-page">{PAGENO}</td>
                    </tr>
                </table>');
            $pdf->loadView($view, $data);
            $localPath      = "{$pathReports}{$delim}{$fileName}";
            $pdf->save($localPath);
            $storagePath    = $publicStorage->path($localPath);

            // Aws Storage
            $aws_main_path  = env('AWS_MAIN_PATH', 'test');
            $pathFolder     = "{$pathReports}{$delim}{$user->id}{$delim}pdf";
            $cloudStorage   = Storage::cloud();
            $cloudStorage->putFileAs("{$aws_main_path}/{$pathFolder}", $storagePath, $fileName, ['visibility' => 'public']);
            $cloudPath      = "{$aws_main_path}/{$pathFolder}/{$fileName}";
            $output         = $cloudStorage->url($cloudPath);

            FileManager::create([
                'school_id'         => $school->school->id,
                'user_id'           => $user->id,
                'file_name'         => $fileName,
                'file_description'  => $fileDescription,
                'file_path'         => $cloudPath,
                'url'               => $output,
                'extension_file'    => $format,
                'mime_type'         => $publicStorage->mimeType($localPath),
                'size_file'         => $publicStorage->size($localPath),
                'last_modified'     => date('Y-m-d H:i:s', $publicStorage->lastModified($localPath)),
                'state'             => 1,
            ]);
            // Delete local storage
           $publicStorage->delete($localPath);
            return response()->json([
                'success'   => true,
                'pathFile'  => utf8_encode($output),
            ]);
        }catch (Exception $e){
            throw new Exception($e->getMessage());
        }
    }
}
