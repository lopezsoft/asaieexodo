<?php

namespace App\Models\School;

use App\Models\User\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class School extends Model
{
    use HasFactory;
    protected $fillable = [
        'country_id',
        'statecode',
        'nameschool',
        'database_name',
        'lockdate',
        'state',
        'active',
    ];

    protected $appends = [
        'roles'
    ];

    public function getRolesAttribute(): \Illuminate\Database\Eloquent\Collection
    {
        $user   = Auth::user();
        return UserRole::where('user_id', $user->id)->get();
    }

}
