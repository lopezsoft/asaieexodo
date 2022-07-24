<?php

namespace App\Models;

use App\Models\User\SchoolUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'avatar',
        'email',
        'password',
        'remember_token',
        'active',
    ];

    protected $appends = [
        'fullname',
        'schools',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    function getSchoolsAttribute(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->hasMany(SchoolUser::class, 'user_id', 'id')->get();
    }

}
