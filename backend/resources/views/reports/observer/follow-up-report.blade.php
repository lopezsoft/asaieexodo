<table class="table-observer">
    <thead>
    <tr>
        <th colspan="17">
            INFORME PERIÓDICO DE SEGUIMIENTO
        </th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td class="text-center" colspan="6">
            <b>SEDE EDUCATIVA</b><br/>
            {{trim($studentData->sede)}}
        </td>
        <td class="text-center" colspan="4">
            <b>JORNADA</b><br/>
            {{trim($studentData->jornada)}}
        </td>
        <td class="text-center" colspan="7">
            <b>GRADO</b><br/>
            {{strtoupper($studentData->grado)}}
        </td>
    </tr>
    <tr>
        <td class="text-center" colspan="6">
            <b>ESTUDIANTE</b><br/>
            {{trim($studentData->nombres)}}
        </td>
        <td class="text-center" colspan="7">
            <b>NIVEL DE ENSEÑANZA</b><br/>
            {{trim($studentData->nombre_nivel)}}
        </td>
        <td class="text-center" colspan="2">
            <b>GRUPO</b><br/>
            {{strtoupper($studentData->grupo)}}
        </td>
        <td class="text-center" colspan="2">
            <b>AÑO</b><br/>
            {{strtoupper($year)}}
        </td>
    </tr>
    <tr>
        <td class="text-center" rowspan="2">
            <b>ASPECTOS Y CRITERIOS</b>
        </td>
        <td colspan="4" class="text-center">
            <b>PERIODO 1</b>
        </td>
        <td colspan="4" class="text-center">
            <b>PERIODO 2</b>
        </td>
        <td colspan="4" class="text-center">
            <b>PERIODO 3</b>
        </td>
        <td colspan="4" class="text-center">
            <b>PERIODO 4</b>
        </td>
    </tr>
    <tr>
        @for($i = 0; $i < 4; $i++)
        <td class="text-center column-width-item">
            <b>N</b>
        </td>
        <td class="text-center column-width-item">
            <b>AV</b>
        </td>
        <td class="text-center column-width-item">
            <b>CS</b>
        </td>
        <td class="text-center column-width-item">
            <b>S</b>
        </td>
        @endfor
    </tr>
    {!! getObserverItems($items) !!}
    <tr><td colspan="17">CONVENCIONES: N=Nunca - AV=Algunas Veces - CS=Casi Siempre - S=Siempre</td></tr>
    </tbody>
</table>
@if(count($annotations) > 0)
<pagebreak>
@endif
