<?php

namespace App\Models\User;

use App\Models\School\School;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static create(array $array)
 * @property mixed $user_id
 * @property mixed $school_id
 */
class SchoolUser extends Model
{
    use HasFactory;

    public $table    = "school_users";

    protected $fillable = ['user_id', 'school_id', 'state'];

    protected $with = ['school'];

    protected $hidden = ['created_at', 'updated_at'];
    protected $appends = [
        'roles'
    ];

    public function school(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(School::class);
    }
    public function getRolesAttribute(): \Illuminate\Database\Eloquent\Collection
    {
        return UserRole::where([
            'user_id'   => $this->user_id,
            'school_id' => $this->school_id,
        ])->get();
    }
}
