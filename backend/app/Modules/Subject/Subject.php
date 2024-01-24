<?php

namespace App\Modules\Subject;

use App\Modules\School\SchoolQueries;
use App\Traits\MessagesTrait;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Subject
{
    use MessagesTrait;
    /**
     * @throws \Exception
     */
    public static function getSubjectCertificate(Request $request): JsonResponse
    {
        $school = SchoolQueries::getSchoolRequest($request);
        $db     = $school->db;
        $query   = self::getSubjectCertificateBuilder($db)
                    ->where('subject_parent_id', $request->input('pdbId') ?? 0 );
        return self::getResponse([
            'records' => $query->paginate($school->limit)
        ]);
    }

    public static function getSubjectCertificateBuilder($db): Builder
    {
        return  DB::table("{$db}subject_certificates", "sc")
            ->selectRaw("sc.*, a.asignatura, a.abrev")
            ->join($db.'asignaturas AS a', 'a.id_pk', '=', 'sc.subject_related_id');

    }

}
