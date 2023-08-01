@php
    $showHeader = true;
    $topMargin  = '';
    if(isset($watermark)){
        $showHeader = ($watermark->hide_header === '0');
        $topMargin  = $watermark->margin_top;
    }
@endphp
@if(!$showHeader)
<div style="height: {{$topMargin}};width: 100%;"></div>
@endif
@if($showHeader)
<header>
    <table class="header-table">
        <tr>
            <td>
                <img src="{{$storagePath}}{{$header->logo}}" alt="" class="img-table">
            </td>
            <td>
                {!! $certificateHeader->header1 !!}
            </td>
            <td>
                <img src="{{$storagePath}}{{ $header->escudo }}" alt="" class="img-table">
            </td>
        </tr>
    </table>
    <table class="header-table">
        <tr>
            <td>
                {!! $certificateHeader->header2 !!}
            </td>
        </tr>
    </table>
</header>
@endif
<section>
    <div class="section-body">
        {!! $certificateHeader->body !!}
    </div>
</section>
<section>
    @if($certificateHeader->show_number == 1)
    <div class="section-body certificate-number">
        {{$certificateHeader->show_number_message}} <b>{{$certificateHeader->cons}}</b>
    </div>
    @endif
    <div class="section-body">
        {!! $certificateHeader->message !!}
    </div>
</section>

