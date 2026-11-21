import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommunityRole } from '../../../../modules/iam/domain/enums/community-role.enum';
import { ActiveTenantContext } from '../../../application/context/tenant-context.service';
import { TenantAccessDeniedException } from '../../../domain/exceptions/tenant-access-denied.exception';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../decorators/security.decorators';

/**
 * Guard global de autorizacion basada en roles (RBAC) para la comunidad educativa.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<CommunityRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: ActiveTenantContext }>();
    const activeRole = request.user?.activeRole;

    if (!activeRole || !requiredRoles.includes(activeRole)) {
      throw new TenantAccessDeniedException(
        `El rol activo (${activeRole ?? 'NONE'}) no cuenta con permisos suficientes para esta operación.`,
      );
    }

    return true;
  }
}
