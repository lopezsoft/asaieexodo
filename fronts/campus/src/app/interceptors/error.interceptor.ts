// src/app/interceptors/error.interceptor.ts

import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessagesService } from '../services/messages.service';
import { AuthService } from '../services/auth.service';

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Inyecta los servicios necesarios
  const messagesService = inject(MessagesService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Caso especial: Ignorar errores de un endpoint específico como un health check
      if (error.url?.includes('/health')) {
        return throwError(() => error);
      }

      // Manejo de errores de autenticación y autorización
      switch (error.status) {
        case 401: // No autorizado (token inválido, expirado o no existe)
          messagesService.showError('Tu sesión ha expirado o no es válida.');
          authService.logout(); // El servicio de auth se encarga de limpiar y redirigir
          break;

        case 403: // Prohibido (autenticado pero sin permisos)
          messagesService.showError('No tienes permiso para acceder a este recurso.');
          router.navigate(['/auth/not-authorized']); // O a una página de "acceso denegado"
          break;
      }

      // Para todos los demás errores (404, 500, etc.), muestra un mensaje genérico.
      let errorMessage = 'Ocurrió un error inesperado.';

      // Usa la lógica de parseo mejorada que discutimos
      if (error.error?.errors && typeof error.error.errors === 'object') {
        const fieldErrors = Object.values(error.error.errors);
        if (fieldErrors.length > 0) {
          const firstErrorArray = fieldErrors[0] as string[];
          errorMessage = firstErrorArray.length > 0 ? firstErrorArray[0] : errorMessage;
        }
      } else if (error.error?.message && typeof error.error.message === 'string') {
        errorMessage = error.error.message;
      }

      messagesService.showError(errorMessage);
      // Relanza el error para que los suscriptores puedan reaccionar si es necesario
      return throwError(() => error);
    })
  );
}
