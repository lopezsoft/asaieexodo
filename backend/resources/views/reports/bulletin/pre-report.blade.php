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
    <title>PRE-INFORME ESCOLAR PERIÓDICO DE EVALUACIÓN</title>
</head>
<body>
@foreach($studentList as $student)
    @php
        $showHeader = ($enrolledId != $student->id_matric);
    @endphp
    @if($enrolledId != $student->id_matric)
        @if($enrolledId > 0)
            @include('reports.bulletin.end-pre-report')
            <pagebreak>
        @endif
        @php
            $oldStudent     = $student;
            $studentData    = $student;
            $enrolledId     = $student->id_matric;
        @endphp
        @include('reports.header')
        @include('reports.bulletin.pre-report-header')
    @endif
    @include('reports.bulletin.pre-report-student-data')
    @include('reports.bulletin.student-notes-pre-report')
    @if(($loop->last))
        @include('reports.bulletin.end-pre-report')
    @endif
@endforeach
</body>
</html>
