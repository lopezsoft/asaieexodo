<table class="table-observer">
    <thead>
    <tr>
        <th colspan="7">
            REGISTRO DE ANOTACIONES
        </th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td class="text-center" colspan="3">
            <b>SEDE EDUCATIVA</b><br/>
            {{trim($studentData->sede)}}
        </td>
        <td class="text-center">
            <b>JORNADA</b><br/>
            {{trim($studentData->jornada)}}
        </td>
        <td class="text-center" colspan="3">
            <b>GRADO</b><br/>
            {{strtoupper($studentData->grado)}}
        </td>
    </tr>
    <tr>
        <td class="text-center" colspan="3">
            <b>ESTUDIANTE</b><br/>
            {{trim($studentData->nombres)}}
        </td>
        <td class="text-center" colspan="2">
            <b>NIVEL DE ENSEÑANZA</b><br/>
            {{trim($studentData->nombre_nivel)}}
        </td>
        <td class="text-center">
            <b>GRUPO</b><br/>
            {{strtoupper($studentData->grupo)}}
        </td>
        <td class="text-center">
            <b>AÑO</b><br/>
            {{strtoupper($year)}}
        </td>
    </tr>
    <tr>
        <td class="text-center">
            <b>FECHA</b>
        </td>
        <td class="text-center" colspan="2">
            <b>ANOTACIÓN</b>
        </td>
        <td class="text-center" colspan="2">
            <b>COMPROMISO DEL ESTUDIANTE</b>
        </td>
        <td class="text-center" COLSPAN="2">
            <b>COMPROMISO DEL ACUDIENTE</b>
        </td>
    </tr>
    {!! getObserverAnnotations($annotations) !!}
    </tbody>
</table>
