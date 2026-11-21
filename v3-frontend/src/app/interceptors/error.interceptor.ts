import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessagesService } from '../services/messages.service';
import { V3UnifiedAuthService } from '../services/v3-unified-auth.service';

const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/confirm-email',
  '/auth/register-school',
  '/auth/registration-catalogs',
];

export function errorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  const messagesService = inject(MessagesService);
  const v3Auth = inject(V3UnifiedAuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.url?.includes('/health')) {
        return throwError(() => error);
      }

      const isPublicAuthRequest = PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
        req.url.includes(endpoint),
      );

      if (error.status === 401 && !isPublicAuthRequest) {
        messagesService.showError(
          'Tu sesión ha expirado o no es válida. Inicia sesión nuevamente.',
        );
        v3Auth.clearLocalSession();
        void router.navigate(['/auth']);
        return throwError(() => error);
      }

      if (error.status === 403) {
        messagesService.showError(
          'No tienes permisos suficientes para acceder a este recurso.',
        );
        void router.navigate(['/auth/not-authorized']);
        return throwError(() => error);
      }

      const errorMessage = extractErrorMessage(error);
      messagesService.showError(errorMessage);
      return throwError(() => error);
    }),
  );
}

function extractErrorMessage(error: HttpErrorResponse): string {
  const rawMessage = error.error?.message;
  if (Array.isArray(rawMessage) && rawMessage.length > 0) {
    return String(rawMessage[0]);
  }
  if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) {
    return rawMessage;
  }
  if (error.error?.errors && typeof error.error.errors === 'object') {
    const fieldErrors = Object.values(
      error.error.errors as Record<string, unknown>,
    );
    const first = fieldErrors[0];
    if (Array.isArray(first) && first.length > 0) {
      return String(first[0]);
    }
  }
  return 'Ocurrió un error inesperado al comunicarse con el servidor.';
}
