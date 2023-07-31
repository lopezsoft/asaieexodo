<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link rel="stylesheet" type="text/css" href="{{ asset('css/report-base.css') }}" >
        <link rel="stylesheet" type="text/css" href="{{ asset('css/final-certificate.css') }}" >
        <title>Certificado de promoción anticipada</title>
    </head>
	<body>
        @include('reports.promotion.header')
        <table class="table-final-certificate">
            <thead>
            <tr>
                <td>
                    <b>ÁREAS/ASIGNATURAS</b>
                </td>
                <td class="text-center ih-width">
                    <b>I/H</b>
                </td>
                <td class="text-center final-note">
                    <b>CURSO</b>
                </td>
                <td class="text-center final-note">
                    <b>NOTA</b>
                </td>
                <td class="text-center scale-width">
                    <b>DESEMPEÑO</b>
                </td>
            </tr>
            </thead>
            <tbody>
                @foreach($detailPromoted as $detail)
                    <tr>
                        <td>{{$detail->asignatura}}</td>
                        <td>{{$detail->ih}}</td>
                        <td class="text-center">{{$detail->cod_grado}}-{{$detail->group_id}}</td>
                        <td class="text-right">{{$detail->final}}</td>
                        <td class="text-left">{{$detail->nombre_escala}}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        @include('reports.promotion.footer')
	</body>
</html>
