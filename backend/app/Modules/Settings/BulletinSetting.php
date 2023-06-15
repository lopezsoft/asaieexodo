<?php

namespace App\Modules\Settings;

use Illuminate\Support\Facades\DB;

class BulletinSetting
{
    public static function get($school): ? Object
    {
        $db = $school->db;
        return DB::Table("{$db}configboletin")->first();
    }
}
