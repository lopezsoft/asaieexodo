import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'node:net';
import { ActiveTenantContext } from '../../shared/application/context/tenant-context.service';
import { DomainException } from '../../shared/domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../shared/domain/exceptions/resource-not-found.exception';
import { TenantAccessDeniedException } from '../../shared/domain/exceptions/tenant-access-denied.exception';
import { PostgresRlsService } from '../../shared/infrastructure/database/postgres-rls.service';
import { SmartLoggerService } from '../../shared/infrastructure/logging/smart-logger.service';
import {
  RBAC_PERMISSIONS,
  resolveStorageCategoryWritePermissions,
  resolveStorageEntityReadPermissions,
} from '../../shared/infrastructure/rbac/rbac-permissions.constants';
import { RbacPermissionsService } from '../../shared/infrastructure/rbac/rbac-permissions.service';
import { AwsS3StorageAdapter } from '../../shared/infrastructure/storage/aws-s3-storage.adapter';
import { CommunityRole } from '../iam/domain/enums/community-role.enum';
import { ManageCloudFilesUseCase } from './application/use-cases/manage-cloud-files.use-case';
import { ICloudFileRepositoryPort } from './domain/ports/cloud-file.repository.port';
import { StorageController } from './infrastructure/http/storage.controller';
import { PostgresCloudFileRepository } from './infrastructure/persistence/postgres-cloud-file.repository';

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

function buildPrincipal(
  overrides: Partial<ActiveTenantContext> = {},
): ActiveTenantContext {
  return {
    schoolId: 1n,
    userId: 50n,
    username: 'usuario.test',
    fullName: 'Usuario Prueba',
    activeRole: CommunityRole.TEACHER,
    academicYear: 2026,
    sessionId: 'sess-storage-1',
    ...overrides,
  };
}

describe('Per-Record Digital File Ownership (TEACHER, STUDENT, FAMILY, ADMINISTRATIVE_STAFF) & RBAC', () => {
  const logger = new SmartLoggerService();
  const s3Adapter = new AwsS3StorageAdapter(
    new ConfigService({
      NODE_ENV: 'test',
      AWS_MAIN_PATH: 'test',
      AWS_BUCKET: 'asaie-app-storage',
    }),
    logger,
  );

  describe('Unit: S3 key segmentation, mandatory record binding & RBAC anti-IDOR', () => {
    it('segments AWS S3 object keys by owner entity type and record ID', () => {
      const teacherKey = s3Adapter.buildSchoolObjectKey({
        storageFolder: 'ie_central',
        category: 'TEACHER_DOCUMENTS',
        ownerEntityType: 'TEACHER',
        ownerEntityId: 42n,
        originalFileName: 'Hoja de Vida.pdf',
        academicYear: 2026,
      });
      expect(teacherKey.storageKey).toMatch(
        /^test\/ie_central\/teacher-documents\/2026\/teacher-42\/.*-hoja-de-vida\.pdf$/,
      );

      const staffKey = s3Adapter.buildSchoolObjectKey({
        storageFolder: 'ie_central',
        category: 'ADMINISTRATIVE_DOCUMENTS',
        ownerEntityType: 'ADMINISTRATIVE_STAFF',
        ownerEntityId: 7n,
        originalFileName: 'Acta Posesion.pdf',
        academicYear: 2026,
      });
      expect(staffKey.storageKey).toMatch(
        /^test\/ie_central\/administrative-documents\/2026\/administrative-staff-7\/.*-acta-posesion\.pdf$/,
      );
    });

    it('rejects person-entity uploads without ownerEntityId and rejects non-existent records before touching S3', async () => {
      const uploadSpy = jest.spyOn(s3Adapter, 'uploadObject');
      const repoMock: jest.Mocked<ICloudFileRepositoryPort> = {
        resolveSchoolStorageFolder: jest.fn().mockResolvedValue('ie_central'),
        ownerEntityExists: jest.fn().mockResolvedValue(false),
        isEntityOwnedByUser: jest.fn().mockResolvedValue(false),
        saveCloudFile: jest.fn(),
        findById: jest.fn(),
        confirmCloudFileUpload: jest.fn(),
        listSchoolFiles: jest.fn(),
        deleteCloudFile: jest.fn(),
      };
      const useCase = new ManageCloudFilesUseCase(repoMock, s3Adapter, logger);

      await expect(
        useCase.uploadSchoolFile({
          schoolId: 1n,
          category: 'TEACHER_DOCUMENTS',
          ownerEntityType: 'TEACHER',
          ownerEntityId: null,
          originalFileName: 'cv.pdf',
          mimeType: 'application/pdf',
          contentBuffer: Buffer.from('%PDF-1.4 sample'),
        }),
      ).rejects.toThrow(DomainException);

      await expect(
        useCase.uploadSchoolFile({
          schoolId: 1n,
          category: 'STUDENT_DOCUMENTS',
          ownerEntityType: 'STUDENT',
          ownerEntityId: 999999n,
          originalFileName: 'registro-civil.pdf',
          mimeType: 'application/pdf',
          contentBuffer: Buffer.from('%PDF-1.4 sample'),
        }),
      ).rejects.toThrow(ResourceNotFoundException);

      expect(uploadSpy).not.toHaveBeenCalled();
      uploadSpy.mockRestore();
    });

    it('parses multipart fields (category, ownerEntityType, ownerEntityId, description) and enforces self-vs-other RBAC', async () => {
      const useCaseMock = {
        uploadSchoolFile: jest.fn().mockResolvedValue({
          id: '101',
          schoolId: '1',
          fileUuid: 'uuid-101',
          uploadedByUserId: '50',
          ownerEntityType: 'TEACHER',
          ownerEntityId: '42',
          fileName: 'firma.png',
          description: 'Firma oficial del docente',
          storagePath: 'test/ie/teacher-documents/2026/teacher-42/firma.png',
          publicUrl: 'https://s3.local/firma.png',
          extension: 'png',
          mimeType: 'image/png',
          sizeBytes: 16,
          isWatermark: false,
          status: 1,
          metadata: { storageCategory: 'TEACHER_DOCUMENTS' },
          createdAt: new Date().toISOString(),
        }),
        listSchoolFiles: jest.fn().mockResolvedValue([]),
        isEntityOwnedByUser: jest.fn(
          async (
            _schoolId: bigint,
            entityType: string,
            entityId: bigint,
            userId: bigint,
          ) => entityType === 'TEACHER' && entityId === 42n && userId === 50n,
        ),
      } as unknown as ManageCloudFilesUseCase;

      const rbacMock = {
        hasAnyPermission: jest.fn(
          async (
            _schoolId: bigint,
            _userId: bigint,
            _role: CommunityRole,
            perms: readonly string[],
          ) => perms.includes(RBAC_PERMISSIONS.PORTAL_TEACHER_OWN),
        ),
        assertAnyPermission: jest.fn().mockRejectedValue(
          new TenantAccessDeniedException('Sin permiso'),
        ),
      } as unknown as RbacPermissionsService;

      const controller = new StorageController(useCaseMock, rbacMock);
      const teacherPrincipal = buildPrincipal({
        userId: 50n,
        activeRole: CommunityRole.TEACHER,
      });

      // Multipart con archivo enviado antes de los campos (verifica iteracion de request.parts())
      async function* buildMultipartParts(ownerId: string) {
        yield {
          type: 'file' as const,
          fieldname: 'file',
          filename: 'firma.png',
          mimetype: 'image/png',
          toBuffer: async () => Buffer.from('fake-png-content'),
        };
        yield {
          type: 'field' as const,
          fieldname: 'category',
          value: 'TEACHER_DOCUMENTS',
        };
        yield {
          type: 'field' as const,
          fieldname: 'ownerEntityType',
          value: 'TEACHER',
        };
        yield {
          type: 'field' as const,
          fieldname: 'ownerEntityId',
          value: ownerId,
        };
        yield {
          type: 'field' as const,
          fieldname: 'description',
          value: 'Firma oficial del docente',
        };
      }

      // Docente sube archivo a SU PROPIO expediente (teacher #42) -> permitido
      await controller.uploadMultipartFile(
        teacherPrincipal,
        { parts: () => buildMultipartParts('42') } as any,
      );
      expect(useCaseMock.uploadSchoolFile).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'TEACHER_DOCUMENTS',
          ownerEntityType: 'TEACHER',
          ownerEntityId: 42n,
          description: 'Firma oficial del docente',
        }),
      );

      // Docente intenta subir archivo al expediente de OTRO docente (#99) -> 403 bloqueado
      await expect(
        controller.uploadMultipartFile(
          teacherPrincipal,
          { parts: () => buildMultipartParts('99') } as any,
        ),
      ).rejects.toThrow(TenantAccessDeniedException);

      // Listado de TEACHER sin ownerEntityId -> 400 BadRequest (prohibe expedientes sueltos)
      await expect(
        controller.listSchoolFiles(teacherPrincipal, {
          ownerEntityType: 'TEACHER',
        }),
      ).rejects.toThrow(BadRequestException);

      // Listado del expediente de OTRO docente (#99) -> 403 bloqueado
      await expect(
        controller.listSchoolFiles(teacherPrincipal, {
          ownerEntityType: 'TEACHER',
          ownerEntityId: '99',
        }),
      ).rejects.toThrow(TenantAccessDeniedException);

      // Listado del PROPIO expediente (#42) -> permitido
      await expect(
        controller.listSchoolFiles(teacherPrincipal, {
          ownerEntityType: 'TEACHER',
          ownerEntityId: '42',
        }),
      ).resolves.toEqual(expect.objectContaining({ success: true }));

      // Cualquier usuario autenticado puede subir su propia foto de perfil (USER)
      const studentPrincipal = buildPrincipal({
        userId: 77n,
        activeRole: CommunityRole.STUDENT,
      });
      await expect(
        controller.uploadFile(studentPrincipal, {
          category: 'USER_AVATARS',
          ownerEntityType: 'USER',
          ownerEntityId: '77',
          originalFileName: 'avatar.png',
          mimeType: 'image/png',
          base64Content: Buffer.from('png').toString('base64'),
        }),
      ).resolves.toEqual(expect.objectContaining({ success: true }));

      // Pero NO puede sobrescribir la foto de otro usuario (#88)
      await expect(
        controller.uploadFile(studentPrincipal, {
          category: 'USER_AVATARS',
          ownerEntityType: 'USER',
          ownerEntityId: '88',
          originalFileName: 'avatar.png',
          mimeType: 'image/png',
          base64Content: Buffer.from('png').toString('base64'),
        }),
      ).rejects.toThrow(TenantAccessDeniedException);
    });

    it('maps every entity type to exact read and write RBAC permissions', () => {
      expect(resolveStorageCategoryWritePermissions('TEACHER')).toEqual([
        RBAC_PERMISSIONS.STORAGE_TEACHER_DOCUMENTS_WRITE,
      ]);
      expect(
        resolveStorageCategoryWritePermissions('ADMINISTRATIVE_STAFF'),
      ).toEqual([
        RBAC_PERMISSIONS.STORAGE_TEACHER_DOCUMENTS_WRITE,
        RBAC_PERMISSIONS.ADMIN_STAFF_WRITE,
      ]);
      expect(resolveStorageCategoryWritePermissions('FAMILY')).toEqual([
        RBAC_PERMISSIONS.STORAGE_STUDENT_DOCUMENTS_WRITE,
      ]);
      expect(resolveStorageEntityReadPermissions('TEACHER')).toContain(
        RBAC_PERMISSIONS.ADMIN_TEACHERS_VIEW,
      );
      expect(resolveStorageEntityReadPermissions('ADMINISTRATIVE_STAFF')).toContain(
        RBAC_PERMISSIONS.ADMIN_STAFF_VIEW,
      );
      expect(resolveStorageEntityReadPermissions('FAMILY')).toContain(
        RBAC_PERMISSIONS.ACADEMIC_ENROLLMENTS_VIEW,
      );
    });
  });

  describe('Live PostgreSQL 17 RLS Per-Record Isolation (cloud_files)', () => {
    let db: PostgresRlsService | null = null;
    let repo: PostgresCloudFileRepository | null = null;
    let useCase: ManageCloudFilesUseCase | null = null;
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
      db = new PostgresRlsService(config, logger);
      repo = new PostgresCloudFileRepository(db);
      useCase = new ManageCloudFilesUseCase(repo, s3Adapter, logger);
    });

    afterAll(async () => {
      if (db) {
        await db.onModuleDestroy();
      }
    });

    it('strictly isolates digital files between two different teacher records in PostgreSQL 17', async () => {
      if (!postgresAvailable || !db || !repo || !useCase) {
        return;
      }

      const teacherIds = await db.withTenantTransaction(1n, async (client) => {
        const res = await client.query<{ id: string }>(
          `SELECT id FROM teacher_profiles WHERE school_id = 1 ORDER BY id ASC LIMIT 2`,
        );
        return res.rows.map((r) => BigInt(r.id));
      });

      if (teacherIds.length < 2) {
        return;
      }

      const [teacherA, teacherB] = teacherIds;
      const createdFileIds: bigint[] = [];

      try {
        expect(await repo.ownerEntityExists(1n, 'TEACHER', teacherA)).toBe(true);
        expect(await repo.ownerEntityExists(1n, 'TEACHER', 999999999n)).toBe(
          false,
        );

        const fileA = await useCase.uploadSchoolFile({
          schoolId: 1n,
          uploadedByUserId: 1n,
          category: 'TEACHER_DOCUMENTS',
          ownerEntityType: 'TEACHER',
          ownerEntityId: teacherA,
          originalFileName: 'hoja-vida-docente-a.pdf',
          description: 'Soporte Docente A',
          mimeType: 'application/pdf',
          contentBuffer: Buffer.from('%PDF-1.4 teacher A'),
        });
        createdFileIds.push(BigInt(fileA.id));

        const fileB = await useCase.uploadSchoolFile({
          schoolId: 1n,
          uploadedByUserId: 1n,
          category: 'TEACHER_DOCUMENTS',
          ownerEntityType: 'TEACHER',
          ownerEntityId: teacherB,
          originalFileName: 'hoja-vida-docente-b.pdf',
          description: 'Soporte Docente B',
          mimeType: 'application/pdf',
          contentBuffer: Buffer.from('%PDF-1.4 teacher B'),
        });
        createdFileIds.push(BigInt(fileB.id));

        const filesOfA = await useCase.listSchoolFiles(1n, {
          ownerEntityType: 'TEACHER',
          ownerEntityId: teacherA,
        });
        const filesOfB = await useCase.listSchoolFiles(1n, {
          ownerEntityType: 'TEACHER',
          ownerEntityId: teacherB,
        });

        expect(filesOfA.some((f) => f.id === fileA.id)).toBe(true);
        expect(filesOfA.some((f) => f.id === fileB.id)).toBe(false);
        expect(filesOfA.every((f) => f.ownerEntityId === String(teacherA))).toBe(
          true,
        );

        expect(filesOfB.some((f) => f.id === fileB.id)).toBe(true);
        expect(filesOfB.some((f) => f.id === fileA.id)).toBe(false);
        expect(filesOfB.every((f) => f.ownerEntityId === String(teacherB))).toBe(
          true,
        );
      } finally {
        for (const id of createdFileIds) {
          await useCase.deleteSchoolFile(1n, id);
        }
      }
    });
  });
});
