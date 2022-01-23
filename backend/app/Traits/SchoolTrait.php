<?php

namespace App\Traits;

use Exception;
use App\Models\School\School;
use App\Traits\MessagesTrait;
use Illuminate\Support\Facades\DB;

trait SchoolTrait
{

    use SessionTrait;

     /**
     * Retorna los datos de la escuela
     *
     * Return object
     */
    public static function getSchool()
    {
        try {
            $school = null;
            $db     = self::getDatabase();
            if($db){
                $school = DB::table($db.'.school')->first();
            }
            return $school;
        } catch (Exception $e) {
            return MessagesTrait::getResponse500($e->getMessage());
        }
    }
    /**
     * Retorna el ID de la empresa del usuario conectado
     *
     * Return INT
     */
    public static function getCompanyId()
    {
        $user   = auth()->user();
        $buser  = DB::table('business_users')->where('user_id', $user->id)->first();
        return ($buser) ? $buser->company_id : 0;
    }

    public static function getSchoolById($id = null){
        return School::where('id', $id)->first();
    }

    public static function getSchoolByCode($school_code = null){
        return School::where('statecode', $school_code)->first();
    }
}
