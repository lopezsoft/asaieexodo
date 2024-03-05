<?php

namespace App\Models\School;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static where(string $string, mixed $id)
 */
class School extends Model
{
    use HasFactory;
    protected $fillable = [
        'country_id',
        'statecode',
        'nameschool',
        'database_name',
        'lockdate',
        'state',
        'active',
    ];
}
