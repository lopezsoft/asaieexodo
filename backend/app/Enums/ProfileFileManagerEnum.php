<?php

namespace App\Enums;

/**
 * @property $value
 */
enum ProfileFileManagerEnum: string
{
    case Teacher = 'TEACHER';
    case Signature = 'SIGNATURE';
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
            'Teacher'   => self::Teacher->value,
            'Signature' => self::Signature->value,
            'Student'   => self::Student->value,
            'School'    => self::School->value,
            'Admin'     => self::Admin->value,
            'User'      => self::User->value,
            'Family'    => self::Family->value,
            'Any'       => self::Any->value,
            default => throw new \Exception('Unexpected match value'),
        };
    }
}
