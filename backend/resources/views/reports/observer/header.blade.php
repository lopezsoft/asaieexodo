<div class="observer-content" align="center">
    <div style="padding-top: 38px">
        {!! $observerData->encabezado !!}
    </div>
    <div>
        <img src="{{$storagePath}}{{$header->logo}}" alt="" class="image-observer">
    </div>
    <div>
        <img src="{{$image}}" alt="" class="image-observer">
    </div>
    <div class="body-observer">
        {!! $observerBody !!}
    </div>
</div>
<pagebreak>
