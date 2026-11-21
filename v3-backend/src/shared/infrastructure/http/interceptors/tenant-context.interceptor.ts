import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  ActiveTenantContext,
  TenantContextService,
} from '../../../application/context/tenant-context.service';

/**
 * Interceptor global que propaga el contexto Multi-Tenant verificado por JwtAuthGuard
 * dentro de AsyncLocalStorage (TenantContextService) durante todo el ciclo de vida de la peticion.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: ActiveTenantContext }>();

    if (!request.user) {
      return next.handle();
    }

    const activeContext = request.user;
    return new Observable((subscriber) => {
      this.tenantContext.runWithContext(activeContext, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
