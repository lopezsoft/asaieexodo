<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'user_name',
        'avatar',
        'email',
        'password',
    ];

    protected $appends = [
        'year',
        'database',
        'statecode'
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

    function getStatecodeAttribute() {

    }

    function getDatabaseAttribute() {
        $query  = DB::select("SELECT a.database_name FROM schools AS a LEFT JOIN school_users AS b ON a.id = b.school_id WHERE b.user_id = ? LIMIT 1", [$this->id]);
        return $query[0]->database_name;
    }

    function getYearAttribute() {

    }
}
