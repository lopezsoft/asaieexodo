<table class="table-signatures">
    <tbody>
    @if($signatures->firmarector === 1 && $signatures->firmasecre === 1)
        <tr class="td-50">
            <td class="text-center">
                @include('reports.signatures.signature-director')
            </td>
            <td class="text-center">
                @include('reports.signatures.signature-secretary')
            </td>
        </tr>
    @endif
    @if($signatures->firmarector === 1 && $signatures->firmasecre === 0)
        <tr>
            <td class="text-center">
                @include('reports.signatures.signature-director')
            </td>
        </tr>
    @endif
    @if($signatures->firmarector === 0 && $signatures->firmasecre === 1)
        <tr>
            <td class="text-center">
                @include('reports.signatures.signature-secretary')
            </td>
        </tr>
    @endif
    </tbody>
</table>

