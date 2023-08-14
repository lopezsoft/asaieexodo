<tr>
    <td class="subject-name">
        {{trim($student->area)}}({{trim($student->asignatura)}})
    </td>
    <td class="text-right ih-width">
        {{$student->ih}}
    </td>
    <td class="text-right final-note">
        {{number_format($student->final, 2)}}
    </td>
    <td class="scale-width">
        {{$student->nombre_escala ?? $student->conceptual}}
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
