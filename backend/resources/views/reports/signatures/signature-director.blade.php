@if($isScannedSignature)
    <div class="signature-content">
        <img class="signature-content-img" src="{{$storagePath}}{{$signatures->firma_escaneada}}" alt=""/>
        {!!nl2br($signatures->firma1)!!}
    </div>
@else
    {!!nl2br($signatures->firma1)!!}
@endif
