<table width="100%">
    <tr>
        <td style="width: 25%;" class="text-center vertical-align-top">
            <div id="reference">
                <p style="font-weight: 700;"><strong>FACTURA ELECTRONICA DE VENTA No</strong></p>
                <br>
                <p style="color: red;
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 8px;
                    border: 1px solid #000;
                    padding: 5px 8px;
                    line-height: 1;
                    display: inline-block;
                    border-radius: 6px;">{{$resolution->prefix}} - {{$request->number}}</p>
                    <br>
                <p>Fecha Validacion DIAN: {{$date}}<br>
                    Hora Validacion DIAN: {{$time}}</p>
            </div>
        </td>
        <td style="width: 50%; padding: 0 1rem;" class="text-center vertical-align-top">
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
                Resolucion de Facturación Electronica No. {{$resolution->resolution}} <br>
                de {{$resolution->resolution_date}}, Rango {{$resolution->from}} Al {{$resolution->to}} - Vigencia Desde: {{$resolution->date_from}} Hasta: {{$resolution->date_to}}<br>
                REPRESENTACION GRAFICA DE FACTURA ELECTRONICA<br>
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
        <td style="width: 25%; text-align: right;" class="vertical-align-top">
            <img  style="width: 136px; height: auto;" src="{{$imgLogo}}" alt="logo">
        </td>
    </tr>
</table>
<br><br>
