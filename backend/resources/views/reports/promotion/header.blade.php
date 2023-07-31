<header>
    <table class="header-table">
        <tr>
            <td>
                <img src="{{$storagePath}}{{$header->logo}}" alt="" class="img-table">
            </td>
            <td>
                {!! $promotedObservation->titulo !!}
            </td>
            <td>
                <img src="{{$storagePath}}{{ $header->escudo }}" alt="" class="img-table">
            </td>
        </tr>
    </table>
    <table class="header-table">
        <tr>
            <td>
                {!! $promotedObservation->res !!}
            </td>
        </tr>
    </table>
</header>
<section>
    <div class="section-body">
        {!! $promotedObservation->encabezado !!}
    </div>
</section>
<section>
    <div class="section-body">
        {!! $promotedObservation->consta !!}
    </div>
</section>
<section>
    <div class="section-body student-data">
       {!! $promotedObservation->cuerpo !!}
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
