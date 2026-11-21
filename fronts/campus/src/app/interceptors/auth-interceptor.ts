// path: src/app/interceptors/auth.interceptor.ts
// Nota: Es buena práctica nombrar el archivo en minúsculas.

import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import {AuthService} from "../services/auth.service"; // Asegúrate de que la ruta sea correcta

// No se necesita @Injectable() ni implementar una interfaz.
// Es solo una función exportada.
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {

    // 1. Usa inject() para obtener tu servicio, en lugar del constructor.
    const auth = inject(AuthService);
    const token = auth.getToken();

    if (!token) {
        return next(req);
    }

    // 2. La lógica interna para clonar y añadir el header es idéntica.
    const stringToken = `${token.token_type} ${token.access_token}`;
    const req1 = req.clone({
        headers: req.headers.set('Authorization', stringToken)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('Access-Control-Allow-Origin', '*')
            .set('Access-Control-Allow-Credentials', 'true')
            .set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT')
    });

    return next(req1);
}
