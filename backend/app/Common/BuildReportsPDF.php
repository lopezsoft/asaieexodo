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
    private bool $showFooter = true;
    private string|null $watermarkImage = null;
    private bool $showWatermarkImage = false;

    /**
     * @return bool
     */
    public function isShowFooter(): bool
    {
        return $this->showFooter;
    }

    /**
     * @param bool $showFooter
     */
    public function setShowFooter(bool $showFooter): void
    {
        $this->showFooter = $showFooter;
    }

    /**
     * @return string|null
     */
    public function getWatermarkImage(): ?string
    {
        return $this->watermarkImage;
    }

    /**
     * @param string|null $watermarkImage
     */
    public function setWatermarkImage(?string $watermarkImage): void
    {
        $this->watermarkImage = $watermarkImage;
    }

    /**
     * @return bool
     */
    public function isShowWatermarkImage(): bool
    {
        return $this->showWatermarkImage;
    }

    /**
     * @param bool $showWatermarkImage
     */
    public function setShowWatermarkImage(bool $showWatermarkImage): void
    {
        $this->showWatermarkImage = $showWatermarkImage;
    }
    public function __construct(
        public string $view,
        public string $fileDescription,
        public $school
    )
    {}
    public function build(mixed $data, $config = ['mode' => 'utf-8', 'format' => 'A4'], bool $isCertificate = false): JsonResponse
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
            // $config['tempDir']  = storage_path('tmp');
            $pdf                = new CustomMPdf($config);
            if($this->isShowFooter()){
                $pdf->SetHTMLFooter('<hr/>
                    <table class="table-footer">
                        <tr>
                            <td class="text-center">
                                '.$header->pie.'
                            </td>
                            <td class="footer-page">{PAGENO}</td>
                        </tr>
                    </table>');
            }
            $watermark  = $this->getWatermarkImage();
            if($watermark !== null && $this->isShowWatermarkImage()) {
                $pdf->SetWatermarkImage($watermark, .2, 'D', [0, 0]);
                $pdf->showWatermarkImage = true;
            }
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

            $fileManager = FileManager::create([
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
            // Insert certificate
            if($isCertificate){
                DB::table($school->db.'file_managers')
                    ->insert([
                        'file_manager_uuid' => $fileManager->uuid,
                        'profile'           => 'CERTIFICATE',
                    ]);
            }
            // Delete local storage
           $publicStorage->delete($localPath);
            // Return response
            return response()->json([
                'success'       => true,
                'pathFile'      => utf8_encode($output),
                'fileManager'   => $fileManager
            ]);
        }catch (Exception $e){
            throw new Exception($e->getMessage());
        }
    }
}
