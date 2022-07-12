<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro creado con exito</title>
</head>
<body>
    <p>Hola <strong>{{$msg['company_name']}}</strong>, su petición se ha registrado exitosamente.</p>
    <p><strong>Sus nuevas credenciales de acceso son las siguientes:</strong></p>
    <ul>
        <li><strong>Usuario: </strong> {{$msg['email']}} </li>
        <li><strong>Contraseña: </strong> {{$msg['dni']}} </li>
    </ul>
    <br>
    <p><strong><a href={{$msg['url']}} style="color: #170BC5; font-weight: bold">Confirmar cambio de contraseña</a><strong>
    <br>
    <br>
    <br>
    <div style="border: 1px solid rgba(37, 201, 255,.5); display: inline-block; border-radius: 3px;">
        <table style="font-family: arial; height:95px; border-collapse: collapse; border:0">
            <tr>
                <td style="padding: 7px">
                    <img src="https://matias-api.com.co/assets/img/file-api%20256.png"
                        alt=""
                        width="80"
                        height="80"
                        style="display:block; border-radius: 50%; margin-right: 7px; float: left">
                    <div style="width: 5px; height: 80px; background:#75c8fd; float: right">
                </td>
                <td style="vertical-align:top; padding:7px 14px 7px 3px">
                    <strong style="margin: 0; font-size:17px; color: rgba(40, 45, 49,.9); line-height: 24px; height: 24px; display:block">Cordialmente</strong>
                    <strong style="margin: 0; font-size:17px; color: rgba(40, 45, 49,.9); line-height: 24px; height: 24px; display:block">Matias APP</strong>
                    <p style='font-size:12px; margin: 0px 0 6px; height: 30px'>
                        <span style="margin: 0; color: #666">Equipo de soporte</span>
                        <br>
                        <span style="margin: 0; color: #666">310 843 5431</span>
                        <br>
                        <a href='https://matias-api.com.co/' style="color: #25C9FF; font-weight: bold">Sitio web</a>
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
