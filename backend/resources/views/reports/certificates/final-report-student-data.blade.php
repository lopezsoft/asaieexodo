@if($showHeader)
<table class="table-final-certificate">
    <thead>
    <tr>
        <td>
            <b>ÁREAS/ASIGNATURAS</b>
        </td>
        <td class="text-center ih-width">
            <b>I/H</b>
        </td>
        @if($allPer && !$onlyAreas)
        <td class="text-center ih-width">
            <b>P1</b>
        </td>
        <td class="text-center ih-width">
            <b>P2</b>
        </td>
        <td class="text-center ih-width">
            <b>P3</b>
        </td>
        <td class="text-center ih-width">
            <b>P4</b>
        </td>
        @endif
        <td class="text-center final-note">
            <b>NOTA FINAL</b>
        </td>
        <td class="text-center scale-width">
            <b>DESEMPEÑO</b>
        </td>
        <td class="text-center faltas-width">
            <b>J</b>
        </td>
        <td class="text-center faltas-width">
            <b>I</b>
        </td>
        <td class="text-center faltas-width">
            <b>R</b>
        </td>
    </tr>
    </thead>
    <tbody>
@endif
