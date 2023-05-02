<?php

namespace App\Core;

use App\Models\School\FileManager;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use JasperPHP\JasperPHP;

class JReportModel  extends MasterModel {
    private string $driver	        = "com.mysql.jdbc.Driver";
	private string $database_name	= 'dbname';
	private string $host			= 'localhost';
	private string $username_db	    = 'root';
    private string $port            = '3307';
	private mixed $password_db	    = NULL;

	/**
	* Propiedades para almacenar las rutas de los informes en sus respentivos formatos
	*/
	public $path_folder_pdf;
	public $path_folder_doc;
	public $path_folder_csv;
	public $path_folder_txt;
	public $path_folder_pptx;
	public $path_folder_html;
	public $path_folder_rtf;
	public $path_folder_xls;
	public $path_folder_xlsx;
	public $path_report;

	//Variables del informe
    public	$subreport_dir	= '';
    private $path_delim;

    public function __construct()
    {
        $this->path_folder_pdf	= 'pdf';
		$this->path_folder_doc	= 'doc';
		$this->path_folder_csv	= 'csv';
		$this->path_folder_txt	= 'txt';
		$this->path_folder_pptx	= 'pptx';
		$this->path_folder_html = 'html';
		$this->path_folder_rtf 	= 'rtf';
        $this->path_folder_xls 	= 'xls';
        $this->path_folder_xlsx = 'xlsx';
        $this->driver			= "mysql" /** mysql || postgres */;

        $delim				    = env('PATH_DELIM', '/');
        $this->path_delim       = $delim;

        $this->port             = env('DB_PORT', '3306');
        $this->database_name    = env('DB_DATABASE', 'forge');
        $this->username_db		= env('DB_USERNAME', 'root');
		$this->password_db		= env('DB_PASSWORD', '');
		$this->host				= env('DB_HOST', '127.0.0.1');

        $this->subreport_dir    = 'reports'.$delim.'subreports';
    }

	public function getReportExport ($reportName, $fileDescription, $fmt, $query, $outputFolder, $school, $param = []): \Illuminate\Http\JsonResponse
    {
        $db             = $school->database_name;
        $delim          = $this->path_delim;
        $format         = strtolower($fmt);
        //Reporte a Procesar: Este nombre es del reporte creado en JasReport
        $pathRoot           =  public_path().$this->path_delim;
        $realName           =  Str::random(12);
		$reportName			=  "{$pathRoot}reports{$this->path_delim}{$reportName}";

		//Parámetro en caso de que el reporte no este parametrizado
        $R_MARKETING        = 'Software Académico y Administrativo ASAIE ÉXODO - https://asaie.co/';
        $user               = Auth::user();
        $userName           =  $user->first_name." ".$user->last_name;
        $paramReport	= [
            'SQL_PARAM' 	=> $query,
            'HOME_DIR' 	    => $pathRoot,
            'R_MARKETING'   => $R_MARKETING,
            'P_USER' 	    => $userName,
            "R_FOOTER"      => "PIE DE PAGINA",
            'AWS_PATH' 	    => public_path('storage').$this->path_delim,
            'SUBREPORT_DIR' => $pathRoot.$this->subreport_dir.$this->path_delim
        ];

		if(count($param) > 0){
			foreach($param as $key => $value){
				$paramReport[$key] = $value;
			}
		}

		try {
            $output = match ($format) {
                'pptx'  => $this->path_folder_pptx . $this->path_delim,
                'docx'  => $this->path_folder_doc . $this->path_delim,
                'csv'   => $this->path_folder_csv . $this->path_delim,
                'txt'   => $this->path_folder_txt . $this->path_delim,
                'html'  => $this->path_folder_html . $this->path_delim,
                'rtf'   => $this->path_folder_rtf . $this->path_delim,
                'xls'   => $this->path_folder_xls . $this->path_delim,
                'xlsx'  => $this->path_folder_xlsx . $this->path_delim,
                default => $this->path_folder_pdf . $this->path_delim,
            };

            $date	        = date('Y');
            $aws_main_path  = env('AWS_MAIN_PATH', 'test');
            $path_report    = "schools{$delim}{$outputFolder}{$delim}reports{$delim}{$user->id}{$delim}";
            $output_report  = "{$path_report}{$output}";
            Storage::disk('public')->makeDirectory($output_report);
			$jasper = new JasperPHP;
			// Compile a JRXML to Jasper
			$jasper->compile($reportName.'.jrxml')->execute();

            $saveTo     = "{$output_report}{$fileDescription}_{$realName}_{$date}";
            $storage    = Storage::disk('public')->path($saveTo);
			$jasper->process(
				$reportName.'.jasper',
                $storage,
				array($format),
				$paramReport,
				array(
					'driver' 	=> $this->driver,
					'username' 	=> $this->username_db,
					'host' 		=> $this->host,
					'database' 	=> $db,
					'password' 	=> $this->password_db,
					'port' 		=> $this->port
				)
            )->execute();
            $filename   = "{$fileDescription}_{$realName}_{$date}.{$format}";
            $filePath   = "{$saveTo}.{$format}";
            // Local Storage
            Storage::disk('public')->url("{$saveTo}.{$format}");
            // Aws Storage
            Storage::putFileAs("{$aws_main_path}/{$output_report}", "{$storage}.{$format}", $filename,'public');
            $output     = Storage::url("{$aws_main_path}/{$saveTo}.{$format}");

            FileManager::create([
                'school_id'         =>  $school->id,
                'user_id'           =>  $user->id,
                'file_name'         =>  $filename,
                'file_description'  =>  $fileDescription,
                'file_path'         =>  "{$aws_main_path}/{$saveTo}.{$format}",
                'url'               =>  $output,
                'extension_file'    =>  $format,
                'mime_type'         =>  Storage::disk('public')->mimeType($filePath),
                'size_file'         =>  Storage::disk('public')->size($filePath),
                'last_modified'     =>  date('Y-m-d H:i:s', Storage::disk('public')->lastModified($filePath)),
                'state'             =>  1,
            ]);
            // Delete local storage
            Storage::disk('public')->delete($filePath);
            return response()->json([
                'success'   => true,
                'pathFile'  => utf8_encode($output),
            ], 200);

		} catch (Exception $e) {
			// Depuración de errores
            exec($jasper->output().' 2>&1', $output_error);

            return response()->json([
                'success'   => false,
                'error'     => $output_error[0] ?? "",
                'message'   => $e->getMessage(),
                'e'         => $e
            ], 500);
		}
    }
}
