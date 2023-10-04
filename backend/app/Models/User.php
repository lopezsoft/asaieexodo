<?php

namespace App\Models;

use App\Models\User\SchoolUser;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Auth\Passwords\CanResetPassword;
/**
 * @method static create(array $array)
 * @method static findOrFail($user_id)
 * @method static find($user_id)
 * @method static where(string $string, mixed $uud)
 * @property mixed $first_name
 * @property mixed $last_name
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;
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
        'name',
    ];

    protected $with = [
        'schools',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime:d-m-Y H:i:s a',
    ];

    public function getNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function schools(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SchoolUser::class, 'user_id', 'id');
    }
}
