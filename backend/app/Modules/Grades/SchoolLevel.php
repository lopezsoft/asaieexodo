<?php

namespace App\Modules\Grades;

use Illuminate\Support\Facades\DB;

class SchoolLevel
{
    public static function getLevelId($db, $gradeId = 4): int {

        $sql = DB::table("{$db}grados")
                ->where("id", $gradeId)
                ->first();
        return $sql->id_nivel ?? 0;
    }
}
