@if(!$isPreSchool)
<table class="table-final-certificate">
    <thead>
        <tr class="td-50">
            <td><b>RESULTADO FINAL DEL ESTUDIANTE</b></td>
            <td style="font-size: 8px"><b>RESULTADO DE LAS ACTIVIDADES DE APOYO PARA LA SUPERACIÓN DE DEBILIDADES</b></td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="text-center">{{$oldStudent->msg}}</td>
            <td rowspan="3">
                <x-notes.final-levelings :db="$db" :year="$year" :enrolledId="$oldStudent->id_matric"/>
            </td>
        </tr>
        <tr>
            <td class="text-center">{{$oldStudent->msg1}}</td>
        </tr>
        <tr>
            <td class="text-center">{{$oldStudent->msg2}}</td>
        </tr>
    </tbody>
</table>
@endif
