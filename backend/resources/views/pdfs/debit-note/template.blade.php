<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width"/>
    {{-- <title>NOTA DEBITO ELECTRONICA Nro: {{$resolution->prefix}} - {{$request->number}}</title> --}}
</head>
<body margin-top:50px>
    @if(isset($request->head_note))
    <div class="row">
        <div class="col-sm-12">
            <table class="table table-bordered table-condensed table-striped table-responsive">
                <thead>
                    <tr>
                        <th class="text-center"><p><strong>{{$request->head_note}}<br/>
                    </tr>
                </thead>
            </table>
        </div>
    </div>
    @endif
    <table style="width: 100%;">
        <tbody>
            <tr>
                <td>
                    <table style="width: 100%; font-size: 12px;">
                        <tbody>
                            <tr>
                                <td>CC o NIT:</td>
                                <td>{{$customer->company->identification_number}}-{{$request->customer['dv'] ?? NULL}} </td>
                            </tr>
                            <tr>
                                <td>Cliente:</td>
                                <td> {{$customer->name}}</td>
                            </tr>
                            <tr>
                                <td>Regimen:</td>
                                <td> {{$customer->company->type_regime->name}}</td>
                            </tr>
                            <tr>
                                <td>Obligación:</td>
                                <td> {{$customer->company->type_liability->name}}</td>
                            </tr>
                            <tr>
                                <td>Dirección:</td>
                                <td>{{$customer->company->address}}</td>
                            </tr>
                            <tr>
                                <td>Ciudad:</td>
                                <td> {{$customer->company->municipality->name}} - {{$customer->company->country->name}} </td>
                            </tr>
                            <tr>
                                <td>Telefono:</td>
                                <td>{{$customer->company->phone}}</td>
                            </tr>
                            <tr>
                                <td>Email:</td>
                                <td>{{$customer->email}}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
                <td style="width: 50%; text-align: right;">
                    <img style="width: 160px; height: auto;" src="{{$imageQr}}">
                </td>
            </tr>
        </tbody>
    </table>
    <br><br>
    <table class="table" style="width: 100%">
        <tbody>
            <tr>
                <td style="text-align: center; padding: 15px 0;">
                    <?php $billing_reference = json_decode(json_encode($request->billing_reference)) ?>
                    <p style="font-size: 10px; font-weight: bold;">Referencia: {{$billing_reference->number}} - Fecha: {{$billing_reference->issue_date}}</p>
                    <p style="font-size: 10px; font-weight: bold;">CUFE: {{$billing_reference->uuid}}</p>
                </td>
            </tr>
        </tbody>
    </table>

    <br><br>
    <table class="table" style="width: 100%;">
        <thead>
            <tr>
                <th class="text-center">#</th>
                <th class="text-center">Código</th>
                <th class="text-center">Descripcion</th>
                <th class="text-center">Cantidad</th>
                <th class="text-center">UM</th>
                <th class="text-center">Val. Unit</th>
                <th class="text-center">IVA/IC</th>
                <th class="text-center">Dcto</th>
                <th class="text-center">Val. Item</th>
            </tr>
        </thead>
        <tbody>
            <?php $ItemNro = 0; ?>
            @foreach($request['debit_note_lines'] as $item)
                <?php $ItemNro = $ItemNro + 1; ?>
                <tr>
                    @inject('um', 'App\UnitMeasure')
                    <td>{{$ItemNro}}</td>
                    <td>{{$item['code']}}</td>
                    <td>
                        @if(isset($item['notes']))
                            {{$item['description']}}
                            <p style="font-style: italic; font-size: 7px"><strong>Nota: {{$item['notes']}}</strong></p>
                        @else
                            {{$item['description']}}
                        @endif
                    </td>
                    <td class="text-right">{{number_format($item['invoiced_quantity'], 2)}}</td>
                    <td class="text-right">{{$um->findOrFail($item['unit_measure_id'])['name']}}</td>
                    <td class="text-right">{{number_format($item['price_amount'], 2)}}</td>
                    @if(isset($item['tax_totals'][0]['tax_amount']))
                        <td class="text-right">{{number_format($item['tax_totals'][0]['tax_amount'], 2)}}</td>
                    @else
                        <td class="text-right">{{number_format(0, 2)}}</td>
                    @endif
                    @if(isset($item['allowance_charges']))
                        <td class="text-right">{{number_format($item['allowance_charges'][0]['amount'], 2)}}</td>
                    @else
                        <td class="text-right">{{number_format("0", 2)}}</td>
                    @endif
                    <td class="text-right">{{number_format($item['invoiced_quantity'] * $item['price_amount'], 2)}}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <br><br>

    <table class="table" style="width: 100%;">
        <thead>
            <tr>
                <th class="text-center">Impuestos</th>
                <th class="text-center">Retenciones</th>
                <th class="text-center">Totales</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="width: 33.33%;">
                    <table class="table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th class="text-center">Tipo</th>
                                <th class="text-center">Base</th>
                                <th class="text-center">Porcentaje</th>
                                <th class="text-center">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            @if(isset($request->tax_totals))
                                <?php $TotalImpuestos = 0; ?>
                                @foreach($request->tax_totals as $item)
                                    <tr>
                                        <?php $TotalImpuestos = $TotalImpuestos + $item['tax_amount'] ?>
                                        @inject('tax', 'App\Tax')
                                        <td>{{$tax->findOrFail($item['tax_id'])['name']}}</td>
                                        <td>{{number_format($item['taxable_amount'], 2)}}</td>
                                        <td>{{number_format($item['percent'], 2)}}%</td>
                                        <td>{{number_format($item['tax_amount'], 2)}}</td>
                                    </tr>
                                @endforeach
                            @else
                                <?php $TotalImpuestos = 0; ?>
                            @endif
                        </tbody>
                    </table>
                </td>
                <td style="width: 33.33%;">
                    <table class="table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th class="text-center">Tipo</th>
                                <th class="text-center">Base</th>
                                <th class="text-center">Porcentaje</th>
                                <th class="text-center">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php $TotalRetenciones = 0; ?>
                            @if(isset($withHoldingTaxTotal))
                                @foreach($withHoldingTaxTotal as $item)
                                    <tr>
                                        <?php $TotalRetenciones = $TotalRetenciones + $item['tax_amount'] ?>
                                        @inject('tax', 'App\Tax')
                                        <td>{{$tax->findOrFail($item['tax_id'])['name']}}</td>
                                        <td>{{number_format($item['taxable_amount'], 2)}}</td>
                                        <td>{{number_format($item['percent'], 2)}}%</td>
                                        <td>{{number_format($item['tax_amount'], 2)}}</td>
                                    </tr>
                                @endforeach
                            @endif
                        </tbody>
                    </table>
                </td>
                <td style="width: 33.33%;">
                    <table class="table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th class="text-center">Concepto</th>
                                <th class="text-center">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Nro Lineas:</td>
                                <td>{{$ItemNro}}</td>
                            </tr>
                            <tr>
                                <td>Base:</td>
                                <td>{{number_format($request->requested_monetary_totals['line_extension_amount'], 2)}}</td>
                            </tr>
                            <tr>
                                <td>Impuestos:</td>
                                <td>{{number_format($TotalImpuestos, 2)}}</td>
                            </tr>
                            <tr>
                                <td>Retenciones:</td>
                                <td>{{number_format($TotalRetenciones, 2)}}</td>
                            </tr>
                            <tr>
                                <td>Descuentos:</td>
                                <td>{{number_format($request->requested_monetary_totals['allowance_total_amount'], 2)}}</td>
                            </tr>
                            <tr>
                                <td>Total Nota:</td>
                                <td>{{number_format($request->requested_monetary_totals['payable_amount'] + $request->requested_monetary_totals['allowance_total_amount'], 2)}}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
    <br><br>

    <table style="border-collapse: collapse; width: 100%;">
        <tbody>
            <tr>
                <td>
                    @inject('Varios', 'App\Custom\NumberSpellOut')
                    <p style="font-size: 12px; font-weight: bold;">NOTAS:</p>
                    <p style="font-style: italic; font-size: 9px">{{$notes}}</p>
                    <br>
                    <p style="font-size: 12px; font-weight: bold;">SON: <span style="font-weight: normal;">{{$Varios->convertir(round($request->requested_monetary_totals['payable_amount'] + $request->requested_monetary_totals['allowance_total_amount'], 2), $request->idcurrency)}} M/CTE*********.</span></p>
                </td>
            </tr>
        </tbody>
    </table>
    <br><br>

    <table>
        <tbody>
            <tr>
                <td>
                    @if(isset($request->disable_confirmation_text))
                        @if(!$request->disable_confirmation_text)
                            <p style="font-size: 12px; font-style: italic;">CUALQUIER INQUIETUD SOBRE ESTE DOCUMENTO AL TELEFONO {{$company->phone}} o al e-mail {{$user->email}}<br>
                            <br>
                            <p style="font-size: 10px; font-weight: bold;">FIRMA ACEPTACIÓN:</p><br>
                            <p style="font-size: 10px; font-weight: bold;">CC:</p><br>
                            <p style="font-size: 10px; font-weight: bold;">FECHA:</p>
                        @endif
                    @endif
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>
