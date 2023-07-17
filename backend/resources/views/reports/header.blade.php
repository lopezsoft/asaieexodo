<header>
    <table class="header-table">
        <tr>
            <td>
                <img src="{{$storagePath}}{{$header->logo}}" alt="" class="img-invoice">
            </td>
            <td>
                {!! $header->encabezado !!}
            </td>
            <td>
                <img src="{{$storagePath}}{{ $header->escudo }}" alt="" class="img-invoice">
            </td>
        </tr>
    </table>
</header>
