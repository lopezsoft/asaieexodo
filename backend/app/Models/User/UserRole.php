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

    protected $with = [
        'profile'
    ];

    public function profile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserProfile::class, 'id', 'profile_id')->where('active', 1);
    }

}
