<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <title>Registro de empresas</title>
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
            <td><span class="link-color"><h3>{{ strtoupper($subject) }}</h3></span></td>
            <td class="td-icon">
                <img src="https://schools.asaie.co/assets/img/asaie-256.png" alt="">
            </td>
        </tr>
    </table>
    <p>Hola <strong>{{ $msg->userName }}</strong>,  se ha registrado exitosamente en nuestro sistema.<br> Sus credenciales de acceso son las siguientes: <br>
        Usuario: <b>{{ $msg->email }}</b><br>
        Contraseña: <b>{{ $msg->password }}</b>
    </p>
    <p>Gracias por registrarte! Para continuar, debes confirmar tu cuenta.</p>
    <p>
        <button>
            <a href="{{ $msg->url }}" class="btn">Confirmas cuenta</a>
        </button>
    </p>

    <p>Estimado cliente este correo es generado automáticamente, por favor no responda a este mensaje.</p>

    <p>Este mensaje y cualquier archivo adjunto que contenga son confidenciales.
        Si usted no es el destinatario por favor llame o envíe un correo electrónico al relacionado anteriormente
        y bórrelo de su sistema, sin copiar, modificar o divulgar su contenido. Gracias.</p>
    <hr>
    <p class="link-color">Coreo generado por: <a href="https://asaie.co" class="link-color"> ASAIE ÉXODO</a> </p>
</div>
<br>
<br>
<div class="email-wrapper">
    <table class="table-company">
        <tr>
            <td>
                <table>
                    <tr>
                        <td><span class="link-color">LOPEZSOFT S.A.S NIT: 901.091.403-3</span></td>
                    </tr>
                    <tr>
                        <td><span>Dosquebradas, Risaralda</span></td>
                    </tr>
                    <tr>
                        <td><span class="link-color">gerencia@lopezsoft.net.co - soporte@matias.com.co</span></td>
                    </tr>
                    <tr>
                        <td><span>(+57) 310-843-5431</span></td>
                    </tr>
                </table>
            </td>
            <td class="td-company">
                <img src="https://matias.com.co/assets/img/logo-empresa-256.png" alt="" class="td-image">
            </td>
        </tr>
    </table>
</div>
</body>
</html>
