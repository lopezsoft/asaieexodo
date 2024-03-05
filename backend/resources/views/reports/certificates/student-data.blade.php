@if($showHeader)
@if($isAreaDistributed)
<table class="table-final-certificate">
    <thead>
    <tr>
        <td class="text-center" colspan="3">
            <b>ÁREAS DE FORMACIÓN</b>
        </td>
        <td class="text-center ih-width-d">
            <b class="font-size-10">INT. H. S</b>
        </td>
        @if(!$isPreSchool)
            <td class="text-center final-note">
                <b class="font-size-10">JUICIO<br/>CUANTITATIVO</b>
            </td>
        @endif
        <td class="text-center scale-width">
            <b class="font-size-10">JUICIO<br/>VALORATIVO</b>
        </td>
    </tr>
    </thead>
    <tbody>
@else
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
@endif
