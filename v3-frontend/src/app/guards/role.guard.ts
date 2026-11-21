import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {
  CommunityRole,
  V3UnifiedAuthService,
} from '../services/v3-unified-auth.service';

/**
 * Guard funcional RBAC que restringe el acceso a rutas lazy-loaded segun el rol activo
 * verificado en el JWT de sesion unificada V3.
 */
export function roleGuard(allowedRoles: readonly CommunityRole[]): CanActivateFn {
  return () => {
    const v3Auth = inject(V3UnifiedAuthService);
    const router = inject(Router);

    if (!v3Auth.isAuthenticated()) {
      return router.createUrlTree(['/auth']);
    }

    const activeRole = v3Auth.activeRole();
    if (!activeRole || !allowedRoles.includes(activeRole)) {
      return router.createUrlTree(['/auth/not-authorized']);
    }

    return true;
  };
}
