<?php

use App\Queries\CallExecute;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Protection;

function getRatingScale(Collection $scale, int $grade, float $note): string
{
    $scaleName = '';
    $scale = $scale->where('id_grado', $grade);
    foreach ($scale as $item) {
        if ($note >= $item->desde && $note <= $item->hasta) {
            $scaleName = $item->nombre_escala;
            break;
        }
    }
    return $scaleName;
}
function getSubjectFinalReport(Collection $subjects, $student): string
{
    $subjectId      = $student->id_asign;
    $certificates   = $subjects->where('subject_parent_id', $subjectId);
    $data = $certificates->map(function ($item) use ($student) {
        return '<tr>
        <td class="subject-name">
            '.trim($item->asignatura).'
        </td>
        <td class="text-right ih-width">
           '.number_format($item->ih).'
        </td>
        <td class="text-right final-note">
            '.number_format($student->final, 2).'
        </td>
        <td class="scale-width">
            '.$student->nombre_escala.'
        </td>
        <td class="faltas-width text-right">
            '.$student->faltas.'
        </td>
        <td class="faltas-width text-right">
            '.$student->injustificadas.'
        </td>
        <td class="faltas-width text-right">
            '.$student->retraso.'
        </td>
    </tr>';
    });
    return $data->implode('');
}
function getSubjectCertificate(Collection $subjects, $student): string
{
    $subjectId      = $student->id_asign;
    $certificates   = $subjects->where('subject_parent_id', $subjectId);
    $data = $certificates->map(function ($item) use ($student) {
        return '<tr>
        <td class="subject-name">
            '.trim($item->asignatura).'
        </td>
        <td class="text-right ih-width">
           '.number_format($item->ih).'
        </td>
        <td class="text-right final-note">
            '.number_format($student->final, 2).'
        </td>
        <td class="scale-width">
            '.$student->nombre_escala.'
        </td>
    </tr>';
    });
    return $data->implode('');
}
function countSubjectCertificates(Collection $subjects, $subjectId): int
{
    return $subjects->where('subject_parent_id', $subjectId)->count();
}
function CallExecute($callName, $params = []): array
{
    return CallExecute::execute($callName, $params);
}
function getCurrentDateSignature() : string
{
    $date   = Carbon::now();
    return "a los {$date->day} días del mes de {$date->monthName} de {$date->year}.";
}
function getObserverAnnotations($annotations): string
{
    $tr         = "";
    $oldName    = "";
    foreach ($annotations as $annotation) {
        if($oldName != $annotation->periodo) {
            $tr .= '<tr><td colspan="7" style="background: #D9D9D9"><b>PERIODO: '.$annotation->periodo.'</b></td></tr>';
            $oldName = $annotation->periodo;
        }
        $td     = "<td style='width: 52px;'>".date('d-m-Y',strtotime($annotation->fecha))."</td>";
        $td     .= "<td colspan='2'>{$annotation->anotacion}</td>";
        $td     .= "<td colspan='2'>{$annotation->compromiso_est}</td>";
        $td     .= "<td colspan='2'>{$annotation->compromiso_acu}</td>";
        $tr .= "<tr>{$td}</tr>";
        $td     = "<td colspan='3' style='background: #D9D9D9'><b>COMPROMISO DE LA INSTITUCIÓN:</b></td>";
        $td     .= "<td colspan='2'>{$annotation->compromiso_inst}</td>";
        $td     .= "<td colspan='2'>{$annotation->docente}</td>";
        $tr .= "<tr>{$td}</tr>";
    }
    return $tr;
}
function getObserverItems($items): string
{
    $tr         = "";
    $oldName    = "";
    foreach ($items as $item) {
        if($oldName != $item->aspecto) {
            $tr .= '<tr><td colspan="17" style="background: #D9D9D9"><b>'.$item->aspecto.'</b></td></tr>';
            $oldName = $item->aspecto;
        }
        $td     = "";
        $td     = "<td>{$item->criterio}</td>";
        $itemList = (array)$item;
        for ($i = 1; $i <= 4; $i++) {
            $celValue   = ($itemList['n'.$i] == 1) ? '<b>X</b>' : '';
            $td         .= "<td class='text-center'>{$celValue}</td>";
            $celValue   = ($itemList['av'.$i] == 1) ? '<b>X</b>' : '';
            $td         .= "<td class='text-center'>{$celValue}</td>";
            $celValue   = ($itemList['cs'.$i] == 1) ? '<b>X</b>' : '';
            $td         .= "<td class='text-center'>{$celValue}</td>";
            $celValue   = ($itemList['s'.$i] == 1) ? '<b>X</b>' : '';
            $td         .= "<td class='text-center'>{$celValue}</td>";
        }
        $tr .= "<tr>{$td}</tr>";
    }
    return $tr;
}
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
