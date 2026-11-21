import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { V3UnifiedAuthService } from '../services/v3-unified-auth.service';

export const authGuard: CanActivateFn = () => {
  const v3Auth = inject(V3UnifiedAuthService);
  const router = inject(Router);

  if (v3Auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth']);
};
