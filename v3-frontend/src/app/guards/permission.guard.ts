import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { V3UnifiedAuthService } from '../services/v3-unified-auth.service';

/**
 * Guard funcional RBAC que exige TODOS los permisos atómicos especificados.
 */
export function permissionGuard(
  requiredPermissions: readonly string[],
): CanActivateFn {
  return () => {
    const v3Auth = inject(V3UnifiedAuthService);
    const router = inject(Router);

    if (!v3Auth.isAuthenticated()) {
      return router.createUrlTree(['/auth']);
    }

    if (!v3Auth.hasAllPermissions(requiredPermissions)) {
      return router.createUrlTree(['/auth/not-authorized']);
    }

    return true;
  };
}

/**
 * Guard funcional RBAC que exige AL MENOS UNO de los permisos atómicos especificados.
 */
export function anyPermissionGuard(
  allowedPermissions: readonly string[],
): CanActivateFn {
  return () => {
    const v3Auth = inject(V3UnifiedAuthService);
    const router = inject(Router);

    if (!v3Auth.isAuthenticated()) {
      return router.createUrlTree(['/auth']);
    }

    if (!v3Auth.hasAnyPermission(allowedPermissions)) {
      return router.createUrlTree(['/auth/not-authorized']);
    }

    return true;
  };
}

/**
 * Guard funcional que bloquea rutas pertenecientes a un módulo deshabilitado en `school_modules`.
 */
export function moduleGuard(moduleTag: string): CanActivateFn {
  return () => {
    const v3Auth = inject(V3UnifiedAuthService);
    const router = inject(Router);

    if (!v3Auth.isAuthenticated()) {
      return router.createUrlTree(['/auth']);
    }

    if (!v3Auth.hasModule(moduleTag)) {
      return router.createUrlTree(['/auth/not-authorized']);
    }

    return true;
  };
}
