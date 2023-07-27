@php
    $areaName   = '';
@endphp
<table class="final-leveling-table">
    <tbody>
    @foreach($levelingData as $level)
        @if($areaName != $level->area)
            <tr>
                <td>
                   <b>{{$level->area}}</b>
                </td>
            </tr>
            @php
                $areaName = $level->area;
            @endphp
        @endif
        <tr>
            <td>
                <ul>
                    <li type="disc">{{trim($level->abrev)}} .Nota: {{$level->notarecuperada ?? 0}}. Acta Nº. {{$level->acta ?? ''}}. Fecha: {{$level->fecha ?? ''}}</li>
                </ul>
            </td>
        </tr>
    @endforeach
    </tbody>
</table>
