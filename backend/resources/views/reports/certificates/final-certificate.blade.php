<?php
    $totalNotes = count($studentList);
    $count      = 0;
    $enrolledId = 0;
    $areaId     = 0;
    $showHeader = true;
    $oldStudent = null;
?>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link rel="stylesheet" type="text/css" href="{{ asset('css/report-base.css') }}" >
        <link rel="stylesheet" type="text/css" href="{{ asset('css/final-certificate.css') }}" >
        <title>Certificado final de promoción</title>
    </head>
	<body>
        @foreach($studentList as $student)
            @php
                $showHeader = ($enrolledId != $student->id_matric);
            @endphp
            @if($enrolledId != $student->id_matric)
                @if($enrolledId > 0)
                @include('reports.certificates.end-certificate')
                <pagebreak>
                @endif
                @php
                    $oldStudent     = $student;
                    $enrolledId     = $student->id_matric;
                    $studentData    = CallExecute("{$db}sp_cert_final(?, ?, ?)", [$year,$student->id_matric, $model])[0];
                    $studentData    = $studentData->certificado;
                @endphp
            @include('reports.certificates.final-certificate-header')
            @endif
            @include('reports.certificates.student-data')
            @if($isPreSchool)
                @include('reports.certificates.preschool-student-notes')
            @else
                @include('reports.certificates.student-notes')
                @php
                    $areaId = $student->cod_area;
                @endphp
            @endif
            @if(($loop->last))
                @include('reports.certificates.end-certificate')
            @endif
        @endforeach
	</body>
</html>
