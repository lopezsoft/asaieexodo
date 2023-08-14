@if($onlyAreas)
<tr>
    <td class="subject-name">
        {{trim($student->area)}}
    </td>
    <td class="text-right ih-width">
        {{$student->ih}}
    </td>
    <td class="text-right final-note">
        {{number_format($student->final, 2)}}
    </td>
    <td class="scale-width">
        {{$student->nombre_escala}}
    </td>
    <td class="faltas-width text-right">
        {{$student->faltas}}
    </td>
    <td class="faltas-width text-right">
        {{$student->injustificadas}}
    </td>
    <td class="faltas-width text-right">
        {{$student->retraso}}
    </td>
</tr>
@else
    @if($areaId != $student->cod_area)
        <tr>
            <td class="text-left td-color" colspan="2">
                <b>{{trim($student->area)}}</b>
            </td>
            <td class="text-right td-color" colspan="5">
                <b>PROMEDIO: <x-notes.average-area :db="$db" :year="$year" :enrolledId="$student->id_matric"
                                                   :areaId="$student->cod_area" :gradeId="$student->cod_grado" /></b>
            </td>
        </tr>
    @endif
    <tr>
        <td class="subject-name">
            {{trim($student->asignatura)}}
        </td>
        <td class="text-right ih-width">
            {{$student->ih}}
        </td>
        <td class="text-right final-note">
            {{number_format($student->final, 2)}}
        </td>
        <td class="scale-width">
            {{$student->nombre_escala}}
        </td>
        <td class="faltas-width text-right">
            {{$student->faltas}}
        </td>
        <td class="faltas-width text-right">
            {{$student->injustificadas}}
        </td>
        <td class="faltas-width text-right">
            {{$student->retraso}}
        </td>
    </tr>
@endif