<table class="total-invoice">
    <tr>
        <th>Detalle de impuestos</th>
    </tr>
</table>
<table class="table-footer">
    <thead>
    <tr>
        <th>Tipo</th>
        <th>Base</th>
        <th>Valor impuesto</th>
        <th>Total</th>
        <th>Descripción</th>
    </tr>
    </thead>
    <tbody>
    @foreach ($taxes as $key => $tax)
        <tr>
            <td class="text-right">{{ "{$tax->rate_abbre}-{$tax->name_taxe}-".number_format($tax->rate_value,0,".",",")."%" }}</td>
            <td class="text-right">{{ "{$saleMaster->Symbol} ".number_format($tax->base, 2,".",",") }}</td>
            <td class="text-right">{{ "{$saleMaster->Symbol} ".number_format($tax->tax_value, 2,".",",") }}</td>
            <td class="text-right">{{ "{$saleMaster->Symbol} ".number_format($tax->total, 2,".",",") }}</td>
            <td>{{ $tax->description }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
