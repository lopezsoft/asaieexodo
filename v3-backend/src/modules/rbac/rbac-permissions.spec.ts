import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as net from 'node:net';
import { TenantAccessDeniedException } from '../../shared/domain/exceptions/tenant-access-denied.exception';
import { PostgresRlsService } from '../../shared/infrastructure/database/postgres-rls.service';
import {
  IS_PUBLIC_KEY,
  REQUIRED_ANY_PERMISSIONS_KEY,
  REQUIRED_MODULE_KEY,
  REQUIRED_PERMISSIONS_KEY,
} from '../../shared/infrastructure/http/decorators/security.decorators';
import { PermissionsGuard } from '../../shared/infrastructure/http/guards/permissions.guard';
import { SmartLoggerService } from '../../shared/infrastructure/logging/smart-logger.service';
import {
  RBAC_MODULES,
  RBAC_PERMISSIONS,
  resolveReportTemplatePermissions,
  resolveStorageCategoryWritePermissions,
} from '../../shared/infrastructure/rbac/rbac-permissions.constants';
import { RbacPermissionsService } from '../../shared/infrastructure/rbac/rbac-permissions.service';
import { CommunityRole } from '../iam/domain/enums/community-role.enum';
import { mapLegacyProfileIdToRole } from '../migration/application/helpers/etl-sanitizer.helper';

function checkTcpPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

describe('RBAC Granular Permissions Engine, Guard & PostgreSQL 17 RLS Isolation', () => {
  describe('Unit: ETL role mapping, report & storage category permissions, and PermissionsGuard', () => {
    it('maps legacy profile_id=8 to SCHOOL_ADMIN instead of falling back to STUDENT', () => {
      expect(mapLegacyProfileIdToRole(1)).toBe(CommunityRole.MONITOR);
      expect(mapLegacyProfileIdToRole(2)).toBe(CommunityRole.RECTOR);
      expect(mapLegacyProfileIdToRole(3)).toBe(CommunityRole.SECRETARY);
      expect(mapLegacyProfileIdToRole(4)).toBe(CommunityRole.TEACHER);
      expect(mapLegacyProfileIdToRole(5)).toBe(CommunityRole.STUDENT);
      expect(mapLegacyProfileIdToRole(6)).toBe(CommunityRole.COORDINATOR);
      expect(mapLegacyProfileIdToRole(7)).toBe(CommunityRole.FAMILY);
      expect(mapLegacyProfileIdToRole(8)).toBe(CommunityRole.SCHOOL_ADMIN);
    });

    it('maps report templates and S3 storage categories to exact atomic permissions', () => {
      expect(resolveReportTemplatePermissions('constancia_estudio')).toContain(
        RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
      );
      expect(resolveReportTemplatePermissions('boletin_carta_areas')).toContain(
        RBAC_PERMISSIONS.REPORTS_ACADEMIC_GENERATE,
      );
      expect(resolveReportTemplatePermissions('listas_asistencia')).toEqual(
        expect.arrayContaining([
          RBAC_PERMISSIONS.REPORTS_DIRECTORY_GENERATE,
          RBAC_PERMISSIONS.REPORTS_TEACHER_GENERATE,
        ]),
      );

      expect(
        resolveStorageCategoryWritePermissions('INSTITUTIONAL_LOGOS'),
      ).toEqual([RBAC_PERMISSIONS.STORAGE_INSTITUTIONAL_BRANDING_WRITE]);
      expect(
        resolveStorageCategoryWritePermissions('STUDENT_DOCUMENTS'),
      ).toEqual([RBAC_PERMISSIONS.STORAGE_STUDENT_DOCUMENTS_WRITE]);
    });

    it('enforces @RequirePermissions, @RequireAnyPermission and @RequireModule in PermissionsGuard', async () => {
      const fakeRbac = {
        resolveEffectiveAccess: jest.fn().mockResolvedValue({
          permissions: [
            RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE,
            RBAC_PERMISSIONS.PROMOTION_RECORDS_FOLIOS_EDIT,
          ],
          enabledModules: [RBAC_MODULES.ENROLLMENTS, RBAC_MODULES.ACADEMIC_GRADES],
        }),
      } as unknown as RbacPermissionsService;

      const buildContext = (
        role: CommunityRole,
        meta: Record<string, unknown>,
      ): { guard: PermissionsGuard; ctx: ExecutionContext } => {
        const reflector = {
          getAllAndOverride: jest.fn((key: string) => meta[key]),
        } as unknown as Reflector;
        const guard = new PermissionsGuard(reflector, fakeRbac);
        const ctx = {
          getHandler: () => ({}),
          getClass: () => ({}),
          switchToHttp: () => ({
            getRequest: () => ({
              user: {
                schoolId: 1n,
                userId: 99n,
                username: 'secretaria.test',
                fullName: 'Secretaria Prueba',
                activeRole: role,
                academicYear: 2026,
                sessionId: 'sid-1',
              },
            }),
          }),
        } as unknown as ExecutionContext;
        return { guard, ctx };
      };

      // Bloquea a SECRETARY en portal docente (cierra bypass histórico)
      const blockedTeacher = buildContext(CommunityRole.SECRETARY, {
        [IS_PUBLIC_KEY]: false,
        [REQUIRED_PERMISSIONS_KEY]: [RBAC_PERMISSIONS.PORTAL_TEACHER_OWN],
      });
      await expect(
        blockedTeacher.guard.canActivate(blockedTeacher.ctx),
      ).rejects.toThrow(TenantAccessDeniedException);

      // Bloquea módulo deshabilitado (SCHOOL_ELECTIONS ausente en enabledModules)
      const blockedModule = buildContext(CommunityRole.SECRETARY, {
        [IS_PUBLIC_KEY]: false,
        [REQUIRED_MODULE_KEY]: RBAC_MODULES.SCHOOL_ELECTIONS,
      });
      await expect(
        blockedModule.guard.canActivate(blockedModule.ctx),
      ).rejects.toThrow(TenantAccessDeniedException);

      // Permite operación autorizada en módulo habilitado
      const allowedEnroll = buildContext(CommunityRole.SECRETARY, {
        [IS_PUBLIC_KEY]: false,
        [REQUIRED_MODULE_KEY]: RBAC_MODULES.ENROLLMENTS,
        [REQUIRED_ANY_PERMISSIONS_KEY]: [
          RBAC_PERMISSIONS.PROMOTION_RECORDS_COMMISSION_EDIT,
          RBAC_PERMISSIONS.PROMOTION_RECORDS_FOLIOS_EDIT,
        ],
      });
      await expect(
        allowedEnroll.guard.canActivate(allowedEnroll.ctx),
      ).resolves.toBe(true);

      // SUPER_ADMIN conserva bypass administrativo global
      const superAdmin = buildContext(CommunityRole.SUPER_ADMIN, {
        [IS_PUBLIC_KEY]: false,
        [REQUIRED_PERMISSIONS_KEY]: [RBAC_PERMISSIONS.SETTINGS_MODULES_MANAGE],
      });
      await expect(superAdmin.guard.canActivate(superAdmin.ctx)).resolves.toBe(
        true,
      );
    });

    it('handles empty paginated search results without issuing Phase 2 membership hydration', async () => {
      const mockQuery = jest.fn().mockResolvedValueOnce({ rows: [{ total: 0 }] });
      const fakeDb = {
        withTenantTransaction: jest.fn(
          async (
            _schoolId: bigint,
            fn: (client: { query: typeof mockQuery }) => Promise<unknown>,
          ) => fn({ query: mockQuery }),
        ),
      } as unknown as PostgresRlsService;
      const service = new RbacPermissionsService(
        fakeDb,
        new SmartLoggerService(),
      );

      const res = await service.listSchoolMembershipsPaginated(1n, {
        audience: 'DIRECTIVES',
        search: '   ',
        filterField: 'roles',
        filterValue: 'rol-inexistente-xyz',
        limit: 15,
        offset: 0,
      });

      expect(res).toEqual({ items: [], total: 0 });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('Live PostgreSQL 17 RLS RBAC Matrix, Overrides & Module Coupling', () => {
    let db: PostgresRlsService | null = null;
    let rbacService: RbacPermissionsService | null = null;
    let postgresAvailable = false;

    beforeAll(async () => {
      const host = process.env.DB_HOST ?? '127.0.0.1';
      const port = Number(process.env.DB_PORT ?? '5434');
      postgresAvailable = await checkTcpPortOpen(host, port);
      if (!postgresAvailable) {
        return;
      }

      const config = new ConfigService({
        NODE_ENV: 'test',
        DB_HOST: host,
        DB_PORT: String(port),
        DB_USER: process.env.DB_USER ?? 'asaie_admin',
        DB_PASSWORD: process.env.DB_PASSWORD ?? 'asaie_local_secret_2026',
        DB_NAME: process.env.DB_NAME ?? 'asaie_v3_unified',
      });
      const logger = new SmartLoggerService();
      db = new PostgresRlsService(config, logger);
      rbacService = new RbacPermissionsService(db, logger);
    });

    afterAll(async () => {
      if (db) {
        await db.onModuleDestroy();
      }
    });

    it('resolves exact MEN/Decreto 1290 role permissions for RECTOR, COORDINATOR, SECRETARY, TEACHER & SUPER_ADMIN', async () => {
      if (!postgresAvailable || !rbacService) {
        return;
      }

      const [superAdmin, rector, coordinator, secretary, teacher] =
        await Promise.all([
          rbacService.resolveEffectiveAccess(1n, 1n, CommunityRole.SUPER_ADMIN),
          rbacService.resolveEffectiveAccess(1n, 999991n, CommunityRole.RECTOR),
          rbacService.resolveEffectiveAccess(
            1n,
            999992n,
            CommunityRole.COORDINATOR,
          ),
          rbacService.resolveEffectiveAccess(
            1n,
            999993n,
            CommunityRole.SECRETARY,
          ),
          rbacService.resolveEffectiveAccess(1n, 999994n, CommunityRole.TEACHER),
        ]);

      // SUPER_ADMIN posee todos los 82 permisos incluyendo settings.modules.manage
      expect(superAdmin.permissions.length).toBe(82);
      expect(superAdmin.permissions).toContain(
        RBAC_PERMISSIONS.SETTINGS_MODULES_MANAGE,
      );

      // RECTOR posee constancias/certificados, RBAC, cierre de año, edición rectoral; NO settings.modules.manage
      expect(rector.permissions).toContain(
        RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
      );
      expect(rector.permissions).toContain(RBAC_PERMISSIONS.IAM_RBAC_MANAGE);
      expect(rector.permissions).toContain(
        RBAC_PERMISSIONS.PROMOTION_YEAR_CLOSE,
      );
      expect(rector.permissions).toContain(
        RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
      );
      expect(rector.permissions).not.toContain(
        RBAC_PERMISSIONS.SETTINGS_MODULES_MANAGE,
      );

      // COORDINATOR supervisa portal docente, escribe observador, comisión de promoción, reasigna docentes;
      // NO edita matrículas ni cierra año ni emite certificados
      expect(coordinator.permissions).toContain(
        RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
      );
      expect(coordinator.permissions).toContain(
        RBAC_PERMISSIONS.PORTAL_TEACHER_OBSERVER_WRITE,
      );
      expect(coordinator.permissions).toContain(
        RBAC_PERMISSIONS.PROMOTION_RECORDS_COMMISSION_EDIT,
      );
      expect(coordinator.permissions).not.toContain(
        RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
      );
      expect(coordinator.permissions).not.toContain(
        RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE,
      );
      expect(coordinator.permissions).not.toContain(
        RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
      );
      expect(coordinator.permissions).not.toContain(
        RBAC_PERMISSIONS.PROMOTION_YEAR_CLOSE,
      );

      // SECRETARY gestiona matrículas, folios, transferencias de notas, certificados y headers;
      // NO entra a portal docente, NO edita notas rectorales, NO edita comisión ni logos institucionales
      expect(secretary.permissions).toContain(
        RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_WRITE,
      );
      expect(secretary.permissions).toContain(
        RBAC_PERMISSIONS.ACADEMIC_GRADES_TRANSFER,
      );
      expect(secretary.permissions).toContain(
        RBAC_PERMISSIONS.PROMOTION_RECORDS_FOLIOS_EDIT,
      );
      expect(secretary.permissions).toContain(
        RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
      );
      expect(secretary.permissions).not.toContain(
        RBAC_PERMISSIONS.PORTAL_TEACHER_OWN,
      );
      expect(secretary.permissions).not.toContain(
        RBAC_PERMISSIONS.PORTAL_TEACHER_SUPERVISE_READ,
      );
      expect(secretary.permissions).not.toContain(
        RBAC_PERMISSIONS.ACADEMIC_GRADES_RECTOR_OVERRIDE,
      );
      expect(secretary.permissions).not.toContain(
        RBAC_PERMISSIONS.PROMOTION_RECORDS_COMMISSION_EDIT,
      );
      expect(secretary.permissions).not.toContain(
        RBAC_PERMISSIONS.STORAGE_INSTITUTIONAL_BRANDING_WRITE,
      );

      // TEACHER tiene portal propio + informes docentes + observador; NO gestión administrativa
      expect(teacher.permissions).toContain(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN);
      expect(teacher.permissions).toContain(
        RBAC_PERMISSIONS.REPORTS_TEACHER_GENERATE,
      );
      expect(teacher.permissions).not.toContain(
        RBAC_PERMISSIONS.ADMIN_SCHOOL_WRITE,
      );
    });

    it('applies school_role_permissions & user_permission_overrides with RLS tenant isolation and blocks privilege escalation', async () => {
      if (!postgresAvailable || !rbacService || !db) {
        return;
      }

      // Bloquea escalación a settings.modules.manage o rol SUPER_ADMIN
      await expect(
        rbacService.updateSchoolRolePermissions({
          schoolId: 1n,
          actorUserId: 1n,
          role: CommunityRole.RECTOR,
          changes: [
            {
              permissionCode: RBAC_PERMISSIONS.SETTINGS_MODULES_MANAGE,
              effect: 'ALLOW',
            },
          ],
        }),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        rbacService.updateSchoolRolePermissions({
          schoolId: 1n,
          actorUserId: 1n,
          role: CommunityRole.SUPER_ADMIN,
          changes: [
            {
              permissionCode: RBAC_PERMISSIONS.ADMIN_SCHOOL_VIEW,
              effect: 'DENY',
            },
          ],
        }),
      ).rejects.toThrow(ForbiddenException);

      try {
        // Personalizar rol COORDINATOR en school_id=1 concediendo reportes de certificados
        await rbacService.updateSchoolRolePermissions({
          schoolId: 1n,
          actorUserId: 1n,
          role: CommunityRole.COORDINATOR,
          changes: [
            {
              permissionCode: RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
              effect: 'ALLOW',
            },
          ],
        });

        const coordSchool1 = await rbacService.resolveEffectiveAccess(
          1n,
          999992n,
          CommunityRole.COORDINATOR,
        );
        const coordSchool7 = await rbacService.resolveEffectiveAccess(
          7n,
          999992n,
          CommunityRole.COORDINATOR,
        );

        // Efectivo en colegio 1, aislado por RLS en colegio 7
        expect(coordSchool1.permissions).toContain(
          RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
        );
        expect(coordSchool7.permissions).not.toContain(
          RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
        );

        // Excepción puntual DENY sobre usuario real del colegio 1 (user_id=1) tiene prioridad sobre school_role_permissions
        await rbacService.updateUserOverrides({
          schoolId: 1n,
          actorUserId: 1n,
          targetUserId: 1n,
          role: CommunityRole.COORDINATOR,
          changes: [
            {
              permissionCode: RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
              effect: 'DENY',
            },
          ],
        });

        const coordUser1Denied = await rbacService.resolveEffectiveAccess(
          1n,
          1n,
          CommunityRole.COORDINATOR,
        );
        expect(coordUser1Denied.permissions).not.toContain(
          RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
        );
      } finally {
        // Limpieza garantizada de la BD viva
        await rbacService.updateUserOverrides({
          schoolId: 1n,
          actorUserId: 1n,
          targetUserId: 1n,
          role: CommunityRole.COORDINATOR,
          changes: [
            {
              permissionCode: RBAC_PERMISSIONS.REPORTS_CERTIFICATES_GENERATE,
              effect: 'INHERIT',
            },
          ],
        });
        await rbacService.resetSchoolRolePermissions(
          1n,
          1n,
          CommunityRole.COORDINATOR,
        );
      }
    });

    it('strips module-coupled permissions automatically when a module is disabled in school_modules', async () => {
      if (!postgresAvailable || !rbacService || !db) {
        return;
      }

      // En colegio 7, el módulo 3 (TEACHER_REPORTS) fue migrado con is_active = FALSE
      const teacherSchool7 = await rbacService.resolveEffectiveAccess(
        7n,
        999994n,
        CommunityRole.TEACHER,
      );
      expect(teacherSchool7.enabledModules).not.toContain(
        RBAC_MODULES.TEACHER_REPORTS,
      );
      expect(teacherSchool7.permissions).not.toContain(
        RBAC_PERMISSIONS.REPORTS_TEACHER_GENERATE,
      );

      // En colegio 1, el módulo 3 (TEACHER_REPORTS) está activo
      const teacherSchool1 = await rbacService.resolveEffectiveAccess(
        1n,
        999994n,
        CommunityRole.TEACHER,
      );
      expect(teacherSchool1.enabledModules).toContain(
        RBAC_MODULES.TEACHER_REPORTS,
      );
      expect(teacherSchool1.permissions).toContain(
        RBAC_PERMISSIONS.REPORTS_TEACHER_GENERATE,
      );
    });

    it('returns accurate audience summary counts and preserves multi-role memberships in paginated DIRECTIVES query', async () => {
      if (!postgresAvailable || !rbacService) {
        return;
      }

      const summary = await rbacService.getSchoolMembershipsSummary(1n);
      expect(summary.totalUsers).toBeGreaterThanOrEqual(summary.directivesTotal);
      expect(summary.byRole.RECTOR).toBeGreaterThanOrEqual(0);
      expect(summary.byRole.SECRETARY).toBeGreaterThanOrEqual(0);
      expect(summary.byRole.COORDINATOR).toBeGreaterThanOrEqual(0);

      const directivesPage = await rbacService.listSchoolMembershipsPaginated(1n, {
        audience: 'DIRECTIVES',
        limit: 5,
        offset: 0,
      });

      expect(directivesPage.total).toBe(summary.directivesTotal);
      expect(directivesPage.items.length).toBeLessThanOrEqual(5);
      for (const user of directivesPage.items) {
        expect(user.memberships.length).toBeGreaterThanOrEqual(1);
        expect(
          user.memberships.some((m) =>
            ['RECTOR', 'SECRETARY', 'COORDINATOR', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(
              m.role,
            ),
          ),
        ).toBe(true);
      }
    });
  });
});
