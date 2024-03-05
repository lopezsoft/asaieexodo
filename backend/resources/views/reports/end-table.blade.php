    </tbody>
@if($isAreaDistributed)
    <tfoot>
    <tr>
        <td class="text-left">
            <b>TOTAL HORAS</b>
        </td>
        <td class="text-center ih-width-d">
            <b>{{number_format($sumIH)}}</b>
        </td>
        <td class="subject-name">
            <b></b>
        </td>
        <td class="text-center ih-width-d">
            <b>{{number_format($sumIH2)}}</b>
        </td>
        <td class="text-center final-note">
            <b></b>
        </td>
        <td class="text-center scale-width">
            <b></b>
        </td>
    </tr>
    </tfoot>
@endif
</table>
@php
    $sumIH = 0;
    $sumIH2 = 0;
    $average = 0;
@endphp
