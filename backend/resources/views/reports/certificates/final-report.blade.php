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
        <title>Informe final de evaluación</title>
    </head>
	<body>
        @foreach($studentList as $student)
            @php
                $showHeader = ($enrolledId != $student->id_matric);
            @endphp
            @if($enrolledId != $student->id_matric)
                @if($enrolledId > 0)
                @include('reports.certificates.end-final-report')
                <pagebreak>
                @endif
                @php
                    $oldStudent     = $student;
                    $studentData    = $student;
                    $enrolledId     = $student->id_matric;
                @endphp
            {{--@include('reports.header')--}}
            @include('reports.certificates.final-report-header')
            @endif
            @include('reports.certificates.final-report-student-data')
            @if($isPreSchool)
                @include('reports.certificates.preschool-student-notes-final-report')
            @else
                @include('reports.certificates.student-notes-final-report')
                @php
                    $areaId = $student->cod_area;
                @endphp
            @endif
            @if(($loop->last))
                @include('reports.certificates.end-final-report')
            @endif
        @endforeach
	</body>
</html>
