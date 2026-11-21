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
