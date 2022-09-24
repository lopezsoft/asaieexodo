<?php

namespace App\Modules\Auth;
use App\Models\User;
use App\Queries\AuditTable;
use App\Traits\MessagesTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserData
{
    use MessagesTrait;
    public static function updateAccount(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        try {
            $user           = User::where('id', $id)->first();
            $records        = json_decode($request->input('records'));
            if(isset($records->imgdata)){
                $occurs    = strpos($records->imgdata, ",");
                //get the base-64 from data
                $base64_str = substr($records->imgdata, strpos($records->imgdata, ",") + 1);

                if(strlen($base64_str)  > 0 &&  $occurs > 0){
                    //decode base64 string
                    $image              = base64_decode($base64_str);
                    $imgName            = $records->imgname;
                    $user->avatar       = self::putFileAuth($id, $image, $imgName);
                }
            }
            $user->first_name   = $records->first_name ?? $user->first_name;
            $user->last_name    = $records->last_name ?? $user->last_name;
            $user->save();
            AuditTable::audit($request->ip(), 'users', "UPDATE", $records);
            return self::getResponse(['user' => $user]);
        }catch (\Exception $e) {
            return self::getResponse500();
        }
    }

    private static function putFileAuth($id, $data, $imgName): string
    {
        $path  = "users/{$id}/profile/".$imgName;
        Storage::disk('public')->put($path, $data);
        return Storage::url($path);
    }
}
