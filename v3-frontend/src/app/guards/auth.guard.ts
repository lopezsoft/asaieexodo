// path: src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from "../services/auth.service";

// No se necesita @Injectable() ni una clase.
// Es una constante exportada con el tipo CanActivateFn.
export const authGuard: CanActivateFn = (route, state) => {

    // 1. Usa inject() para obtener tus servicios.
    const authService = inject(AuthService);
    const router = inject(Router);

    // 2. La lógica es la misma, pero el resultado es más explícito.
    if (authService.isAuthenticated()) {
        return true; // ✅ El usuario puede continuar.
    }

    // 🛑 Si no está autenticado, retorna un UrlTree para redirigir.
    // Esto es más limpio que llamar a router.navigate() directamente.
    return router.createUrlTree(['/auth']);
};
