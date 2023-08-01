<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link rel="stylesheet" type="text/css" href="{{ asset('css/report-base.css') }}" >
        <link rel="stylesheet" type="text/css" href="{{ asset('css/final-certificate.css') }}" >
        <title>Constancia de estudio</title>
    </head>
	<body>
    @include('reports.certificates.constancy-header')
    <section>
        <div class="section-body student-data">
            {!! $studentData !!}
        </div>
    </section>
    @include('reports.certificates.signatures')
	</body>
</html>
