<table class="table-information">
    <tr>
        <th colspan="6" class="text-uppercase">Documento soporte en adquisiciones efectuadas a no obligados a facturar</th>
        <td rowspan="3" class="column-invoice-name">
            <span>{{ $saleMaster->invoice_name }}</span> <br>
            <span class="color-red">{{ "Nº. {$saleMaster->prefix} {$saleMaster->invoice_nro}" }}</span>
        </td>
    </tr>
    <tr>
        <th colspan="3">Fecha de operación</th>
        <td>{{ Date("d-m-Y", strtotime($saleMaster->invoice_date))." ".Date("h:i:s A", strtotime($saleMaster->invoice_time)) }}</td>
        <th>Forma de pago</th>
        <td>{{ $saleMaster->payment_method }}</td>
    </tr>
    <tr>
        <th>Moneda</th>
        <td>{{ "{$saleMaster->Money} ({$saleMaster->CurrencyISO})"}}</td>
        <th>Tasa cambio</th>
        <td>{{ "{$saleMaster->Symbol} {$saleMaster->exchange_rate}" }}</td>
        <th>Medio de pago</th>
        <td>{{ $saleMaster->means_name }}</td>
    </tr>
</table>
