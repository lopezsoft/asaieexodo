<?php

namespace App\Models\Location;

use App\Core\CoreModel;

class Department extends CoreModel
{
    public $table   = 'departments';

    protected $fillable = [
        'country_id', 'name_department', 'code','abbreviation',
    ];

    protected $hidden = [
        'country_id',
    ];

    protected $with = [
        'country',
    ];

    public function country(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Country::class)
            ->withDefault([
                'id'                => 45,
                'country_name'      => 'Colombia',
                'abbreviation_A2'   => 'CO',
                'HASC'              => 'CO',
                'active'            => 1,
            ]);
    }
}
