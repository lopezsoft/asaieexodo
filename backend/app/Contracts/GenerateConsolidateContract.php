<?php

namespace App\Contracts;

interface GenerateConsolidateContract
{
    public function generate($properties, $school): void;
}
