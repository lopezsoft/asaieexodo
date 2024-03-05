<?php
    $totalNotes = count($studentList);
    $count      = 0;
    $enrolledId = 0;
    $areaId     = 0;
    $showHeader = true;
    $oldStudent = null;
    $sumIH      = 0;
    $sumIH2     = 0;
    $average    = 0;
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
                @if($isAreaDistributed)
                @if($subjectCertificate && countSubjectCertificates($subjectCertificate, $student->id_asign ?? 0) > 0)
                    @php
                        $subjectId      = $student->id_asign;
                        $subjects       = $subjectCertificate->where('subject_parent_id', $subjectId);
                        $totalSubjects  = count($subjects);
                        $countSubjects  = 0;
                    @endphp
                    @foreach($subjects as $subject)
                        @php
                            $countSubjects++;
                            $sumIH2 += $subject->ih;
                        @endphp
                        <tr>
                            @if($countSubjects == 1)
                                <td class="subject-name" rowspan="{{$totalSubjects}}">
                                    {{trim($student->area)}}
                                </td>
                                <td class="text-center ih-width" rowspan="{{$totalSubjects}}">
                                    {{number_format($student->ih)}}
                                </td>
                            @endif
                            <td class="subject-name">
                                {{trim($subject->asignatura)}}
                            </td>
                            <td class="text-center ih-width">
                                {{number_format($subject->ih)}}
                            </td>
                            <td class="text-center final-note">
                                {{number_format($student->final, 2)}}
                            </td>
                            <td class="scale-width text-center">
                                {{$student->nombre_escala}}
                            </td>
                        </tr>
                    @endforeach
                @else
                    @php
                        $sumIH2 += $student->ih;
                    @endphp
                    <tr>
                        <td class="subject-name">
                            {{trim($student->area)}}
                        </td>
                        <td class="text-center ih-width">
                            {{number_format($student->ih)}}
                        </td>
                        <td class="subject-name">
                            {{trim($student->asignatura)}}
                        </td>
                        <td class="text-center ih-width">
                            {{number_format($student->ih)}}
                        </td>
                        <td class="text-center final-note">
                            {{number_format($student->final, 2)}}
                        </td>
                        <td class="scale-width text-center">
                            {{$student->nombre_escala}}
                        </td>
                    </tr>
                @endif
            @else
                @include('reports.certificates.student-notes')
                @endif
                @php
                    $areaId = $student->cod_area;
                    $sumIH  += $student->ih;
                @endphp
            @endif
            @if(($loop->last))
                @include('reports.certificates.end-certificate')
            @endif
        @endforeach
	</body>
</html>
