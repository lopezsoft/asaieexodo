<?php

namespace App\Modules\Grades;

use App\Modules\School\SchoolQueries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GroupsAcademic
{
    /**
     * @throws \Exception
     */
    public static function getGroups(Request $request): \Illuminate\Http\JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $year   = $request->input('year') ?? Date('Y');
        $query  = DB::table("{$db}.config001")->where('year', $year)->first();
        $value  = [];
        if ($query) {
            if ($query->grupo == 1) {
                for ($i = 1; $i < 16; $i++) {
                    $value[] = array(
                        'grupo' => str_pad($i, 2, "00", STR_PAD_LEFT)
                    );
                };
            } else {
                $value [] = array(
                    'grupo' => 'A'
                );
                $value [] = array(
                    'grupo' => 'B'
                );
                $value [] = array(
                    'grupo' => 'C'
                );
                $value [] = array(
                    'grupo' => 'D'
                );
                $value [] = array(
                    'grupo' => 'E'
                );
                $value [] = array(
                    'grupo' => 'F'
                );
                $value [] = array(
                    'grupo' => 'G'
                );
                $value [] = array(
                    'grupo' => 'H'
                );
                $value [] = array(
                    'grupo' => 'I'
                );
                $value [] = array(
                    'grupo' => 'J'
                );

                $value [] = array(
                    'grupo' => 'K'
                );
                $value [] = array(
                    'grupo' => 'L'
                );
                $value [] = array(
                    'grupo' => 'M'
                );
                $value [] = array(
                    'grupo' => 'N'
                );
                $value [] = array(
                    'grupo' => 'O'
                );
            }
        }
        return MessagesTrait::getResponse([
            'records' => [
                'data' => $value
            ]
        ]);
    }
}
