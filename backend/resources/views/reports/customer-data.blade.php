<table class="table-customer">
    <tr>
        <th>Tipo de documento</th>
        <td>{{ $saleMaster->document_name }}</td>
        <th>Teléfono</th>
        <td>{{ "{$saleMaster->mobile} {$saleMaster->phone}" }}</td>
    </tr>
    <tr>
        <th>Número de documento</th>
        <td>{{ "{$saleMaster->dni} {$saleMaster->dv}" }}</td>
        <th>Correo</th>
        <td>{{ $saleMaster->email }}</td>
    </tr>
    <tr>
        <th>Nombre o razón social</th>
        <td colspan="3">{{ $saleMaster->company_name }}</td>
    </tr>
    <tr>
        <th>Tipo de contribuyente</th>
        <td>{{ $saleMaster->typeorganization }}</td>
        <th>Departamento</th>
        <td>{{ $saleMaster->name_department }}</td>
    </tr>
    <tr>
        <th>Régimen contable</th>
        <td>{{ $saleMaster->taxregime }}</td>
        <th>Ciudad</th>
        <td>{{ $saleMaster->name_city }}</td>
    </tr>
    <tr>
        <th>Tipo de responsabilidad</th>
        <td>{{ $saleMaster->taxlevel }}</td>
        <th>Dirección</th>
        <td>{{ $saleMaster->address }}</td>
    </tr>
</table>
