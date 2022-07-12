<table class="table-information">
    <tr>
        <th colspan="2">Fecha de emisión</th>
        <td>{{ Date("d-m-Y", strtotime($saleMaster->invoice_date))." ".Date("h:i:s A", strtotime($saleMaster->invoice_time)) }}</td>
        <th colspan="2">Forma de pago</th>
        <td colspan="5">{{ $saleMaster->payment_method }}</td>
        <td rowspan="3" class="column-invoice-name">
            <span>{{ $saleMaster->invoice_name }}</span> <br>
            <span class="color-red">{{ "Nº. {$saleMaster->prefix} {$saleMaster->invoice_nro}" }}</span>
        </td>
    </tr>
    <tr>
        <th colspan="2">Fecha de vencimiento</th>
        <td>{{ Date('d-m-Y', strtotime($saleMaster->expiration_date)) }}</td>
        <th colspan="2">Medio de pago</th>
        <td colspan="5">{{ $saleMaster->means_name }}</td>
    </tr>
    <tr>
        <th>Moneda</th>
        <td>{{ "{$saleMaster->Money} ({$saleMaster->CurrencyISO})"}}</td>
        <th>Tasa cambio</th>
        @if(isset($saleMaster->exchange_rate))
        <td>{{ "{$saleMaster->Symbol} {$saleMaster->exchange_rate}" }}</td>
        @endif
        <th>Plazo</th>
        <td>{{ $saleMaster->time_limit }}</td>
        <th>Tipo operación</th>
        @if(isset($saleMaster->operation_type))
        <td>{{ $saleMaster->operation_type }}</td>
        @endif
    </tr>
</table>
