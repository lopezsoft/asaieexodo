<section>
    <div class="section-body student-data text-center">
        <span><b>INFORME FINAL DE EVALUACIÓN</b></span>
    </div>
</section>
<table class="table-final-certificate">
    <tbody>
    <tr>
        <td class="text-center" colspan="3">
            <b>SEDE EDUCATIVA</b><br/>
            {{trim($studentData->sede)}}
        </td>
        <td class="text-center" colspan="2">
            <b>JORNADA</b><br/>
            {{trim($studentData->jornada)}}
        </td>
        <td class="text-center">
            <b>LIBRO</b><br/>
            {{trim($studentData->libro_mat ?? $studentData->registration_number)}}
        </td>
        <td class="text-center">
            <b>FOLIO</b><br/>
            {{trim($studentData->id_folio)}}
        </td>
        <td class="text-center" colspan="2">
            <b>MATRICULA</b><br/>
            {{trim($studentData->nro_matricula ?? $studentData->book)}}
        </td>
    </tr>
    <tr>
        <td class="text-center" colspan="3">
            <b>ESTUDIANTE</b><br/>
            {{trim($studentData->estudiante)}}
        </td>
        <td class="text-center" colspan="2">
            <b>GRADO</b><br/>
            {{strtoupper($studentData->grado)}}
        </td>
        <td class="text-center">
            <b>GRUPO</b><br/>
            {{strtoupper($studentData->grupo)}}
        </td>
        <td class="text-center">
            <b>AÑO</b><br/>
            {{strtoupper($year)}}
        </td>
        <td class="text-center" colspan="2">
            <b>NIVEL DE ENSEÑANZA</b><br/>
            {{trim($studentData->nombre_nivel)}}
        </td>
    </tr>
    </tbody>
</table>
<table class="table-final-certificate">
    <thead>
    <tr>
        <td class="text-center">
            <b>ESCALA</b><br>
            {{$ratingScale}}
        </td>
        <td class="text-center" style="width: 60px">
            <b>AUSENCIAS</b>
        </td>
    </tr>
    </thead>
</table>
