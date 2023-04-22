<?php

namespace App\Enums;

enum ProfileFileManagerEnum: string
{
    case Teacher = 'TEACHER';
    case Student = 'STUDENT';
    case School = 'SCHOOL';
    case Admin = 'ADMIN';
    case User = 'USER';
    case Family = 'FAMILY';
    case Any = 'ANY';

    /**
     * @throws \Exception
     */
    public static  function getProfile(string $caseVale): string
    {
        return match($caseVale) {
            'Teacher'   => ProfileFileManagerEnum::Teacher->value,
            'Student'   => ProfileFileManagerEnum::Student->value,
            'School'    => ProfileFileManagerEnum::School->value,
            'Admin'     => ProfileFileManagerEnum::Admin->value,
            'User'      => ProfileFileManagerEnum::User->value,
            'Family'    => ProfileFileManagerEnum::Family->value,
            'Any'       => ProfileFileManagerEnum::Any->value,
            default => throw new \Exception('Unexpected match value'),
        };
    }
}
