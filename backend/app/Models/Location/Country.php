<?php

namespace App\Models\Location;

use App\Core\CoreModel;

class Country extends CoreModel
{
    public $table   = 'countries';

    protected $fillable = [
        'abbreviation_A2', 'country_name','phone_code',
    ];

    protected $hidden = [
      'TerritoryOf', 'FIPS', 'NUTS', 'HASC',
    ];
}
