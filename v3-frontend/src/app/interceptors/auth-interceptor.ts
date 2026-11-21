import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { V3UnifiedAuthService } from '../services/v3-unified-auth.service';

/**
 * Interceptor HTTP funcional V3:
 * - Solo adjunta Authorization Bearer a peticiones dirigidas a environment.APIURL (evita fugas a /assets/i18n/ o terceros).
 * - Elimina los headers CORS de respuesta que no deben enviarse en peticiones de navegador.
 * - Preserva automaticamente multipart/form-data cuando req.body es FormData.
 */
export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  const isApiRequest = req.url.startsWith(environment.APIURL);
  if (!isApiRequest) {
    return next(req);
  }

  const v3Auth = inject(V3UnifiedAuthService);
  const accessToken = v3Auth.accessToken();

  let headers = req.headers.set('Accept', 'application/json');

  if (!(req.body instanceof FormData) && !headers.has('Content-Type')) {
    headers = headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers = headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return next(req.clone({ headers }));
}
