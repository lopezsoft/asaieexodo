<table class="total-invoice table-customer-header">
    <tr>
        <th>REFERENCIA</th>
    </tr>
</table>
<table class="table-reference">
    <thead>
        <tr>
            <th>Tipo</th>
            <th>Número</th>
            <th>Fecha</th>
            <th>Justificación</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>{{ trim($saleMaster->type_ref) }}</td>
            <td>{{ "{$saleMaster->prefix_ref}{$saleMaster->invoice_nro_ref}" }}</td>
            <td>{{ Date('d-m-Y', strtotime($saleMaster->date_ref)) }}</td>
            <td>{{ $saleMaster->justification }}</td>
        </tr>
    </tbody>
</table>
