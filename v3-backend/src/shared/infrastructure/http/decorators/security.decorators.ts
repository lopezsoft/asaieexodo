import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { CommunityRole } from '../../../../modules/iam/domain/enums/community-role.enum';
import { ActiveTenantContext } from '../../../application/context/tenant-context.service';

export const IS_PUBLIC_KEY = 'asaie:is_public';
export const ROLES_KEY = 'asaie:allowed_roles';
export const RATE_LIMIT_KEY = 'asaie:rate_limit';
export const REQUIRED_PERMISSIONS_KEY = 'asaie:required_permissions';
export const REQUIRED_ANY_PERMISSIONS_KEY = 'asaie:required_any_permissions';
export const REQUIRED_MODULE_KEY = 'asaie:required_module';

export interface RateLimitPolicy {
  readonly maxRequests: number;
  readonly windowSeconds: number;
}

/**
 * Marca un endpoint como publico para omitir JwtAuthGuard.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Restringe un endpoint a los roles institucionales especificados (evaluado por RolesGuard).
 */
export const Roles = (...roles: CommunityRole[]) =>
  SetMetadata(ROLES_KEY, roles);

/**
 * Exige que el usuario autenticado posea TODOS los permisos atómicos indicados (evaluado por PermissionsGuard).
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);

/**
 * Exige que el usuario autenticado posea AL MENOS UNO de los permisos atómicos indicados (evaluado por PermissionsGuard).
 */
export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(REQUIRED_ANY_PERMISSIONS_KEY, permissions);

/**
 * Exige que el módulo del colegio esté habilitado en `school_modules` (evaluado por PermissionsGuard).
 */
export const RequireModule = (moduleTag: string) =>
  SetMetadata(REQUIRED_MODULE_KEY, moduleTag);

/**
 * Aplica limite de peticiones por IP/ruta usando Redis (evaluado por RateLimitGuard).
 */
export const RateLimit = (maxRequests: number, windowSeconds: number) =>
  SetMetadata(RATE_LIMIT_KEY, {
    maxRequests,
    windowSeconds,
  } satisfies RateLimitPolicy);

/**
 * Extrae el principal autenticado y verificado por JwtAuthGuard desde la peticion HTTP.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ActiveTenantContext => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: ActiveTenantContext }>();
    return request.user as ActiveTenantContext;
  },
);
