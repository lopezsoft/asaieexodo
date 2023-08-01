<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link rel="stylesheet" type="text/css" href="{{ asset('css/report-base.css') }}" >
    <link rel="stylesheet" type="text/css" href="{{ asset('css/final-certificate.css') }}" >
    <title>Certificado periódico de notas</title>
</head>
<body>
    @include('reports.certificates.constancy-header')
    <section>
        <div class="section-body student-data">
            {!! $studentData !!}{!! $certificateHeader->resolution !!}
        </div>
    </section>
    <table class="table-final-certificate">
        <thead>
        <tr>
            <td style="width: 60px">
                <b>ESCALA:</b>
            </td>
            <td class="text-center">
                {{$ratingScale}}
            </td>
        </tr>
        </thead>
    </table>
    <table class="table-final-certificate">
        <thead>
        <tr>
            <td>
                <b>ÁREAS/ASIGNATURAS</b>
            </td>
            <td class="text-center ih-width">
                <b>PER</b>
            </td>
            <td class="text-center ih-width">
                <b>I/H</b>
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
        @foreach($studentNotes as $detail)
            <tr>
                <td>{{$detail->asignatura}}</td>
                <td class="text-center">{{$detail->periodo}}</td>
                <td class="text-right">{{$detail->ih}}</td>
                <td class="text-right">{{$detail->final}}</td>
                <td class="text-left">{{$detail->nombre_escala}}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
    @include('reports.certificates.signatures')
</body>
</html>
