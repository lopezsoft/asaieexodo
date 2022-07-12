<table class="table-detail">
    <thead>
    <tr>
        <th colspan="2">CÓDIGO</th>
        <th>DETALLE</th>
        <th>CANT</th>
        <th>U.M</th>
        <th class="price">PRECIO</th>
        <th class="price">DESCUENTO</th>
        <th>IVA</th>
        <th class="total">TOTAL</th>
    </tr>
    </thead>
    <tbody>
    @foreach ($details as $line)
        <tr>
            <td class="text-right count">
                {{ ++$count }}
            </td>
            <td class="text-right code">
                {{ $line->sku ?? $line->internal_code }}
            </td>
            <td>
                {{ $line->detail }}
            </td>
            <td class="text-right amount">
                {{ $line->amount }}
            </td>
            <td class="text-center um">
                {{ $line->abbre_unit }}
            </td>
            <td class="price text-right">
                {{ $line->unit_price }}
            </td>
            <td class="price text-right">
                @if($line->discount > 0)
                    {{ "{$saleMaster->Symbol} ".number_format($line->discount,2,".",",") }}
                @endif
            </td>
            <td class="vat text-right">
                @if ($line->vat > 0)
                    {{ $line->vat }}
                @endif
            </td>
            <td class="total text-right">
                {{ $line->total }}
            </td>
        </tr>
    @endforeach
    </tbody>
</table>
