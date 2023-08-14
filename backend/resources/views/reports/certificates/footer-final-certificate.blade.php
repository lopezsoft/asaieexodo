@if($isPreSchool)
    <section>
        <div class="section-body student-data text-center">
            <p><b>EL ESTUDIANTE FUE PROMOVIDO AL SIGUIENTE GRADO:</b></p>
        </div>
    </section>
@else
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
@if(strlen($oldStudent->msg3) > 10)
    <section>
        <div class="section-body student-data text-left">
            <span><b>Observación:</b> {!! $oldStudent->msg3 !!}</span>
        </div>
    </section>
@endif
@endif
