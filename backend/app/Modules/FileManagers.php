<?php

namespace App\Modules;

use App\Contracts\FileManagerContract;
use App\Enums\ProfileFileManagerEnum;
use App\Models\School\FileManager;
use App\Modules\School\SchoolQueries;
use App\Modules\Upload\UploadFiles;
use App\Traits\MessagesTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FileManagers implements FileManagerContract
{
    use MessagesTrait;
    public static function upload(Request $request, string $path, string $disk = 's3'): JsonResponse
    {
        try {
            DB::beginTransaction();
            $fileProfile    = $request->input('fileProfile') ?? 'School';
            $profileEnum    = ProfileFileManagerEnum::getProfile($fileProfile);
            $school         = SchoolQueries::getSchoolRequest($request);
            $fileManager    = UploadFiles::upload($request, $path, $school, $disk);
            DB::Table("{$school->db}file_managers")->insert([
                'file_manager_uuid' => $fileManager->fileManager->uuid,
                'belong_to_id'      => $request->input('belongToId') ?? null,
                'profile'           => $profileEnum,
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

    public static function get(Request $request): JsonResponse
    {
        try {
            $fileProfile    = $request->input('fileProfile') ?? 'School';
            $profileEnum    = ProfileFileManagerEnum::getProfile($fileProfile);
            $school         = SchoolQueries::getSchoolRequest($request);
            $db             = $school->db;
            $documents      = FileManager::query()
                ->from("file_managers", "a")
                ->select("a.*", 'b.profile')
                ->leftJoin("{$db}file_managers AS b", "b.file_manager_uuid", "=", "a.uuid")
                ->where("b.belong_to_id", $request->input('belongToId') ?? null)
                ->where("b.profile", $profileEnum)
                ->where("a.state", 1);
            return self::getResponse([
                "records" => $documents->paginate(30)
            ]);
        }catch (\Exception $e) {
            return self::getResponse500([
                'error'      => $e->getMessage()
            ]);
        }
    }

    public static function delete(Request $request, mixed $id): JsonResponse
    {
        try {
            FileManager::query()
                ->where('id', $id)
                ->update([
                    'state' => 0
                ]);
            return self::getResponse();
        }catch (\Exception $e) {
            return self::getResponse500([
                'error'      => $e->getMessage()
            ]);
        }
    }
}
