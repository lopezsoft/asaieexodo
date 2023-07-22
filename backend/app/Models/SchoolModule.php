<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class SchoolModule extends Model
{
    use HasFactory;
    protected $hidden = [
        'created_at',
        'updated_at',
    ];
    protected $with = [
        'systemModule',
    ];
    protected $fillable = [
        'school_id',
        'system_module_id',
        'status',
        'is_active',
    ];
    public function systemModule(): BelongsTo
    {
        return $this->belongsTo(SystemModule::class);
    }

}
