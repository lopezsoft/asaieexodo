<?php

namespace App\Models\User;

use App\Core\CoreModel;

class UserProfile extends CoreModel
{
    public $table   = "user_profiles";

    protected $hidden = ['timestamp'];
}
