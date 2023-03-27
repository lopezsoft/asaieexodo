<?php

namespace App\Core;

class NumbersToLetters
{
    /***************** Numbers *********************/
    private   $UNITS    = [
        0            => 'CERO',
        1            => 'UNO',
        12           => 'UN',
        2            => 'DOS',
        3            => 'TRES',
        4            => 'CUATRO',
        5            => 'CINCO',
        52           => 'quinientos',
        6            => 'SEIS',
        7            => 'SIETE',
        72           => 'setecientos',
        8            => 'OCHO',
        9            => 'NUEVE',
        92           => 'novecientos',
    ];
    private  $TENDS  = [
        10            => 'DIEZ',
        11            => 'ONCE',
        12            => 'DOCE',
        13            => 'TRECE',
        14            => 'CATORCE',
        15            => 'quince',
        16            => 'diecisEis',
        17            => 'diecisiete',
        18            => 'dieciocho',
        19            => 'diecinueve',
        20            => 'veinte',
        21            => 'veintiun',
        212           => 'veintiun',
        22            => 'veintidOs',
        23            => 'veintitrEs',
        24            => 'veinticuatro',
        25            => 'veinticinco',
        26            => 'veintisÉis',
        27            => 'veintisiete',
        28            => 'veintiocho',
        29            => 'veintinueve',
        30            => 'treinta',
        40            => 'cuarenta',
        50            => 'cincuenta',
        60            => 'sesenta',
        70            => 'setenta',
        80            => 'ochenta',
        90            => 'noventa',
    ];

    private   $HUNDREDS   = [
        100          => 'cien',
        1002         => 'ciento',
        1003         => 'cientos',
    ];

    public $ThousANDString      = 'MIL';
    public $MillionString       = 'MILLON';
    public $MillionsString      = 'MILLONES';
    public $NumberAND           = ' Y ';
    public $NumberSPACE         = ' ';
    public $NumberWITH          = ', CON ';
    public $NumberFrom          = ' DE ';

    public function getNumbersToLetters(float $value = 0, $money = 'PESOS', $money2 = 'CENTAVOS')
    {
        $B0         = '';
        $B1         = '';
        $B2         = '';
        $B3         = '';
        $B4         = '';
        $decimal    = strpos(strval($value),',');
        if($decimal){
            return 'Formato incorrecto, cambie la COMA por  un PUNTO';
        }
        $decimal    = strpos(strval($value),'.');
        if($decimal){
            $decVal     = substr($value,$decimal + 1);
            $realNumber = str_pad(substr($value,0,$decimal), 12, '0',STR_PAD_LEFT);
            $B0         = $this->NumberWITH.$this->readValues($decVal).$this->NumberSPACE.$money2.$this->NumberSPACE;
        }else{
            $realNumber = str_pad($value, 12, '0',STR_PAD_LEFT);
        }

        if(strlen($realNumber) > 12){
            return 'Supera el valor soportado.';
        }

        $A1         = floatval(substr($realNumber, 9,3));
        $A2         = floatval(substr($realNumber, 6,3));
        $A3         = floatval(substr($realNumber, 3,3));
        $A4         = floatval(substr($realNumber, 0,3));

        if($A1 > 0){
            $B1     = $this->readValues($A1);
        }

        if($A2 > 0){
            switch ($A2) {
                case 1:
                    $B2     = $this->ThousANDString.$this->NumberSPACE;
                    break;
                case 21:
                    $B2     = $this->TENDS[212].$this->NumberSPACE.$this->ThousANDString.$this->NumberSPACE;
                    break;
                default:
                    $B2     = $this->readValues($A2).$this->NumberSPACE.$this->ThousANDString.$this->NumberSPACE;
                    break;
            }
        }

        if($A3 > 0){
            switch ($A3) {
                case 1:
                    $B3     = $this->getUnits(12).$this->NumberSPACE.$this->MillionString;
                    break;
                case 21:
                    $B3     = $this->TENDS[212].$this->NumberSPACE.$this->MillionsString;
                    break;
                default:
                    $B3     = $this->readValues($A3).$this->NumberSPACE.$this->MillionsString;
                    break;
            }

            if($A2 == 0 && $A1 == 0){
                $B3 = $B3.$this->NumberFrom;
            }else{
                $B3 = $B3.$this->NumberSPACE;
            }
        }

        if($A4 > 0){
            switch ($A4) {
                case 1:
                    $B4     = $this->ThousANDString.$this->NumberSPACE.$this->MillionsString;
                    break;
                case 21:
                    $B4     = $this->TENDS[212].$this->NumberSPACE.$this->ThousANDString.$this->NumberSPACE.$this->MillionsString;
                    break;
                default:
                    $B4     = $this->readValues($A4).$this->NumberSPACE.$this->ThousANDString.$this->NumberSPACE.$this->MillionsString;
                    break;
            }
            if($A2 == 0 && $A1 == 0 && $A3 == 0){
                $B4 = $B4.$this->NumberFrom;
            }else{
                $B4 = $B4.$this->NumberSPACE;
            }
        }
        $r      = (strlen($B0) > 0) ? $B0 : $this->NumberSPACE;
        $Result = $B4.$B3.$B2.$B1.$this->NumberSPACE.$money.$r;
        return strtoupper($Result);
    }

    private function readValues(int $number) {
        $Result = '';
        switch ( strlen($number)){
            case 1 :
                $Result = $this->getUnits($number);
                break ;
            case 2 :
                $Result = $this->getTens($number);
                break ;
            case 3 :
                $Result = $this->getHundreds($number);
                break ;
            default :
                $Result = '';
                break ;
        }

        return $Result;
    }

    /**
     * Read units - Lee las unidades
     */
    private function getUnits(int $NValue = 0){
        return $this->UNITS[$NValue];
    }

    /**
     *  read tens - Lee las decenas
     */
    private function getTens(int $NValue = 0): string
    {
        $NDesc  = 0;
        $NUnit  = 0;
        $Result = '';
        if($NValue == 0){return $Result;}
        $NDesc = $NValue;
        $NUnit = intval(substr(strval($NValue),1,1));
        if ($NDesc > 10 && $NDesc < 20){
            $Result = $this->TENDS[$NDesc];
        }elseif ($NDesc > 20 && $NDesc < 30){
            $Result = $this->TENDS[$NDesc];
        }else{
            $NDesc  = $NValue - $NUnit;
            $Result = $this->TENDS[$NDesc];
            if ($NDesc > 20 && $NUnit > 0 ){
                if($NUnit == 1){
                    $Result = $Result.$this->NumberAND.$this->getUnits(12);
                }else{
                    $Result = $Result.$this->NumberAND.$this->getUnits($NUnit);
                }
            }
        }

        return $Result;
    }

    /**
     * read hundreds - Leer centenas
    */
    private function getHundreds (int $NValue = 0): string
    {
        $NCent = 0;
        $NDesc = 0;
        $NUnit = 0;
        $Result= '';
        if($NValue == 0){
            return $Result;
        }

        $NCent = intval(substr(strval($NValue),0,1)); // Centena
        $NDesc = intval(substr(strval($NValue),1,1)); // Descena
        $NUnit = intval(substr(strval($NValue),2,1)); // Unidad
        switch($NCent) {
            case 1 :
                if ($NValue == 100){
                    $Result = $this->HUNDREDS[100];
                }else{
                    $Result = $this->HUNDREDS[1002];
                }
                break;
            case 2 : $Result = $this->UNITS[2].$this->HUNDREDS[1003];
                break;
            case 3 : $Result = $this->UNITS[3].$this->HUNDREDS[1003];
                break;
            case 4 : $Result = $this->UNITS[4].$this->HUNDREDS[1003];
                break;
            case 5 : $Result = $this->UNITS[52];
                break;
            case 6 : $Result = $this->UNITS[6].$this->HUNDREDS[1003];
                break;
            case 7 : $Result = $this->UNITS[72];
                break;
            case 8 : $Result = $this->UNITS[8].$this->HUNDREDS[1003];
                break;
            case 9 : $Result = $this->UNITS[92];
                break;
            default:
                break;
        }
        if (($NUnit > 0 && $NUnit < 10) && $NDesc == 0){
            $Result = $Result.$this->NumberSPACE.$this->getUnits($NUnit);  // Units - Unidades
        }elseif($NDesc > 0){
            $Result = $Result.$this->NumberSPACE.$this->getTens(intval("{$NDesc}{$NUnit}"));  // Tens - Descenas
        }

        return $Result;
    }
}

