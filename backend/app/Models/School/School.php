<?php

namespace App\Models\School;

use App\Models\User\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        return $this->hasMany(UserRole::class, 'school_id', 'id')->get();
    }

}
