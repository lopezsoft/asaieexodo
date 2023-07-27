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
        @if(!$isPreSchool)
        <td class="text-center final-note">
            <b>NOTA FINAL</b>
        </td>
        @endif
        <td class="text-center scale-width">
            <b>DESEMPEÑO</b>
        </td>
    </tr>
    </thead>
    <tbody>
@endif
