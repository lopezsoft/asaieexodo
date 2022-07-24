<?php

namespace App\Models\User;

use App\Models\School\School;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolUser extends Model
{
    use HasFactory;

    public $table    = "school_users";

    protected $fillable = ['user_id', 'school_id', 'state'];

    protected $with = ['school'];

    protected $hidden = ['created_at', 'updated_at'];

    public function school(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
