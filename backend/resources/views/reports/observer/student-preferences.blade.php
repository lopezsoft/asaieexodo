<table class="table-observer">
    <thead>
        <tr>
            <th colspan="6">
                PREFERENCIAS EN CUANTO A:
            </th>
        </tr>
    </thead>
    <tbody>
        <tr class="text-center">
            <td class="text-center">
                <b>Religión:</b>
            </td>
            <td class="text-center">
                <b>Deporte:</b>
            </td>
            <td class="text-center">
                <b>Música:</b>
            </td>
            <td class="text-center">
                <b>Arte:</b>
            </td>
            <td class="text-center">
                <b>Comida:</b>
            </td>
            <td class="text-center">
                <b>Profesión/Oficio:</b>
            </td>
        </tr>
        <tr>
            <td>{{$studentData->religion}}</td>
            <td>{{$studentData->arte}}</td>
            <td>{{$studentData->musica}}</td>
            <td>{{$studentData->deporte}}</td>
            <td>{{$studentData->comida}}</td>
            <td>{{$studentData->prof_oficio}}</td>
        </tr>
    </tbody>
</table>
<table class="table-observer">
    <thead>
    <tr>
        <th colspan="6">
            NIVEL DE DESEMPEÑO EN CUANTO A:
        </th>
    </tr>
    </thead>
    <tbody>
    <tr class="text-center">
        <td class="text-center">
            <b>Motricidad fina:</b>
        </td>
        <td class="text-center">
            <b>Motricidad gruesa:</b>
        </td>
        <td class="text-center">
            <b>U. Temporoespacial:</b>
        </td>
        <td class="text-center">
            <b>Actitud verbal:</b>
        </td>
        <td class="text-center">
            <b>Actitud numérica:</b>
        </td>
        <td class="text-center">
            <b>Liderazgo:</b>
        </td>
    </tr>
    <tr>
        <td>{{$studentData->motricidad_fina}}</td>
        <td>{{$studentData->motricidad_gruesa}}</td>
        <td>{{$studentData->temporo_espacial}}</td>
        <td>{{$studentData->actitud_verval}}</td>
        <td>{{$studentData->artitud_numerica}}</td>
        <td>{{$studentData->liderazgo}}</td>
    </tr>
    <tr>
        <td>
            <b>Comportamiento:</b>
        </td>
        <td colspan="5">
            {{$studentData->comportamiento}}
        </td>
    </tr>
    <tr>
        <td>
            <b>Dislexia:</b>
        </td>
        <td>
            {{$studentData->dislexia}}
        </td>
        <td>
            <b>Disortografía:</b>
        </td>
        <td>
            {{$studentData->disortografia}}
        </td>
        <td>
            <b>Discalculia:</b>
        </td>
        <td>
            {{$studentData->discalculia}}
        </td>
    </tr>
    </tbody>
</table>
