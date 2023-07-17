<table class="table-totals">
    <tr>
        <td colspan="2" rowspan="2">
            <div class="signature-wrapper">
                <span>{{ $sale->saleResolution->resolution->signature_one ?? $saleMaster->username }}</span>
                <hr>
                <div>Elaboró</div>
            </div>
        </td>
        <td colspan="2" rowspan="2">
            <div class="signature-wrapper">
                <span>{{ $sale->saleResolution->resolution->signature_two ?? $saleMaster->username }}</span>
                <hr>
                <div>Aprobó</div>
            </div>
        </td>
        <td class="total-text no-bottom-border">Subtotal Precio Unitario (=)</td>
        <td class="total-values text-right no-bottom-border border-right">{{ "{$saleMaster->Symbol} ".number_format($spu,2,".",",") }}</td>
    </tr>
    <tr>
        <td class="total-text">Descuentos detalle (-)</td>
        <td class="total-values text-right border-right">{{ "{$saleMaster->Symbol} ".number_format($discount,2,".",",") }}</td>
    </tr>
    <tr>
        <td class="no-bottom-border">Retefuente:</td>
        <td class="no-bottom-border">ICA:</td>
        <td class="no-bottom-border">Abono:</td>
        <td class="no-bottom-border color-red">Saldo:</td>
        <td class="total-text no-bottom-border">Subtotal Base gravable (=)</td>
        <td class="total-values text-right no-bottom-border border-right">{{ "{$saleMaster->Symbol} ".number_format($sbg + $saleMaster->othertax, 2,".",",") }}</td>
    </tr>
    <tr>
        <td class="text-right">{{ $saleMaster->rfte > 0 ? "{$saleMaster->Symbol} ".$saleMaster->rfte : "" }}</td>
        <td class="text-right">{{ $saleMaster->rica > 0 ? "{$saleMaster->Symbol} ".$saleMaster->rica : "" }}</td>
        <td class="text-right">{{ $saleMaster->payment_value > 0 ? "{$saleMaster->Symbol} ".$saleMaster->payment_value : "" }}</td>
        <td class="text-right">{{ $saleMaster->payment_method_id === 2 ? "{$saleMaster->Symbol} ".$saleMaster->total - $saleMaster->payment_value : "" }}</td>
        <td class="total-text no-bottom-border">Total impuesto (+)</td>
        <td class="total-values text-right no-bottom-border border-right">{{ "{$saleMaster->Symbol} ".number_format($totalTax + $saleMaster->othertax, 2,".",",")}}</td>
    </tr>
    <tr>
        <td rowspan="5" colspan="4">
            <table class="content-cufe">
                <tr>
                    <td rowspan="2" class="img-qrcode">
                        <img src="{{ $cufe }}" alt="" class="img-qrcode">
                    </td>
                    <td>
                        {{ strlen($saleMaster->cufe) > 30 ? "CUFE: {$saleMaster->cufe}" : "" }}
                        {{ isset($saleMaster->cude) ? "CUDE: {$saleMaster->cude}" : "" }}
                    </td>
                </tr>
                <tr>
                    <td>{{ $letters }}</td>
                </tr>
            </table>
        </td>
        <td class="total-text">Total mas impuesto (=)</td>
        <td class="total-values text-right border-right">{{ "{$saleMaster->Symbol} ".number_format($totalLine + $saleMaster->othertax, 2,".",",")}}</td>
    </tr>
    <tr>
        <td class="total-text no-bottom-border">Descuento Global (-)</td>
        <td class="total-values text-right no-bottom-border border-right">{{ "{$saleMaster->Symbol} ".number_format($saleMaster->total_allowance ?? 0,2,".",",") }}</td>
    </tr>
    <tr>
        <td class="total-text no-bottom-border">Recargo Global (+)</td>
        <td class="total-values text-right no-bottom-border border-right">{{ "{$saleMaster->Symbol} ".number_format($saleMaster->total_charges ?? 0,2,".",",") }}</td>
    </tr>
    <tr>
        <td class="total-text color-red">Valor total (=)</td>
        <td class="total-values text-right border-right color-red">{{ "{$saleMaster->Symbol} ".number_format($saleMaster->total, 2,".",",") }}</td>
    </tr>
    <tr>
        <td class="total-text">Fecha de Impresión</td>
        <td class="total-values text-right border-right">{{ Date('d-m-y h:i:s A') }}</td>
    </tr>
</table>
