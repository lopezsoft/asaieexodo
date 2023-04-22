<?php

namespace App\Modules\Student;

use App\Contracts\FileManageContract;
use App\Modules\School\SchoolQueries;
use App\Modules\Upload\UploadFiles;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UploadStudentDocument implements FileManageContract
{
    use MessagesTrait;

    public static function getFiles(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $documents  = DB::table("{$db}students_file_managers", "a")
                        ->select("b.*")
                        ->leftJoin("file_managers AS b", "a.file_manager_uuid", "=", "b.uuid")
                        ->where("a.student_id", $request->input('pdbStudentId'))
                        ->get();
            return self::getResponse([
                "records" => [
                    'data' =>  $documents
                ]
            ]);
        }catch (\Exception $e) {
            return self::getResponse500([
                'error'      => $e->getMessage()
            ]);
        }
    }
    public static function uploadFile(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            DB::beginTransaction();
            $path           = "students/".$request->input('pdbStudentId')."/documents";
            $school         = SchoolQueries::getSchoolRequest($request);
            $fileManager    = UploadFiles::upload($request, $path, $school);
            DB::Table("{$school->db}students_file_managers")->insert([
                'file_manager_uuid' => $fileManager->fileManager->uuid,
                'student_id'        => $request->input('pdbStudentId'),
            ]);
            DB::commit();
            return self::getResponse([
                'fileManager' => $fileManager->fileManager
            ]);
        }catch (\Exception $e) {
            DB::rollBack();
            return self::getResponse500([
                'error'      => $e->getMessage()
            ]);
        }
    }
}
