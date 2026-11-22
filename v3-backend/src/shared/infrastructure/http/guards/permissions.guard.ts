import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommunityRole } from '../../../../modules/iam/domain/enums/community-role.enum';
import { ActiveTenantContext } from '../../../application/context/tenant-context.service';
import { TenantAccessDeniedException } from '../../../domain/exceptions/tenant-access-denied.exception';
import { RbacPermissionsService } from '../../rbac/rbac-permissions.service';
import {
  IS_PUBLIC_KEY,
  REQUIRED_ANY_PERMISSIONS_KEY,
  REQUIRED_MODULE_KEY,
  REQUIRED_PERMISSIONS_KEY,
} from '../decorators/security.decorators';

/**
 * Guard global de autorización granular basada en permisos atómicos RBAC y módulos activos (`school_modules`).
 * Se ejecuta después de `JwtAuthGuard` y `RolesGuard`.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacPermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredAll = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredAny = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_ANY_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredModule = this.reflector.getAllAndOverride<string>(
      REQUIRED_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (
      (!requiredAll || requiredAll.length === 0) &&
      (!requiredAny || requiredAny.length === 0) &&
      !requiredModule
    ) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: ActiveTenantContext }>();
    const principal = request.user;

    if (!principal?.schoolId || !principal?.userId || !principal?.activeRole) {
      throw new TenantAccessDeniedException(
        'No se encontró un contexto de usuario autenticado para validar permisos RBAC.',
      );
    }

    // SUPER_ADMIN conserva acceso total administrativo multi-colegio
    if (principal.activeRole === CommunityRole.SUPER_ADMIN) {
      return true;
    }

    const resolved = await this.rbacService.resolveEffectiveAccess(
      principal.schoolId,
      principal.userId,
      principal.activeRole,
    );

    if (requiredModule && !resolved.enabledModules.includes(requiredModule)) {
      throw new TenantAccessDeniedException(
        `El módulo institucional '${requiredModule}' se encuentra deshabilitado para esta institución educativa.`,
      );
    }

    const permissionSet = new Set(resolved.permissions);

    if (requiredAll && requiredAll.length > 0) {
      const missing = requiredAll.filter((code) => !permissionSet.has(code));
      if (missing.length > 0) {
        throw new TenantAccessDeniedException(
          `El rol activo (${principal.activeRole}) no cuenta con los permisos requeridos (${missing.join(', ')}) para esta operación.`,
        );
      }
    }

    if (requiredAny && requiredAny.length > 0) {
      const hasAtLeastOne = requiredAny.some((code) => permissionSet.has(code));
      if (!hasAtLeastOne) {
        throw new TenantAccessDeniedException(
          `El rol activo (${principal.activeRole}) no cuenta con ninguno de los permisos autorizados (${requiredAny.join(', ')}) para esta operación.`,
        );
      }
    }

    return true;
  }
}
