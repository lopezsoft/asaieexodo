import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CommunityRole } from '../../../modules/iam/domain/enums/community-role.enum';
import { ResourceNotFoundException } from '../../domain/exceptions/resource-not-found.exception';
import { TenantAccessDeniedException } from '../../domain/exceptions/tenant-access-denied.exception';
import { PostgresRlsService } from '../database/postgres-rls.service';
import { SmartLoggerService } from '../logging/smart-logger.service';

export interface EffectiveRbacResolution {
  readonly permissions: string[];
  readonly enabledModules: string[];
}

export interface PermissionCatalogEntry {
  readonly id: number;
  readonly code: string;
  readonly moduleGroup: string;
  readonly name: string;
  readonly description: string;
  readonly systemModuleId: number | null;
  readonly systemModuleTag: string | null;
  readonly isSensitive: boolean;
  readonly isSuperAdminOnly: boolean;
}

export interface RolePermissionMatrixEntry {
  readonly permissionCode: string;
  readonly defaultGranted: boolean;
  readonly schoolEffect: 'ALLOW' | 'DENY' | null;
  readonly effectiveGranted: boolean;
  readonly blockedByDisabledModule: boolean;
}

export interface RolesMatrixResponse {
  readonly roles: CommunityRole[];
  readonly catalog: PermissionCatalogEntry[];
  readonly enabledModules: string[];
  readonly matrixByRole: Record<string, RolePermissionMatrixEntry[]>;
}

export interface UserPermissionOverrideEntry {
  readonly permissionCode: string;
  readonly roleEffectiveGranted: boolean;
  readonly userEffect: 'ALLOW' | 'DENY' | null;
  readonly finalEffectiveGranted: boolean;
  readonly blockedByDisabledModule: boolean;
}

export type RbacMembershipAudience =
  | 'DIRECTIVES'
  | 'TEACHERS'
  | 'STUDENTS'
  | 'FAMILIES'
  | 'EXCEPTIONS'
  | 'ALL';

export const RBAC_MEMBERSHIP_AUDIENCES: readonly RbacMembershipAudience[] = [
  'DIRECTIVES',
  'TEACHERS',
  'STUDENTS',
  'FAMILIES',
  'EXCEPTIONS',
  'ALL',
];

const DIRECTIVE_ROLES: readonly string[] = [
  CommunityRole.RECTOR,
  CommunityRole.SECRETARY,
  CommunityRole.COORDINATOR,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.SUPER_ADMIN,
];

const FAMILY_AND_MONITOR_ROLES: readonly string[] = [
  CommunityRole.FAMILY,
  CommunityRole.MONITOR,
];

const ROLE_FILTER_KEYWORDS: ReadonlyArray<{
  role: CommunityRole;
  keywords: readonly string[];
}> = [
  { role: CommunityRole.RECTOR, keywords: ['rector', 'director'] },
  { role: CommunityRole.SECRETARY, keywords: ['secretar'] },
  { role: CommunityRole.COORDINATOR, keywords: ['coord'] },
  { role: CommunityRole.SCHOOL_ADMIN, keywords: ['administrador', 'admin'] },
  { role: CommunityRole.TEACHER, keywords: ['docent', 'profesor', 'teach'] },
  { role: CommunityRole.MONITOR, keywords: ['monitor'] },
  { role: CommunityRole.STUDENT, keywords: ['estudian', 'alumn', 'student'] },
  { role: CommunityRole.FAMILY, keywords: ['acudien', 'famil', 'padre'] },
  { role: CommunityRole.SUPER_ADMIN, keywords: ['super'] },
];

export interface RbacMembershipsSummary {
  readonly totalUsers: number;
  readonly directivesTotal: number;
  readonly byRole: {
    readonly RECTOR: number;
    readonly SECRETARY: number;
    readonly COORDINATOR: number;
    readonly SCHOOL_ADMIN: number;
    readonly TEACHER: number;
    readonly MONITOR: number;
    readonly STUDENT: number;
    readonly FAMILY: number;
  };
  readonly teachersTotal: number;
  readonly studentsTotal: number;
  readonly familiesTotal: number;
  readonly withOverridesTotal: number;
}

export interface ListSchoolMembershipsOptions {
  readonly search?: string;
  readonly roleFilter?: CommunityRole;
  readonly audience?: RbacMembershipAudience;
  readonly filterField?: string;
  readonly filterValue?: string;
  readonly sortField?: string;
  readonly sortDirection?: 'ASC' | 'DESC';
  readonly limit: number;
  readonly offset: number;
}

export interface SchoolUserMembershipRow {
  readonly userId: number;
  readonly documentNumber: string;
  readonly username: string;
  readonly fullName: string;
  readonly email: string | null;
  readonly userIsActive: boolean;
  readonly overridesCount: number;
  readonly memberships: Array<{
    readonly membershipId: number;
    readonly role: CommunityRole;
    readonly isActive: boolean;
    readonly status: string;
    readonly createdAt: string;
  }>;
}

const MANAGEABLE_ROLES: CommunityRole[] = [
  CommunityRole.RECTOR,
  CommunityRole.SECRETARY,
  CommunityRole.COORDINATOR,
  CommunityRole.SCHOOL_ADMIN,
  CommunityRole.TEACHER,
  CommunityRole.MONITOR,
  CommunityRole.STUDENT,
  CommunityRole.FAMILY,
];

const CACHE_TTL_MS = 60_000;

interface CachedResolution {
  readonly expiresAt: number;
  readonly schoolVersion: number;
  readonly data: EffectiveRbacResolution;
}

/**
 * Motor central de resolución y administración RBAC Multi-Tenant.
 * Combina en PostgreSQL 17 (RLS):
 *   1. Catálogo de 82 permisos atómicos (`permissions_catalog`)
 *   2. Módulos activos del colegio (`school_modules` / `system_modules`)
 *   3. Matriz por defecto MEN (`role_default_permissions`)
 *   4. Personalizaciones del colegio por rol (`school_role_permissions`)
 *   5. Excepciones puntuales por usuario (`user_permission_overrides`)
 * con caché en memoria TTL de 60s e invalidación instantánea O(1) por colegio.
 */
@Injectable()
export class RbacPermissionsService {
  private readonly resolutionCache = new Map<string, CachedResolution>();
  private readonly schoolCacheVersions = new Map<string, number>();

  constructor(
    private readonly db: PostgresRlsService,
    private readonly logger: SmartLoggerService,
  ) {}

  /**
   * Invalida instantáneamente el caché RBAC para todos los usuarios del colegio indicado.
   */
  public invalidateSchoolCache(schoolId: bigint): void {
    const key = String(schoolId);
    const nextVersion = (this.schoolCacheVersions.get(key) ?? 0) + 1;
    this.schoolCacheVersions.set(key, nextVersion);

    const prefix = `${key}:`;
    for (const cacheKey of this.resolutionCache.keys()) {
      if (cacheKey.startsWith(prefix)) {
        this.resolutionCache.delete(cacheKey);
      }
    }
  }

  /**
   * Resuelve los permisos efectivos y módulos habilitados para (schoolId, userId, activeRole).
   */
  public async resolveEffectiveAccess(
    schoolId: bigint,
    userId: bigint,
    activeRole: CommunityRole,
  ): Promise<EffectiveRbacResolution> {
    const schoolKey = String(schoolId);
    const currentVersion = this.schoolCacheVersions.get(schoolKey) ?? 0;
    const cacheKey = `${schoolKey}:${String(userId)}:${activeRole}`;
    const cached = this.resolutionCache.get(cacheKey);

    if (
      cached &&
      cached.schoolVersion === currentVersion &&
      cached.expiresAt > Date.now()
    ) {
      return cached.data;
    }

    const resolved = await this.db.withTenantTransaction(
      schoolId,
      async (client) => {
        const modulesRes = await client.query<{ tag: string }>(
          `SELECT sm.tag
             FROM system_modules sm
             LEFT JOIN school_modules scm
               ON scm.school_id = $1 AND scm.system_module_id = sm.id
            WHERE COALESCE(scm.is_active, sm.is_active) = TRUE
            ORDER BY sm.id ASC`,
          [schoolKey],
        );
        const enabledModules = modulesRes.rows.map((r) => r.tag);

        if (activeRole === CommunityRole.SUPER_ADMIN) {
          const allPermsRes = await client.query<{ code: string }>(
            `SELECT code FROM permissions_catalog ORDER BY id ASC`,
          );
          return {
            permissions: allPermsRes.rows.map((r) => r.code),
            enabledModules,
          };
        }

        const permsRes = await client.query<{ code: string }>(
          `SELECT pc.code
             FROM permissions_catalog pc
             LEFT JOIN role_default_permissions rdp
               ON rdp.permission_id = pc.id AND rdp.role = $1
             LEFT JOIN school_role_permissions srp
               ON srp.school_id = $2
              AND srp.role = $1
              AND srp.permission_id = pc.id
             LEFT JOIN user_permission_overrides upo
               ON upo.school_id = $2
              AND upo.user_id = $3
              AND upo.role = $1
              AND upo.permission_id = pc.id
             LEFT JOIN system_modules sm
               ON sm.id = pc.system_module_id
             LEFT JOIN school_modules scm
               ON scm.school_id = $2 AND scm.system_module_id = sm.id
            WHERE pc.is_super_admin_only = FALSE
              AND (
                pc.system_module_id IS NULL
                OR COALESCE(scm.is_active, sm.is_active) = TRUE
              )
              AND (
                CASE
                  WHEN upo.effect IS NOT NULL THEN upo.effect = 'ALLOW'
                  WHEN srp.effect IS NOT NULL THEN srp.effect = 'ALLOW'
                  ELSE (rdp.permission_id IS NOT NULL)
                END
              )
            ORDER BY pc.id ASC`,
          [activeRole, schoolKey, String(userId)],
        );

        return {
          permissions: permsRes.rows.map((r) => r.code),
          enabledModules,
        };
      },
    );

    this.resolutionCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      schoolVersion: currentVersion,
      data: resolved,
    });

    return resolved;
  }

  public async hasPermission(
    schoolId: bigint,
    userId: bigint,
    activeRole: CommunityRole,
    permissionCode: string,
  ): Promise<boolean> {
    const resolved = await this.resolveEffectiveAccess(
      schoolId,
      userId,
      activeRole,
    );
    return resolved.permissions.includes(permissionCode);
  }

  public async hasAnyPermission(
    schoolId: bigint,
    userId: bigint,
    activeRole: CommunityRole,
    permissionCodes: readonly string[],
  ): Promise<boolean> {
    if (permissionCodes.length === 0) {
      return true;
    }
    const resolved = await this.resolveEffectiveAccess(
      schoolId,
      userId,
      activeRole,
    );
    const set = new Set(resolved.permissions);
    return permissionCodes.some((code) => set.has(code));
  }

  public async listPermissionsCatalog(): Promise<PermissionCatalogEntry[]> {
    const res = await this.db.queryGlobal<{
      id: number;
      code: string;
      module_group: string;
      name: string;
      description: string;
      system_module_id: number | null;
      system_module_tag: string | null;
      is_sensitive: boolean;
      is_super_admin_only: boolean;
    }>(
      `SELECT pc.id, pc.code, pc.module_group, pc.name, pc.description,
              pc.system_module_id, sm.tag AS system_module_tag,
              pc.is_sensitive, pc.is_super_admin_only
         FROM permissions_catalog pc
         LEFT JOIN system_modules sm ON sm.id = pc.system_module_id
        ORDER BY pc.id ASC`,
    );

    return res.rows.map((r) => ({
      id: Number(r.id),
      code: r.code,
      moduleGroup: r.module_group,
      name: r.name,
      description: r.description,
      systemModuleId:
        r.system_module_id !== null ? Number(r.system_module_id) : null,
      systemModuleTag: r.system_module_tag,
      isSensitive: Boolean(r.is_sensitive),
      isSuperAdminOnly: Boolean(r.is_super_admin_only),
    }));
  }

  /**
   * Retorna la matriz completa de permisos por rol para la institución activa.
   */
  public async getRolesMatrix(schoolId: bigint): Promise<RolesMatrixResponse> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const schoolKey = String(schoolId);

      const modulesRes = await client.query<{ tag: string }>(
        `SELECT sm.tag
           FROM system_modules sm
           LEFT JOIN school_modules scm
             ON scm.school_id = $1 AND scm.system_module_id = sm.id
          WHERE COALESCE(scm.is_active, sm.is_active) = TRUE
          ORDER BY sm.id ASC`,
        [schoolKey],
      );
      const enabledModules = modulesRes.rows.map((r) => r.tag);
      const enabledModuleSet = new Set(enabledModules);

      const catalogRes = await client.query<{
        id: number;
        code: string;
        module_group: string;
        name: string;
        description: string;
        system_module_id: number | null;
        system_module_tag: string | null;
        is_sensitive: boolean;
        is_super_admin_only: boolean;
      }>(
        `SELECT pc.id, pc.code, pc.module_group, pc.name, pc.description,
                pc.system_module_id, sm.tag AS system_module_tag,
                pc.is_sensitive, pc.is_super_admin_only
           FROM permissions_catalog pc
           LEFT JOIN system_modules sm ON sm.id = pc.system_module_id
          WHERE pc.is_super_admin_only = FALSE
          ORDER BY pc.id ASC`,
      );

      const catalog: PermissionCatalogEntry[] = catalogRes.rows.map((r) => ({
        id: Number(r.id),
        code: r.code,
        moduleGroup: r.module_group,
        name: r.name,
        description: r.description,
        systemModuleId:
          r.system_module_id !== null ? Number(r.system_module_id) : null,
        systemModuleTag: r.system_module_tag,
        isSensitive: Boolean(r.is_sensitive),
        isSuperAdminOnly: Boolean(r.is_super_admin_only),
      }));

      const defaultsRes = await client.query<{
        role: string;
        code: string;
      }>(
        `SELECT rdp.role, pc.code
           FROM role_default_permissions rdp
           INNER JOIN permissions_catalog pc ON pc.id = rdp.permission_id
          WHERE pc.is_super_admin_only = FALSE`,
      );
      const defaultsSet = new Set<string>(
        defaultsRes.rows.map((r) => `${r.role}:${r.code}`),
      );

      const overridesRes = await client.query<{
        role: string;
        code: string;
        effect: 'ALLOW' | 'DENY';
      }>(
        `SELECT srp.role, pc.code, srp.effect
           FROM school_role_permissions srp
           INNER JOIN permissions_catalog pc ON pc.id = srp.permission_id
          WHERE srp.school_id = $1`,
        [schoolKey],
      );
      const schoolOverrideMap = new Map<string, 'ALLOW' | 'DENY'>(
        overridesRes.rows.map((r) => [`${r.role}:${r.code}`, r.effect]),
      );

      const matrixByRole: Record<string, RolePermissionMatrixEntry[]> = {};
      for (const role of MANAGEABLE_ROLES) {
        matrixByRole[role] = catalog.map((perm) => {
          const defaultGranted = defaultsSet.has(`${role}:${perm.code}`);
          const schoolEffect =
            schoolOverrideMap.get(`${role}:${perm.code}`) ?? null;
          const blockedByDisabledModule = Boolean(
            perm.systemModuleTag && !enabledModuleSet.has(perm.systemModuleTag),
          );
          const rawGranted =
            schoolEffect !== null ? schoolEffect === 'ALLOW' : defaultGranted;

          return {
            permissionCode: perm.code,
            defaultGranted,
            schoolEffect,
            effectiveGranted: !blockedByDisabledModule && rawGranted,
            blockedByDisabledModule,
          };
        });
      }

      return {
        roles: MANAGEABLE_ROLES,
        catalog,
        enabledModules,
        matrixByRole,
      };
    });
  }

  /**
   * Actualiza los overrides institucionales (`school_role_permissions`) de un rol específico.
   * Bloquea modificaciones al rol `SUPER_ADMIN` y a permisos reservados `is_super_admin_only`.
   */
  public async updateSchoolRolePermissions(params: {
    schoolId: bigint;
    actorUserId: bigint;
    role: CommunityRole;
    changes: Array<{
      permissionCode: string;
      effect: 'ALLOW' | 'DENY' | 'DEFAULT';
    }>;
  }): Promise<{ updatedCount: number }> {
    if (params.role === CommunityRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'No está permitido modificar la matriz de permisos del rol SUPER_ADMIN.',
      );
    }

    if (params.changes.length === 0) {
      return { updatedCount: 0 };
    }

    const updatedCount = await this.db.withTenantTransaction(
      params.schoolId,
      async (client) => {
        const codes = Array.from(
          new Set(params.changes.map((c) => c.permissionCode)),
        );
        const permRes = await client.query<{
          id: number;
          code: string;
          is_super_admin_only: boolean;
        }>(
          `SELECT id, code, is_super_admin_only
             FROM permissions_catalog
            WHERE code = ANY($1::text[])`,
          [codes],
        );

        const permMap = new Map(permRes.rows.map((r) => [r.code, r]));
        let count = 0;

        for (const change of params.changes) {
          const perm = permMap.get(change.permissionCode);
          if (!perm) {
            throw new BadRequestException(
              `El permiso '${change.permissionCode}' no existe en el catálogo institucional.`,
            );
          }
          if (perm.is_super_admin_only) {
            throw new ForbiddenException(
              `El permiso '${change.permissionCode}' está reservado exclusivamente a SUPER_ADMIN.`,
            );
          }

          if (change.effect === 'DEFAULT') {
            await client.query(
              `DELETE FROM school_role_permissions
                WHERE school_id = $1 AND role = $2 AND permission_id = $3`,
              [String(params.schoolId), params.role, perm.id],
            );
          } else {
            await client.query(
              `INSERT INTO school_role_permissions (
                 school_id, role, permission_id, effect, updated_by_user_id, updated_at
               )
               VALUES ($1, $2, $3, $4, $5, NOW())
               ON CONFLICT (school_id, role, permission_id)
               DO UPDATE SET
                 effect = EXCLUDED.effect,
                 updated_by_user_id = EXCLUDED.updated_by_user_id,
                 updated_at = NOW()`,
              [
                String(params.schoolId),
                params.role,
                perm.id,
                change.effect,
                String(params.actorUserId),
              ],
            );
          }
          count += 1;
        }

        return count;
      },
      {
        userId: params.actorUserId,
        changeReason: `RBAC_ROLE_MATRIX_${params.role}`,
      },
    );

    this.invalidateSchoolCache(params.schoolId);
    this.logger.log('Matriz RBAC de rol actualizada para el colegio', {
      schoolId: String(params.schoolId),
      actorUserId: String(params.actorUserId),
      targetRole: params.role,
      changesCount: updatedCount,
    });

    return { updatedCount };
  }

  /**
   * Restablece un rol del colegio a la matriz por defecto MEN eliminando sus overrides.
   */
  public async resetSchoolRolePermissions(
    schoolId: bigint,
    actorUserId: bigint,
    role: CommunityRole,
  ): Promise<{ deletedCount: number }> {
    if (role === CommunityRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'No está permitido restablecer el rol SUPER_ADMIN.',
      );
    }

    const deletedCount = await this.db.withTenantTransaction(
      schoolId,
      async (client) => {
        const res = await client.query(
          `DELETE FROM school_role_permissions
            WHERE school_id = $1 AND role = $2`,
          [String(schoolId), role],
        );
        return res.rowCount ?? 0;
      },
      { userId: actorUserId, changeReason: `RBAC_RESET_ROLE_${role}` },
    );

    this.invalidateSchoolCache(schoolId);
    return { deletedCount };
  }

  /**
   * Consulta los permisos efectivos y overrides puntuales de un usuario para un rol en el colegio.
   */
  public async getUserOverrides(
    schoolId: bigint,
    targetUserId: bigint,
    role: CommunityRole,
  ): Promise<{
    userId: number;
    role: CommunityRole;
    overrides: UserPermissionOverrideEntry[];
  }> {
    if (role === CommunityRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'No se administran excepciones individuales sobre el rol SUPER_ADMIN.',
      );
    }

    return this.db.withTenantTransaction(schoolId, async (client) => {
      const schoolKey = String(schoolId);
      const membershipCheck = await client.query<{ id: string }>(
        `SELECT id
           FROM user_school_memberships
          WHERE school_id = $1 AND user_id = $2
          LIMIT 1`,
        [schoolKey, String(targetUserId)],
      );
      if (membershipCheck.rowCount === 0) {
        throw new ResourceNotFoundException('SchoolUserMembership', targetUserId);
      }

      const rowsRes = await client.query<{
        code: string;
        module_enabled: boolean;
        default_granted: boolean;
        school_effect: 'ALLOW' | 'DENY' | null;
        user_effect: 'ALLOW' | 'DENY' | null;
      }>(
        `SELECT pc.code,
                (pc.system_module_id IS NULL OR COALESCE(scm.is_active, sm.is_active) = TRUE) AS module_enabled,
                (rdp.permission_id IS NOT NULL) AS default_granted,
                srp.effect AS school_effect,
                upo.effect AS user_effect
           FROM permissions_catalog pc
           LEFT JOIN system_modules sm ON sm.id = pc.system_module_id
           LEFT JOIN school_modules scm
             ON scm.school_id = $1 AND scm.system_module_id = sm.id
           LEFT JOIN role_default_permissions rdp
             ON rdp.permission_id = pc.id AND rdp.role = $2
           LEFT JOIN school_role_permissions srp
             ON srp.school_id = $1 AND srp.role = $2 AND srp.permission_id = pc.id
           LEFT JOIN user_permission_overrides upo
             ON upo.school_id = $1
            AND upo.user_id = $3
            AND upo.role = $2
            AND upo.permission_id = pc.id
          WHERE pc.is_super_admin_only = FALSE
          ORDER BY pc.id ASC`,
        [schoolKey, role, String(targetUserId)],
      );

      const overrides: UserPermissionOverrideEntry[] = rowsRes.rows.map((r) => {
        const blockedByDisabledModule = !r.module_enabled;
        const roleEffectiveRaw =
          r.school_effect !== null
            ? r.school_effect === 'ALLOW'
            : r.default_granted;
        const finalRaw =
          r.user_effect !== null ? r.user_effect === 'ALLOW' : roleEffectiveRaw;

        return {
          permissionCode: r.code,
          roleEffectiveGranted: !blockedByDisabledModule && roleEffectiveRaw,
          userEffect: r.user_effect,
          finalEffectiveGranted: !blockedByDisabledModule && finalRaw,
          blockedByDisabledModule,
        };
      });

      return {
        userId: Number(targetUserId),
        role,
        overrides,
      };
    });
  }

  /**
   * Guarda o elimina excepciones individuales (`user_permission_overrides`) para un usuario y rol.
   */
  public async updateUserOverrides(params: {
    schoolId: bigint;
    actorUserId: bigint;
    targetUserId: bigint;
    role: CommunityRole;
    changes: Array<{
      permissionCode: string;
      effect: 'ALLOW' | 'DENY' | 'INHERIT';
    }>;
  }): Promise<{ updatedCount: number }> {
    if (params.role === CommunityRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'No está permitido aplicar excepciones individuales al rol SUPER_ADMIN.',
      );
    }

    if (params.changes.length === 0) {
      return { updatedCount: 0 };
    }

    const updatedCount = await this.db.withTenantTransaction(
      params.schoolId,
      async (client) => {
        const schoolKey = String(params.schoolId);
        const membershipCheck = await client.query<{ id: string }>(
          `SELECT id
             FROM user_school_memberships
            WHERE school_id = $1 AND user_id = $2
            LIMIT 1`,
          [schoolKey, String(params.targetUserId)],
        );
        if (membershipCheck.rowCount === 0) {
          throw new ResourceNotFoundException(
            'SchoolUserMembership',
            params.targetUserId,
          );
        }

        const codes = Array.from(
          new Set(params.changes.map((c) => c.permissionCode)),
        );
        const permRes = await client.query<{
          id: number;
          code: string;
          is_super_admin_only: boolean;
        }>(
          `SELECT id, code, is_super_admin_only
             FROM permissions_catalog
            WHERE code = ANY($1::text[])`,
          [codes],
        );

        const permMap = new Map(permRes.rows.map((r) => [r.code, r]));
        let count = 0;

        for (const change of params.changes) {
          const perm = permMap.get(change.permissionCode);
          if (!perm) {
            throw new BadRequestException(
              `El permiso '${change.permissionCode}' no existe en el catálogo institucional.`,
            );
          }
          if (perm.is_super_admin_only) {
            throw new ForbiddenException(
              `El permiso '${change.permissionCode}' está reservado exclusivamente a SUPER_ADMIN.`,
            );
          }

          if (change.effect === 'INHERIT') {
            await client.query(
              `DELETE FROM user_permission_overrides
                WHERE school_id = $1
                  AND user_id = $2
                  AND role = $3
                  AND permission_id = $4`,
              [schoolKey, String(params.targetUserId), params.role, perm.id],
            );
          } else {
            await client.query(
              `INSERT INTO user_permission_overrides (
                 school_id, user_id, role, permission_id, effect,
                 updated_by_user_id, updated_at
               )
               VALUES ($1, $2, $3, $4, $5, $6, NOW())
               ON CONFLICT (school_id, user_id, role, permission_id)
               DO UPDATE SET
                 effect = EXCLUDED.effect,
                 updated_by_user_id = EXCLUDED.updated_by_user_id,
                 updated_at = NOW()`,
              [
                schoolKey,
                String(params.targetUserId),
                params.role,
                perm.id,
                change.effect,
                String(params.actorUserId),
              ],
            );
          }
          count += 1;
        }

        return count;
      },
      {
        userId: params.actorUserId,
        changeReason: `RBAC_USER_OVERRIDES_${String(params.targetUserId)}`,
      },
    );

    this.invalidateSchoolCache(params.schoolId);
    return { updatedCount };
  }

  /**
   * Obtiene el resumen cuantitativo por audiencia y rol para el colegio activo sin transferir filas completas.
   */
  public async getSchoolMembershipsSummary(
    schoolId: bigint,
  ): Promise<RbacMembershipsSummary> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const schoolKey = String(schoolId);
      const res = await client.query<{
        total_users: number;
        directives_total: number;
        rector_count: number;
        secretary_count: number;
        coordinator_count: number;
        school_admin_count: number;
        teacher_count: number;
        monitor_count: number;
        student_count: number;
        family_count: number;
        families_total: number;
        with_overrides_total: number;
      }>(
        `SELECT
           COUNT(DISTINCT m.user_id)::int AS total_users,
           COUNT(DISTINCT m.user_id) FILTER (
             WHERE m.role = ANY($2::text[])
           )::int AS directives_total,
           COUNT(DISTINCT m.user_id) FILTER (WHERE m.role = 'RECTOR')::int AS rector_count,
           COUNT(DISTINCT m.user_id) FILTER (WHERE m.role = 'SECRETARY')::int AS secretary_count,
           COUNT(DISTINCT m.user_id) FILTER (WHERE m.role = 'COORDINATOR')::int AS coordinator_count,
           COUNT(DISTINCT m.user_id) FILTER (WHERE m.role = 'SCHOOL_ADMIN')::int AS school_admin_count,
           COUNT(DISTINCT m.user_id) FILTER (WHERE m.role = 'TEACHER')::int AS teacher_count,
           COUNT(DISTINCT m.user_id) FILTER (WHERE m.role = 'MONITOR')::int AS monitor_count,
           COUNT(DISTINCT m.user_id) FILTER (WHERE m.role = 'STUDENT')::int AS student_count,
           COUNT(DISTINCT m.user_id) FILTER (WHERE m.role = 'FAMILY')::int AS family_count,
           COUNT(DISTINCT m.user_id) FILTER (
             WHERE m.role = ANY($3::text[])
           )::int AS families_total,
           (
             SELECT COUNT(DISTINCT upo.user_id)::int
               FROM user_permission_overrides upo
              WHERE upo.school_id = $1
           ) AS with_overrides_total
          FROM user_school_memberships m
         WHERE m.school_id = $1`,
        [schoolKey, DIRECTIVE_ROLES, FAMILY_AND_MONITOR_ROLES],
      );

      const row = res.rows[0];
      return {
        totalUsers: Number(row?.total_users ?? 0),
        directivesTotal: Number(row?.directives_total ?? 0),
        byRole: {
          RECTOR: Number(row?.rector_count ?? 0),
          SECRETARY: Number(row?.secretary_count ?? 0),
          COORDINATOR: Number(row?.coordinator_count ?? 0),
          SCHOOL_ADMIN: Number(row?.school_admin_count ?? 0),
          TEACHER: Number(row?.teacher_count ?? 0),
          MONITOR: Number(row?.monitor_count ?? 0),
          STUDENT: Number(row?.student_count ?? 0),
          FAMILY: Number(row?.family_count ?? 0),
        },
        teachersTotal: Number(row?.teacher_count ?? 0),
        studentsTotal: Number(row?.student_count ?? 0),
        familiesTotal: Number(row?.families_total ?? 0),
        withOverridesTotal: Number(row?.with_overrides_total ?? 0),
      };
    });
  }

  /**
   * Lista usuarios y sus membresías de roles con paginación real por usuario en servidor (apto para 3.000+ usuarios).
   */
  public async listSchoolMembershipsPaginated(
    schoolId: bigint,
    options: ListSchoolMembershipsOptions,
  ): Promise<{ items: SchoolUserMembershipRow[]; total: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const schoolKey = String(schoolId);
      const params: unknown[] = [schoolKey];
      const clauses: string[] = [
        `EXISTS (
           SELECT 1
             FROM user_school_memberships m0
            WHERE m0.school_id = $1
              AND m0.user_id = u.id
         )`,
      ];

      if (options.roleFilter) {
        params.push(options.roleFilter);
        clauses.push(
          `EXISTS (
             SELECT 1
               FROM user_school_memberships mr
              WHERE mr.school_id = $1
                AND mr.user_id = u.id
                AND mr.role = $${params.length}
           )`,
        );
      } else if (options.audience && options.audience !== 'ALL') {
        switch (options.audience) {
          case 'EXCEPTIONS':
            clauses.push(
              `EXISTS (
                 SELECT 1
                   FROM user_permission_overrides upo_f
                  WHERE upo_f.school_id = $1
                    AND upo_f.user_id = u.id
               )`,
            );
            break;
          case 'DIRECTIVES':
            params.push(DIRECTIVE_ROLES);
            clauses.push(
              `EXISTS (
                 SELECT 1
                   FROM user_school_memberships ma
                  WHERE ma.school_id = $1
                    AND ma.user_id = u.id
                    AND ma.role = ANY($${params.length}::text[])
               )`,
            );
            break;
          case 'TEACHERS':
            params.push(CommunityRole.TEACHER);
            clauses.push(
              `EXISTS (
                 SELECT 1
                   FROM user_school_memberships ma
                  WHERE ma.school_id = $1
                    AND ma.user_id = u.id
                    AND ma.role = $${params.length}
               )`,
            );
            break;
          case 'STUDENTS':
            params.push(CommunityRole.STUDENT);
            clauses.push(
              `EXISTS (
                 SELECT 1
                   FROM user_school_memberships ma
                  WHERE ma.school_id = $1
                    AND ma.user_id = u.id
                    AND ma.role = $${params.length}
               )`,
            );
            break;
          case 'FAMILIES':
            params.push(FAMILY_AND_MONITOR_ROLES);
            clauses.push(
              `EXISTS (
                 SELECT 1
                   FROM user_school_memberships ma
                  WHERE ma.school_id = $1
                    AND ma.user_id = u.id
                    AND ma.role = ANY($${params.length}::text[])
               )`,
            );
            break;
        }
      }

      if (options.search && options.search.trim().length > 0) {
        params.push(`%${options.search.trim()}%`);
        clauses.push(
          `(COALESCE(u.document_number, '') ILIKE $${params.length}
            OR u.username ILIKE $${params.length}
            OR TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.second_last_name)) ILIKE $${params.length}
            OR COALESCE(u.email, '') ILIKE $${params.length})`,
        );
      }

      const rawFilterVal = options.filterValue?.trim();
      if (options.filterField && rawFilterVal) {
        switch (options.filterField) {
          case 'fullName':
            params.push(`%${rawFilterVal}%`);
            clauses.push(
              `TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.second_last_name)) ILIKE $${params.length}`,
            );
            break;
          case 'documentNumber':
            params.push(`%${rawFilterVal}%`);
            clauses.push(
              `COALESCE(u.document_number, '') ILIKE $${params.length}`,
            );
            break;
          case 'email':
            params.push(`%${rawFilterVal}%`);
            clauses.push(
              `(COALESCE(u.email, '') ILIKE $${params.length} OR u.username ILIKE $${params.length})`,
            );
            break;
          case 'roles': {
            const needle = rawFilterVal
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase();
            const matchedRoles = ROLE_FILTER_KEYWORDS.filter((entry) =>
              entry.keywords.some((kw) => kw.includes(needle) || needle.includes(kw)),
            ).map((entry) => entry.role);

            if (matchedRoles.length === 0) {
              clauses.push('1 = 0');
            } else {
              params.push(matchedRoles);
              clauses.push(
                `EXISTS (
                   SELECT 1
                     FROM user_school_memberships mrf
                    WHERE mrf.school_id = $1
                      AND mrf.user_id = u.id
                      AND mrf.role = ANY($${params.length}::text[])
                 )`,
              );
            }
            break;
          }
          case 'overridesCount': {
            const normalizedVal = rawFilterVal.toLowerCase();
            const parsedCount = Number(normalizedVal);
            if (Number.isInteger(parsedCount) && parsedCount >= 0) {
              params.push(parsedCount);
              clauses.push(
                `(SELECT COUNT(*)::int
                    FROM user_permission_overrides upo_c
                   WHERE upo_c.school_id = $1
                     AND upo_c.user_id = u.id) = $${params.length}`,
              );
            } else if (normalizedVal.includes('rol')) {
              clauses.push(
                `NOT EXISTS (
                   SELECT 1
                     FROM user_permission_overrides upo_c
                    WHERE upo_c.school_id = $1
                      AND upo_c.user_id = u.id
                 )`,
              );
            } else if (normalizedVal.includes('act')) {
              clauses.push(
                `EXISTS (
                   SELECT 1
                     FROM user_permission_overrides upo_c
                    WHERE upo_c.school_id = $1
                      AND upo_c.user_id = u.id
                 )`,
              );
            }
            break;
          }
          default:
            break;
        }
      }

      const whereSql = clauses.join(' AND ');
      const countRes = await client.query<{ total: number }>(
        `SELECT COUNT(*)::int AS total
           FROM users u
          WHERE ${whereSql}`,
        params,
      );
      const total = Number(countRes.rows[0]?.total ?? 0);
      if (total === 0) {
        return { items: [], total: 0 };
      }

      const sortDir = options.sortDirection === 'DESC' ? 'DESC' : 'ASC';
      let orderByClause = 'role_rank ASC, u.last_name ASC, u.first_name ASC, u.id ASC';
      switch (options.sortField) {
        case 'fullName':
          orderByClause = `full_name ${sortDir}, u.id ASC`;
          break;
        case 'documentNumber':
          orderByClause = `COALESCE(u.document_number, '') ${sortDir}, u.last_name ASC, u.id ASC`;
          break;
        case 'email':
          orderByClause = `LOWER(COALESCE(u.email, u.username)) ${sortDir}, u.id ASC`;
          break;
        case 'overridesCount':
          orderByClause = `overrides_count ${sortDir}, role_rank ASC, u.last_name ASC, u.id ASC`;
          break;
        case 'roles':
          orderByClause = `role_rank ${sortDir}, u.last_name ASC, u.first_name ASC, u.id ASC`;
          break;
        default:
          break;
      }

      const pageParams = [...params, options.limit, options.offset];
      const limitIdx = pageParams.length - 1;
      const offsetIdx = pageParams.length;

      const usersRes = await client.query<{
        user_id: string;
        document_number: string;
        username: string;
        full_name: string;
        email: string | null;
        user_is_active: boolean;
        overrides_count: number;
      }>(
        `SELECT u.id AS user_id,
                u.document_number,
                u.username,
                TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name, u.second_last_name)) AS full_name,
                u.email,
                u.is_active AS user_is_active,
                (SELECT COUNT(*)::int
                   FROM user_permission_overrides upo
                  WHERE upo.school_id = $1 AND upo.user_id = u.id) AS overrides_count,
                (SELECT MIN(
                          CASE mrk.role
                            WHEN 'RECTOR' THEN 1
                            WHEN 'SECRETARY' THEN 2
                            WHEN 'COORDINATOR' THEN 3
                            WHEN 'SCHOOL_ADMIN' THEN 4
                            WHEN 'SUPER_ADMIN' THEN 5
                            WHEN 'TEACHER' THEN 6
                            WHEN 'MONITOR' THEN 7
                            WHEN 'STUDENT' THEN 8
                            ELSE 9
                          END
                        )
                   FROM user_school_memberships mrk
                  WHERE mrk.school_id = $1 AND mrk.user_id = u.id) AS role_rank
           FROM users u
          WHERE ${whereSql}
          ORDER BY ${orderByClause}
          LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        pageParams,
      );

      if (usersRes.rowCount === 0) {
        return { items: [], total };
      }

      const orderedIds = usersRes.rows.map((r) => r.user_id);
      const membershipsRes = await client.query<{
        membership_id: string;
        user_id: string;
        role: CommunityRole;
        membership_is_active: boolean;
        status: string;
        created_at: Date;
      }>(
        `SELECT m.id AS membership_id,
                m.user_id,
                m.role,
                m.is_active AS membership_is_active,
                m.status,
                m.created_at
           FROM user_school_memberships m
          WHERE m.school_id = $1
            AND m.user_id = ANY($2::bigint[])
          ORDER BY
            CASE m.role
              WHEN 'RECTOR' THEN 1
              WHEN 'SECRETARY' THEN 2
              WHEN 'COORDINATOR' THEN 3
              WHEN 'SCHOOL_ADMIN' THEN 4
              WHEN 'SUPER_ADMIN' THEN 5
              WHEN 'TEACHER' THEN 6
              WHEN 'MONITOR' THEN 7
              WHEN 'STUDENT' THEN 8
              ELSE 9
            END ASC,
            m.id ASC`,
        [schoolKey, orderedIds],
      );

      const byUser = new Map<string, SchoolUserMembershipRow>();
      for (const row of usersRes.rows) {
        byUser.set(row.user_id, {
          userId: Number(row.user_id),
          documentNumber: row.document_number ?? '',
          username: row.username,
          fullName: row.full_name,
          email: row.email,
          userIsActive: Boolean(row.user_is_active),
          overridesCount: Number(row.overrides_count ?? 0),
          memberships: [],
        });
      }

      for (const mRow of membershipsRes.rows) {
        const entry = byUser.get(mRow.user_id);
        if (!entry) {
          continue;
        }
        entry.memberships.push({
          membershipId: Number(mRow.membership_id),
          role: mRow.role,
          isActive: Boolean(mRow.membership_is_active),
          status: mRow.status,
          createdAt: new Date(mRow.created_at).toISOString(),
        });
      }

      return {
        items: orderedIds
          .map((id) => byUser.get(id))
          .filter((item): item is SchoolUserMembershipRow => Boolean(item)),
        total,
      };
    });
  }

  /**
   * Lista usuarios y sus membresías de roles dentro de la institución activa.
   */
  public async listSchoolMemberships(
    schoolId: bigint,
    search?: string,
    roleFilter?: CommunityRole,
  ): Promise<SchoolUserMembershipRow[]> {
    const result = await this.listSchoolMembershipsPaginated(schoolId, {
      search,
      roleFilter,
      limit: 500,
      offset: 0,
    });
    return result.items;
  }

  /**
   * Asigna o reactiva un rol institucional a un usuario existente por `userId` o `identifier`.
   */
  public async assignSchoolMembership(params: {
    schoolId: bigint;
    actorRole: CommunityRole;
    actorUserId: bigint;
    userId?: number;
    identifier?: string;
    role: CommunityRole;
  }): Promise<{
    membershipId: number;
    userId: number;
    role: CommunityRole;
    isActive: boolean;
  }> {
    if (
      params.role === CommunityRole.SUPER_ADMIN &&
      params.actorRole !== CommunityRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Solo un SUPER_ADMIN puede otorgar el rol SUPER_ADMIN.',
      );
    }

    const result = await this.db.withTenantTransaction(
      params.schoolId,
      async (client) => {
        let targetUserId: string | null = params.userId
          ? String(params.userId)
          : null;

        if (!targetUserId && params.identifier?.trim()) {
          const clean = params.identifier.trim();
          const userLookup = await client.query<{ id: string }>(
            `SELECT id
               FROM users
              WHERE LOWER(username) = LOWER($1)
                 OR document_number = $1
                 OR LOWER(COALESCE(email, '')) = LOWER($1)
              LIMIT 1`,
            [clean],
          );
          if (userLookup.rowCount === 0) {
            throw new ResourceNotFoundException('CommunityUser', clean);
          }
          targetUserId = userLookup.rows[0].id;
        }

        if (!targetUserId) {
          throw new BadRequestException(
            'Debe suministrar userId o identifier (documento o nombre de usuario).',
          );
        }

        const existsUser = await client.query<{ id: string }>(
          `SELECT id FROM users WHERE id = $1 LIMIT 1`,
          [targetUserId],
        );
        if (existsUser.rowCount === 0) {
          throw new ResourceNotFoundException('CommunityUser', targetUserId);
        }

        const upsertRes = await client.query<{
          id: string;
          user_id: string;
          role: CommunityRole;
          is_active: boolean;
        }>(
          `INSERT INTO user_school_memberships (
             user_id, school_id, role, status, is_active, updated_at
           )
           VALUES ($1, $2, $3, 'ACTIVE', TRUE, NOW())
           ON CONFLICT (user_id, school_id, role)
           DO UPDATE SET
             status = 'ACTIVE',
             is_active = TRUE,
             updated_at = NOW()
           RETURNING id, user_id, role, is_active`,
          [targetUserId, String(params.schoolId), params.role],
        );

        const row = upsertRes.rows[0];
        return {
          membershipId: Number(row.id),
          userId: Number(row.user_id),
          role: row.role,
          isActive: Boolean(row.is_active),
        };
      },
      {
        userId: params.actorUserId,
        changeReason: `RBAC_ASSIGN_ROLE_${params.role}`,
      },
    );

    this.invalidateSchoolCache(params.schoolId);
    return result;
  }

  /**
   * Activa o suspende una membresía institucional y revoca sesiones activas del colegio al suspenderla.
   */
  public async toggleSchoolMembership(params: {
    schoolId: bigint;
    actorRole: CommunityRole;
    actorUserId: bigint;
    membershipId: bigint;
    isActive: boolean;
  }): Promise<{
    membershipId: number;
    isActive: boolean;
    sessionsRevoked: number;
  }> {
    const result = await this.db.withTenantTransaction(
      params.schoolId,
      async (client) => {
        const currentRes = await client.query<{
          id: string;
          user_id: string;
          role: CommunityRole;
        }>(
          `SELECT id, user_id, role
             FROM user_school_memberships
            WHERE school_id = $1 AND id = $2
            FOR UPDATE`,
          [String(params.schoolId), String(params.membershipId)],
        );

        if (currentRes.rowCount === 0) {
          throw new ResourceNotFoundException(
            'SchoolMembership',
            params.membershipId,
          );
        }

        const target = currentRes.rows[0];
        if (
          target.role === CommunityRole.SUPER_ADMIN &&
          params.actorRole !== CommunityRole.SUPER_ADMIN
        ) {
          throw new ForbiddenException(
            'No tienes autorización para modificar una membresía SUPER_ADMIN.',
          );
        }

        if (
          !params.isActive &&
          BigInt(target.user_id) === params.actorUserId &&
          target.role === params.actorRole
        ) {
          throw new BadRequestException(
            'No puedes suspender tu propia membresía administrativa activa.',
          );
        }

        await client.query(
          `UPDATE user_school_memberships
              SET is_active = $3,
                  status = CASE WHEN $3 THEN 'ACTIVE' ELSE 'SUSPENDED' END,
                  updated_at = NOW()
            WHERE school_id = $1 AND id = $2`,
          [
            String(params.schoolId),
            String(params.membershipId),
            params.isActive,
          ],
        );

        let sessionsRevoked = 0;
        if (!params.isActive) {
          const revRes = await client.query(
            `UPDATE auth_sessions
                SET is_revoked = TRUE,
                    revoked_at = NOW(),
                    revocation_reason = 'MEMBERSHIP_SUSPENDED'
              WHERE school_id = $1
                AND user_id = $2
                AND is_revoked = FALSE`,
            [String(params.schoolId), target.user_id],
          );
          sessionsRevoked = revRes.rowCount ?? 0;
        }

        return {
          membershipId: Number(target.id),
          isActive: params.isActive,
          sessionsRevoked,
        };
      },
      {
        userId: params.actorUserId,
        changeReason: `RBAC_TOGGLE_MEMBERSHIP_${String(params.membershipId)}`,
      },
    );

    this.invalidateSchoolCache(params.schoolId);
    return result;
  }

  /**
   * Elimina una membresía de rol del colegio y revoca sesiones activas del usuario en dicho colegio.
   */
  public async removeSchoolMembership(params: {
    schoolId: bigint;
    actorRole: CommunityRole;
    actorUserId: bigint;
    membershipId: bigint;
  }): Promise<{ deleted: boolean; sessionsRevoked: number }> {
    const result = await this.db.withTenantTransaction(
      params.schoolId,
      async (client) => {
        const currentRes = await client.query<{
          id: string;
          user_id: string;
          role: CommunityRole;
        }>(
          `SELECT id, user_id, role
             FROM user_school_memberships
            WHERE school_id = $1 AND id = $2
            FOR UPDATE`,
          [String(params.schoolId), String(params.membershipId)],
        );

        if (currentRes.rowCount === 0) {
          throw new ResourceNotFoundException(
            'SchoolMembership',
            params.membershipId,
          );
        }

        const target = currentRes.rows[0];
        if (
          target.role === CommunityRole.SUPER_ADMIN &&
          params.actorRole !== CommunityRole.SUPER_ADMIN
        ) {
          throw new ForbiddenException(
            'No tienes autorización para eliminar una membresía SUPER_ADMIN.',
          );
        }

        if (
          BigInt(target.user_id) === params.actorUserId &&
          target.role === params.actorRole
        ) {
          throw new BadRequestException(
            'No puedes eliminar tu propia membresía administrativa activa.',
          );
        }

        await client.query(
          `DELETE FROM user_school_memberships
            WHERE school_id = $1 AND id = $2`,
          [String(params.schoolId), String(params.membershipId)],
        );

        await client.query(
          `DELETE FROM user_permission_overrides
            WHERE school_id = $1 AND user_id = $2 AND role = $3`,
          [String(params.schoolId), target.user_id, target.role],
        );

        const revRes = await client.query(
          `UPDATE auth_sessions
              SET is_revoked = TRUE,
                  revoked_at = NOW(),
                  revocation_reason = 'MEMBERSHIP_REMOVED'
            WHERE school_id = $1
              AND user_id = $2
              AND is_revoked = FALSE`,
          [String(params.schoolId), target.user_id],
        );

        return {
          deleted: true,
          sessionsRevoked: revRes.rowCount ?? 0,
        };
      },
      {
        userId: params.actorUserId,
        changeReason: `RBAC_REMOVE_MEMBERSHIP_${String(params.membershipId)}`,
      },
    );

    this.invalidateSchoolCache(params.schoolId);
    return result;
  }

  /**
   * Auxiliar defensivo para verificar desde código de controlador un permiso o conjunto de permisos (OR).
   */
  public async assertAnyPermission(
    schoolId: bigint,
    userId: bigint,
    activeRole: CommunityRole,
    requiredCodes: readonly string[],
    customMessage?: string,
  ): Promise<void> {
    if (activeRole === CommunityRole.SUPER_ADMIN) {
      return;
    }
    const allowed = await this.hasAnyPermission(
      schoolId,
      userId,
      activeRole,
      requiredCodes,
    );
    if (!allowed) {
      throw new TenantAccessDeniedException(
        customMessage ??
          `No cuentas con el permiso requerido (${requiredCodes.join(' o ')}) para ejecutar esta operación.`,
      );
    }
  }
}
