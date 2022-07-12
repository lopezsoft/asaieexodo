<?php

namespace App\Models;

use Laravel\Passport\HasApiTokens;
use Illuminate\Support\Facades\DB;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

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
        'year',
        'database',
        'statecode',
        'fullname',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'created_at',
        'updated_at',
        'year',
        'database',
        'statecode'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    function getFullnameAttribute(): string
    {
        return $this->first_name." ".$this->last_name;
    }

    function getStatecodeAttribute() {

    }

    function getDatabaseAttribute() {
        $query  = DB::select("SELECT a.database_name FROM schools AS a LEFT JOIN school_users AS b ON a.id = b.school_id WHERE b.user_id = ? LIMIT 1", [$this->id]);
        return $query[0]->database_name;
    }

    function getYearAttribute() {

    }
}
