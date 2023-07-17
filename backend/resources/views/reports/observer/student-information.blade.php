<table class="table-observer">
    <thead>
        <tr>
            <th colspan="10">
                INFORMACIÓN DEL ESTUDIANTE
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <b>Estudiante:</b>
            </td>
            <td colspan="3">{{$studentData->nombres}}</td>
            <td colspan="6">{{$studentData->documento}} Nº. {{$studentData->nro_doc_id}} de {{$studentData->mun_e}} - {{$studentData->dpto_e}}</td>
        </tr>
        <tr>
            <td>
                <b>Nº. Matricula:</b>
            </td>
            <td>{{$studentData->nro_matricula}}</td>
            <td>
                <b>Nº. Folio:</b>
            </td>
            <td>{{$studentData->id_folio}}</td>
            <td>
                <b>Libro:</b>
            </td>
            <td>{{$studentData->libro_mat}}</td>
            <td>
                <b>F. Nacimiento:</b>
            </td>
            <td>{{date('d-m-Y',strtotime($studentData->fecha_nacimiento))}}</td>
            <td>
                <b>L. Nacimiento:</b>
            </td>
            <td>{{$studentData->mun}}-{{$studentData->dpto}}</td>
        </tr>
        <tr>
            <td>
                <b>Dirección:</b>
            </td>
            <td colspan="4">{{$studentData->direccion}}</td>
            <td>
                <b>Zona:</b>
            </td>
            <td>{{$studentData->zona}}</td>
            <td>
                <b>Lugar:</b>
            </td>
            <td colspan="2">{{$studentData->mun_u}}-{{$studentData->dpto_u}}</td>
        </tr>
        <tr>
            <td>
                <b>Teléfono:</b>
            </td>
            <td>{{$studentData->telefono}}</td>
            <td>
                <b>Email:</b>
            </td>
            <td colspan="3">{{$studentData->e_mail}}</td>
            <td>
                <b>Estrato:</b>
            </td>
            <td >{{$studentData->estrato}}</td>
            <td>
                <b>Sisben:</b>
            </td>
            <td >{{$studentData->sisben}}</td>
        </tr>
        <tr>
            <td>
                <b>Tipo sangre:</b>
            </td>
            <td>{{$studentData->tipo_sangre}}</td>
            <td>
                <b>Talla:</b>
            </td>
            <td>{{$studentData->talla}}</td>
            <td>
                <b>Peso:</b>
            </td>
            <td>{{$studentData->peso}}</td>
            <td>
                <b>EPS:</b>
            </td>
            <td>{{$studentData->eps}}</td>
            <td>
                <b>IPS</b>
            </td>
            <td>{{$studentData->ips}}</td>
        </tr>
        <tr>
            <td colspan="2">
                <b>Capacidad excepcional:</b>
            </td>
            <td>{{$studentData->capacidad_exp}}</td>
            <td colspan="3">
                <b>Discapacidad:</b>
            </td>
            <td>{{$studentData->discapacidad}}</td>
            <td>
                <b>Etnia:</b>
            </td>
            <td colspan="2">{{$studentData->etnia}}</td>
        </tr>
        <tr>
            <td colspan="2">
                <b>Resguardo:</b>
            </td>
            <td colspan="8">{{$studentData->resguardo}}</td>
        </tr>
    </tbody>
</table>
