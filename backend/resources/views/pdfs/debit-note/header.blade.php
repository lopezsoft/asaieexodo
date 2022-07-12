<table style="width: 100%;">
    <tbody>
        <tr>
            <td style="width: 30%; text-align: center;">
                <p style="font-size: 11px; font-weight: 700;">NOTA DEBITO DE LA FACTURA</p>
                <p style="font-size: 10px; font-weight: 700;">ELECTRONICA DE VENTA No</p>
                <p style="color: red; font-weight: bold; font-size: 16px; display: block; margin: 20px 0;">{{$resolution->prefix}} - {{$request->number}}</p>
                <p style="font-size: 8px;">Fecha Validacion DIAN: {{$date}}<br>
                    Hora Validacion DIAN: {{$time}}</p>
            </td>
            <td style="width: 40%; text-align: center;">
                <div id="empresa-header">
                    <strong>{{$user->name}}</strong><br>
                    @if(isset($request->establishment_name))
                        <strong>{{$request->establishment_name}}</strong><br>
                    @endif
                </div>
                <div id="empresa-header1">
                    @if(isset($request->ivaresponsable))
                        @if($request->ivaresponsable != $company->type_regime->name)
                            NIT: {{$company->identification_number}}-{{$company->dv}} - {{$company->type_regime->name}} - {{$request->ivaresponsable}} - {{$company->type_liability->name}}
                        @else
                            NIT: {{$company->identification_number}}-{{$company->dv}} - {{$company->type_regime->name}} - {{$company->type_liability->name}}
                        @endif
                    @else
                        NIT: {{$company->identification_number}} - {{$company->type_regime->name}} - {{$company->type_liability->name}}
                    @endif
                    @if(isset($request->nombretipodocid))
                        Tipo Documento ID: {{$request->nombretipodocid}}<br>
                    @endif
                    @if(isset($request->tarifaica) && $request->tarifaica != '100')
                        TARIFA ICA: {{$request->tarifaica}}%
                    @endif
                    @if(isset($request->tarifaica) && isset($request->actividadeconomica))
                        -
                    @endif
                    @if(isset($request->actividadeconomica))
                        ACTIVIDAD ECONOMICA: {{$request->actividadeconomica}}<br>
                    @else
                        <br>
                    @endif
                    @if(isset($request->seze))
                        <?php
                            $aseze = substr($request->seze, 0, strpos($request->seze, '-', 0));
                            $asociedad = substr($request->seze, strpos($request->seze, '-', 0) + 1);
                        ?>
                        Regimen SEZE Año: {{$aseze}} Constitucion Sociedad Año: {{$asociedad}}<br>
                    @endif
                    REPRESENTACION GRAFICA DE NOTA DEBITO ELECTRONICA<br>
                    @if(isset($request->establishment_address))
                        {{$request->establishment_address}} -
                    @else
                        {{$company->address}} -
                    @endif
                    @inject('municipality', 'App\Municipality')
                    @if(isset($request->establishment_municipality))
                        {{$municipality->findOrFail($request->establishment_municipality)['name']}} - {{$municipality->findOrFail($request->establishment_municipality)['department']['name']}} -
                    @else
                        {{$company->municipality->name}} - {{$municipality->findOrFail($company->municipality->id)['department']['name']}} -
                    @endif
                    {{$company->country->name}}
                    @if(isset($request->establishment_phone))
                        Telefono - {{$request->establishment_phone}}<br>
                    @else
                        Telefono - {{$company->phone}}<br>
                    @endif
                    @if(isset($request->establishment_email))
                        E-mail: {{$request->establishment_email}} <br>
                    @else
                        E-mail: {{$user->email}} <br>
                    @endif
                </div>
            </td>
            <td style="width: 30%; text-align: right;">
                <img src="{{$imgLogo}}" style="width: 136px; height: auto;" alt="logo">
            </td>
        </tr>
    </tbody>
</table>
