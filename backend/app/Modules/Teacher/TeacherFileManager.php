<?php

namespace App\Modules\Teacher;

use App\Contracts\FileManagerContract;
use App\Modules\School\SchoolQueries;
use App\Modules\Upload\UploadFiles;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherFileManager implements FileManagerContract
{
    use MessagesTrait;
    public static function upload(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            DB::beginTransaction();
            $path           = "teacher/".$request->input('pdbTeacherId')."/documents";
            $school         = SchoolQueries::getSchoolRequest($request);
            $fileManager    = UploadFiles::upload($request, $path, $school);
            DB::Table("{$school->db}teacher_file_managers")->insert([
                'file_manager_uuid' => $fileManager->fileManager->uuid,
                'teacher_id'        => $request->input('pdbTeacherId'),
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

    public static function get(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $school     = SchoolQueries::getSchoolRequest($request);
            $db         = $school->db;
            $documents  = DB::table("{$db}teacher_file_managers", "a")
                ->select("b.*")
                ->leftJoin("file_managers AS b", "a.file_manager_uuid", "=", "b.uuid")
                ->where("a.teacher_id", $request->input('pdbTeacherId'))
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

    public static function delete(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        // TODO: Implement delete() method.
    }
}
