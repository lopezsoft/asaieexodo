<?php
    $count  = 0;
?>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link rel="stylesheet" type="text/css" href="{{ asset('css/report-base.css') }}" >
        <link rel="stylesheet" type="text/css" href="{{ asset('css/observer.css') }}" >
        <title>Ficha del observador</title>
    </head>
	<body>
        @include('reports.observer.header')
        @include('reports.observer.student-information')
        @include('reports.observer.student-preferences')
        @include('reports.observer.follow-up-report')
        @if(count($annotations) > 0)
            @include('reports.observer.annotations')
        @endif
        @include('reports.observer.signature')
	</body>
</html>
