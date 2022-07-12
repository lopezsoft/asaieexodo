<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <title>{{ $msg->voucher_name }}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }

        hr {
            width: 100%;
            border-bottom: 1px solid #56abe0;
        }

        table {
            width: 100%;
            border-width: 0;
            border-collapse: collapse;
        }

        .table-notification td {
            border-bottom: 2px solid #3c6ab2;
            border-collapse: collapse;
            height: 6rem;
            border-top-right-radius: 4px;
        }


        .td-icon {
            width: 6rem;
            color: #fff;
            background-color: #3c6ab2;
            text-decoration: none;
        }

        .td-icon img {
            max-width: 5rem;
            text-align: center;
            display:block;
        }


        .table-company td {
            border-collapse: collapse;
        }

        .td-company {
            height: 6rem;
            width: 6rem;
            color: #fff;
            border-radius: 4px;
            padding: 2px;
            text-align: center;
            text-decoration: none;
        }

        .td-image {
            height: auto;
            max-width: 6rem;
        }


        .email-wrapper {
            width: 512px;
            background-color: white;
            border: 1px solid #56abe0;
            border-radius: 4px;
            padding: 1rem;
        }

        .link-color {
            color: #56abe0 !important;
            font-weight: bold;
            text-decoration: none;
        }

        button {
            width: 100%;
            padding: 6px;
            color: #fff;
            border-width: 0;
            background-color: #3c6ab2;
            margin-bottom: 2px;
            border-radius: 4px;
        }

        .btn {
            border-radius: .5rem;
            font-weight: bold;
            text-decoration: none;
            color: #ffffff !important;
            text-align: center;
        }

        p {
            text-align: justify;
            width: 100%;
        }

    </style>
</head>
<body>
<div class="email-wrapper">
        <table class="table-notification">
            <tr>
                <td><span class="link-color">{{ strtoupper($msg->invoice_name) }}</span></td>
                <td class="td-icon">
                    <img src="https://matias.com.co/assets/img/brand/matias-app-white-256.png" alt="">
                </td>
            </tr>
        </table>
        <p>Hola <strong>{{$msg->company_name}}</strong>, se ha generado un documento electrónico desde nuestro sistema, el cual relacionamos a continuación.<br>
            Documento Nº. <b>{{ $msg->invoice_nro }}</b><br>
            Total: <b>{{ $msg->total }}</b>
        </p>
        @if(isset($msg->url))
        <p>
            <button>
                <a href="{{ $msg->url }}" class="btn">Descargar documento del portal DIAN</a>
            </button>
        </p>
        @endif
        <p>
            <button>
                <a href="{{ $msg->url2 }}" class="btn">Representación grafica</a>
            </button>
        </p>
        @if(isset($msg->urlxml))
        <p>
            <button>
                <a href="{{ $msg->urlxml }}" class="btn">Descargar AttachedDocument (XML)</a>
            </button>
        </p>
        @endif
        <p>Para notificar los eventos: acuse de recibo, aceptación y rechazo, se relaciona la siguiente dirección de correo autorespuesta: <br>
            <a href="{{ $msg->email }}" class="link-color">{{ $msg->email }}</a></p>

        <p>Estimado cliente este correo es generado automáticamente, por favor no responda a este mensaje.</p>

        <p>Este mensaje y cualquier archivo adjunto que contenga son confidenciales.
            Si usted no es el destinatario por favor llame o envíe un correo electrónico al relacionado anteriormente
            y bórrelo de su sistema, sin copiar, modificar o divulgar su contenido. Gracias</p>
        <hr>
        <p class="link-color">Documento generado por: <a href="https://matias.com.co" class="link-color"> MATIASAPP</a> </p>
</div>
<br>
<br>
<div class="email-wrapper">
    <table class="table-company">
        <tr>
            <td>
                <table>
                    <tr>
                        <td><span class="link-color">{{ $msg->company->company_name }} - {{ $msg->company->dni }}-{{ $msg->company->dv }}</span></td>
                    </tr>
                    <tr>
                        <td><span>{{ $msg->company->address }}</span></td>
                    </tr>
                    <tr>
                        <td><span class="link-color">{{ $msg->company->email }}</span></td>
                    </tr>
                    <tr>
                        <td><span>{{ $msg->company->mobile }} {{ $msg->company->phone }}</span></td>
                    </tr>
                </table>
            </td>
            <td class="td-company">
                <img src="'{{ $msg->company_image }}'" alt="" class="td-image">
            </td>
        </tr>
    </table>
</div>
</body>
</html>
