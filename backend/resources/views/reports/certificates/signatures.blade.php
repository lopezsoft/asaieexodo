<div class="date-signature-content">
    {!!nl2br($certificateHeader->expedition)!!}{{getCurrentDateSignature()}}
</div>

<table class="table-signatures">
    <tbody>
        @if($certificateHeader->rector_firm === 1 && $certificateHeader->signature_secretary === 1)
        <tr class="td-50">
            <td class="text-center">
                @include('reports.signatures.signature-director')
            </td>
            <td class="text-center">
                @include('reports.signatures.signature-secretary')
            </td>
        </tr>
        @endif
        @if($certificateHeader->rector_firm === 1 && $certificateHeader->signature_secretary === 0)
            <tr>
                <td class="text-center">
                    @include('reports.signatures.signature-director')
                </td>
            </tr>
        @endif
        @if($certificateHeader->rector_firm === 0 && $certificateHeader->signature_secretary === 1)
            <tr>
                <td class="text-center">
                    @include('reports.signatures.signature-secretary')
                </td>
            </tr>
        @endif
    </tbody>
</table>
