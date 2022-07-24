<?php

namespace App\Models\Location;

use App\Core\CoreModel;

class Cities extends CoreModel
{

    public $table   = 'cities';

    protected $with = [
        'department',
    ];

    protected $fillable = [
        'department_id', 'name_city', 'city_code',
    ];

    protected $hidden = [
        'department_id',
    ];

    /**
     * Get the department identification that owns the department.
     */
    public function department(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
