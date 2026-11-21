import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CommunityRole } from '../../../../modules/iam/domain/enums/community-role.enum';
import { ActiveTenantContext } from '../../../application/context/tenant-context.service';
import { TenantAccessDeniedException } from '../../../domain/exceptions/tenant-access-denied.exception';
import { PostgresRlsService } from '../../database/postgres-rls.service';
import { IS_PUBLIC_KEY } from '../decorators/security.decorators';

export interface AccessTokenJwtPayload {
  readonly sub: number;
  readonly username: string;
  readonly fullName?: string;
  readonly schoolId: number;
  readonly activeRole: CommunityRole;
  readonly academicYear: number;
  readonly sid?: string;
  readonly tokenType?: string;
}

/**
 * Guard global de autenticacion JWT Multi-Tenant.
 * Valida la firma, el tipo de token ('ACCESS'), la vigencia de la sesion en `auth_sessions`
 * y garantiza que el header opcional `x-school-id` nunca suplante al tenant firmado en el JWT.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly db: PostgresRlsService,
  ) {
    this.jwtSecret = this.configService.get<string>(
      'JWT_SECRET',
      'asaie-v3-super-secret-development-key-change-in-production',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: ActiveTenantContext;
    }>();

    const authHeader = request.headers.authorization;
    const rawHeader = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (!rawHeader || !rawHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Se requiere un token de autenticación Bearer válido.',
      );
    }

    const token = rawHeader.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('El token de autenticación está vacío.');
    }

    let payload: AccessTokenJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<AccessTokenJwtPayload>(
        token,
        { secret: this.jwtSecret },
      );
    } catch {
      throw new UnauthorizedException(
        'El token de autenticación es inválido o ha expirado.',
      );
    }

    if (
      payload.tokenType !== 'ACCESS' ||
      !payload.sub ||
      !payload.schoolId ||
      !payload.activeRole
    ) {
      throw new UnauthorizedException(
        'El token suministrado no corresponde a una sesión de acceso válida.',
      );
    }

    // Si el cliente envia el header opcional x-school-id, jamas se usa como fuente de verdad:
    // si discrepa del schoolId firmado en el JWT se rechaza inmediatamente (proteccion anti-IDOR).
    const headerSchoolRaw = request.headers['x-school-id'];
    const headerSchoolId = Array.isArray(headerSchoolRaw)
      ? headerSchoolRaw[0]
      : headerSchoolRaw;
    if (
      headerSchoolId &&
      String(headerSchoolId).trim() !== '' &&
      String(headerSchoolId).trim() !== String(payload.schoolId)
    ) {
      throw new TenantAccessDeniedException(
        'El encabezado x-school-id no coincide con la institución educativa activa del token JWT.',
      );
    }

    const schoolId = BigInt(payload.schoolId);
    const userId = BigInt(payload.sub);

    // Verificar en PostgreSQL (RLS) que la sesion no haya sido revocada
    if (payload.sid) {
      const sessionValid = await this.db.withTenantTransaction(
        schoolId,
        async (client) => {
          const res = await client.query<{ id: string }>(
            `SELECT id
             FROM auth_sessions
             WHERE id = $1
               AND school_id = $2
               AND user_id = $3
               AND is_revoked = FALSE
               AND expires_at > NOW()
             LIMIT 1`,
            [payload.sid, String(schoolId), String(userId)],
          );
          return (res.rowCount ?? 0) > 0;
        },
      );

      if (!sessionValid) {
        throw new UnauthorizedException(
          'La sesión fue cerrada o revocada. Por favor inicia sesión nuevamente.',
        );
      }
    }

    request.user = {
      schoolId,
      userId,
      username: payload.username,
      fullName: payload.fullName ?? payload.username,
      activeRole: payload.activeRole,
      academicYear: payload.academicYear ?? new Date().getFullYear(),
      sessionId: payload.sid ?? '',
    };

    return true;
  }
}
