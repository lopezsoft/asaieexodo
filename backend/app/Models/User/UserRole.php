<?php

namespace App\Models\User;

use App\Core\CoreModel;

/**
 * @method static where(array $array)
 */
class UserRole extends CoreModel
{
    public $table   = "user_roles";
    protected $fillable = [
        'school_id', 'profile_id', 'state', 'user_id',
    ];

    protected $appends = [
      'profile'
    ];

    public function getProfileAttribute(): object
    {
        return $this->hasMany(UserProfile::class,'id', 'profile_id')->first();
    }
}
