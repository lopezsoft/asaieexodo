<!DOCTYPE html>
<html lang="{{str_replace('', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de usuario exitoso</title>
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }

        .email-wrapper {
            width: 512px;
            background-color: white;
            border: 1px solid #56abe0;
            border-radius: 4px;
            padding: 1rem;
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
        <p>Hola <strong>{{$msg->userName}}</strong>, se ha registrado exitosamente en nuestro sistema.</p>
        <p><strong>Sus credenciales de acceso son las siguientes:</strong></p>
        <ul>
            <li><strong>Usuario: </strong> {{$msg->email}} </li>
            <li><strong>Contraseña: </strong> {{$msg->password}} </li>
        </ul>
        <br>
        <p><strong>Gracias por registrarte! Para continuar, debes confirmar tu cuenta.</strong></p>
        <p>
            <button>
                <a href="{{$msg->url}}" class="btn">Confirmar cuenta</a>
            </button>
        </p>
    </div>

</body>
</html>
