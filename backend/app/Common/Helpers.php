<?php

use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Protection;

function normalizes ($cadena): bool|string
{
    $originales     = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûýýþÿŔŕ';
    $modificadas    = 'aaaaaaaceeeeiiiidnoooooouuuuybsaaaaaaaceeeeiiiidnoooooouuuyybyRr';
    $cadena         = utf8_decode($cadena);
    $cadena         = strtr($cadena, utf8_decode($originales), $modificadas);
    $cadena         = strtolower($cadena);
    return utf8_encode($cadena);
}

function cellLocked(&$worksheet, $cell): void
{
    $worksheet->getStyle($cell)
        ->getProtection()
        ->setLocked(
            Protection::PROTECTION_PROTECTED
        );
}

function cellColor(&$worksheet, $cells,$color): void
{
    $worksheet->getStyle($cells)->getFill()->applyFromArray(array(
        'type' => Fill::FILL_SOLID,
        'startcolor' => array(
            'rgb' => $color
        )
    ));
}


function getRowSheet($index): string
{
    $rows = array(
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'AA',
        'AB',
        'AC',
        'AD',
        'AE',
        'AF',
        'AG',
        'AH',
        'AI',
        'AJ',
        'AK',
        'AL',
        'AM',
        'AN',
        'AO',
        'AP',
        'AQ',
        'AR',
        'AS',
        'AT',
        'AU',
        'AV',
        'AW',
        'AX',
        'AY',
        'AZ'
    );

    return $rows[$index];
}
