<div class="observer-signature">
    {{$observerData->firma}}{{getCurrentDateSignature()}}
</div>

<table class="table-signatures td-50">
    <tbody>
        <tr>
            <td class="text-center">
                @include('reports.signatures.signature-director')
            </td>
            @if($groupDirectorSignature)
                <td class="text-center">
                    @include('reports.signatures.signature-group-director')
                </td>
            @endif
        </tr>
    </tbody>
</table>
