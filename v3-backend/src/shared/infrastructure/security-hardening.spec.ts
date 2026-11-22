import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigurableEmbeddingAdapter } from '../../modules/crm/infrastructure/embeddings/configurable-embedding.adapter';
import { CommunityRole } from '../../modules/iam/domain/enums/community-role.enum';
import { CryptoPasswordHasherAdapter } from '../../modules/iam/infrastructure/security/crypto-password-hasher.adapter';
import { JasperReportQueueProcessor } from '../../modules/reporting/infrastructure/queues/jasper-report.processor';
import { ManageCloudFilesUseCase } from '../../modules/storage/application/use-cases/manage-cloud-files.use-case';
import { DomainException } from '../domain/exceptions/domain.exception';
import { TenantAccessDeniedException } from '../domain/exceptions/tenant-access-denied.exception';
import { validateEnvironment } from './config/environment.validation';
import { GlobalExceptionFilter } from './http/filters/global-exception.filter';
import { JwtAuthGuard } from './http/guards/jwt-auth.guard';
import { RolesGuard } from './http/guards/roles.guard';
import { SmartLoggerService } from './logging/smart-logger.service';
import { NodemailerSmtpMailAdapter } from './mail/nodemailer-smtp.adapter';
import { JasperReportAdapter } from './reporting/jasper-report.adapter';
import { AwsS3StorageAdapter } from './storage/aws-s3-storage.adapter';

function createConfig(values: Record<string, string>): ConfigService {
  return {
    get: <T>(key: string, defaultValue?: T): T =>
      (values[key] ?? defaultValue) as T,
  } as unknown as ConfigService;
}

describe('ASAIE V3 Security Hardening & Architecture Unit Suite', () => {
  const logger = new SmartLoggerService();

  describe('Environment fail-fast validation', () => {
    it('rejects weak JWT_SECRET, default DB_PASSWORD or wildcard CORS in production', () => {
      expect(() =>
        validateEnvironment({
          NODE_ENV: 'production',
          JWT_SECRET: 'short',
        }),
      ).toThrow();

      expect(() =>
        validateEnvironment({
          NODE_ENV: 'production',
          JWT_SECRET: 'A'.repeat(40),
          DB_PASSWORD: 'asaie_local_secret_2026',
        }),
      ).toThrow();

      expect(() =>
        validateEnvironment({
          NODE_ENV: 'production',
          JWT_SECRET: 'A'.repeat(40),
          DB_PASSWORD: 'UltraStrongPgPassword!2026',
          REDIS_PASSWORD: 'UltraStrongRedisPassword!2026',
          CORS_ORIGIN: '*',
          FRONTEND_URL: 'https://campus.asaie.co',
          AWS_BUCKET: 'asaie-prod-bucket',
        }),
      ).toThrow();
    });

    it('accepts hardened production configuration', () => {
      expect(() =>
        validateEnvironment({
          NODE_ENV: 'production',
          JWT_SECRET: 'P'.repeat(48),
          DB_PASSWORD: 'UltraStrongPgPassword!2026',
          REDIS_PASSWORD: 'UltraStrongRedisPassword!2026',
          CORS_ORIGIN: 'https://campus.asaie.co',
          FRONTEND_URL: 'https://campus.asaie.co',
          AWS_BUCKET: 'asaie-prod-bucket',
        }),
      ).not.toThrow();
    });
  });

  describe('JwtAuthGuard & RolesGuard', () => {
    const jwtSecret = 'unit-test-secret-key-at-least-32-characters-long';
    const jwtService = new JwtService({ secret: jwtSecret });

    it('blocks missing Bearer token and blocks x-school-id header spoofing against JWT schoolId', async () => {
      const reflector = {
        getAllAndOverride: jest.fn().mockReturnValue(false),
      } as unknown as Reflector;
      const dbMock = {
        withTenantTransaction: jest.fn().mockResolvedValue(true),
      } as any;

      const guard = new JwtAuthGuard(
        reflector,
        jwtService,
        createConfig({ JWT_SECRET: jwtSecret }),
        dbMock,
      );

      const unauthCtx = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ headers: {} }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(unauthCtx)).rejects.toThrow(
        UnauthorizedException,
      );

      const token = await jwtService.signAsync({
        sub: 1,
        username: 'admin.comunidad',
        fullName: 'Admin Comunidad',
        schoolId: 1,
        activeRole: CommunityRole.RECTOR,
        academicYear: 2026,
        sid: 'session-uuid-1',
        tokenType: 'ACCESS',
      });

      const spoofedCtx = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Bearer ${token}`,
              'x-school-id': '7',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(spoofedCtx)).rejects.toThrow(
        TenantAccessDeniedException,
      );

      const validReq: any = {
        headers: { authorization: `Bearer ${token}` },
      };
      const validCtx = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => validReq }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(validCtx)).resolves.toBe(true);
      expect(validReq.user.schoolId).toBe(1n);
      expect(validReq.user.userId).toBe(1n);
      expect(validReq.user.activeRole).toBe(CommunityRole.RECTOR);
    });

    it('enforces RBAC via RolesGuard', () => {
      const reflector = {
        getAllAndOverride: jest
          .fn()
          .mockReturnValueOnce(false)
          .mockReturnValueOnce([CommunityRole.SUPER_ADMIN]),
      } as unknown as Reflector;

      const rolesGuard = new RolesGuard(reflector);
      const ctx = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { activeRole: CommunityRole.STUDENT },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(() => rolesGuard.canActivate(ctx)).toThrow(
        TenantAccessDeniedException,
      );
    });
  });

  describe('JasperReportAdapter security & JasperReportQueueProcessor S3 persistence', () => {
    it('blocks path traversal and reserved SQL_PARAM / P_SCHOOL_ID parameters', () => {
      const adapter = new JasperReportAdapter(
        createConfig({ DB_PORT: '5434' }),
        logger,
      );

      expect(() =>
        adapter.validateTemplateAndParameters('../../etc/passwd', {}),
      ).toThrow(DomainException);

      expect(() =>
        adapter.validateTemplateAndParameters('boletin_carta_areas', {
          SQL_PARAM: 'SELECT * FROM users',
        }),
      ).toThrow(DomainException);

      expect(() =>
        adapter.validateTemplateAndParameters('boletin_carta_areas', {
          P_SCHOOL_ID: 7,
        }),
      ).toThrow(DomainException);

      expect(() =>
        adapter.validateTemplateAndParameters('boletin_carta_areas', {
          '-u': 'postgres',
        }),
      ).toThrow(DomainException);

      const safe = adapter.validateTemplateAndParameters(
        'boletin_carta_areas',
        { P_YEAR: 2026 },
      );
      expect(safe.sanitizedClientParams.P_YEAR).toBe(2026);
    });

    it('persists generated Jasper buffer into AWS S3 cloud_files instead of discarding it', async () => {
      const reportGeneratorMock = {
        generateFromTemplate: jest.fn().mockResolvedValue({
          fileName: 'boletin_123.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('%PDF-1.4 valid report'),
        }),
      };
      const cloudFilesMock = {
        uploadSchoolFile: jest.fn().mockResolvedValue({
          id: '42',
          fileUuid: 'uuid-42',
          fileName: 'boletin_123.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 21,
        }),
      };

      const processor = new JasperReportQueueProcessor(
        reportGeneratorMock as any,
        cloudFilesMock as any,
        logger,
      );

      const result = await processor.process({
        id: 'job-9',
        data: {
          schoolId: '1',
          requestedByUserId: '5',
          requestedByFullName: 'Rector Prueba',
          templateName: 'boletin_carta_areas',
          outputFormat: 'pdf',
          parameters: { P_YEAR: 2026 },
        },
      } as any);

      expect(cloudFilesMock.uploadSchoolFile).toHaveBeenCalledWith(
        expect.objectContaining({
          schoolId: 1n,
          category: 'JASPER_REPORTS',
        }),
      );
      expect(result.fileId).toBe('42');
      expect(result.schoolId).toBe('1');
    });
  });

  describe('AwsS3StorageAdapter & ManageCloudFilesUseCase compensation', () => {
    it('honors AWS_MAIN_PATH, blocks dangerous MIME types and compensates S3 on DB failure', async () => {
      const s3Adapter = new AwsS3StorageAdapter(
        createConfig({
          NODE_ENV: 'test',
          AWS_MAIN_PATH: 'test',
          AWS_BUCKET: 'asaie-app-storage',
        }),
        logger,
      );

      const built = s3Adapter.buildSchoolObjectKey({
        storageFolder: 'pto_beato',
        category: 'STUDENT_DOCUMENTS',
        originalFileName: 'Registro Civil.pdf',
        academicYear: 2026,
      });
      expect(built.storageKey).toMatch(
        /^test\/pto_beato\/student-documents\/2026\//,
      );

      expect(() =>
        s3Adapter.validateFileMetadata({
          originalFileName: 'evil.svg',
          mimeType: 'image/svg+xml',
          sizeBytes: 100,
        }),
      ).toThrow(DomainException);

      expect(() =>
        s3Adapter.validateFileMetadata({
          originalFileName: 'fake.exe',
          mimeType: 'application/pdf',
          sizeBytes: 100,
        }),
      ).toThrow(DomainException);

      const deleteSpy = jest.spyOn(s3Adapter, 'deleteObject');
      const failingRepo = {
        resolveSchoolStorageFolder: jest.fn().mockResolvedValue('pto_beato'),
        saveCloudFile: jest
          .fn()
          .mockRejectedValue(new Error('DB connection lost')),
      };
      const useCase = new ManageCloudFilesUseCase(
        failingRepo as any,
        s3Adapter,
        logger,
      );

      await expect(
        useCase.uploadSchoolFile({
          schoolId: 1n,
          category: 'STUDENT_DOCUMENTS',
          originalFileName: 'acta.pdf',
          mimeType: 'application/pdf',
          contentBuffer: Buffer.from('%PDF-1.4 content'),
        }),
      ).rejects.toThrow('DB connection lost');

      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('NodemailerSmtpMailAdapter HTML escaping, ASAIE branding & ConfigurableEmbeddingAdapter', () => {
    it('escapes HTML injection payloads in CRM notifications and applies ASAIE ÉXODO brand tokens + inline logo CID', async () => {
      const adapter = new NodemailerSmtpMailAdapter(
        createConfig({ NODE_ENV: 'test' }),
        logger,
      );
      const sendSpy = jest.spyOn(adapter, 'sendTransactionalEmail');

      await adapter.sendCrmOmnichannelNotification({
        recipientEmail: 'familia@colegio.edu.co',
        recipientFullName: '<script>alert(1)</script>',
        schoolName: 'IE <Prueba>',
        subject: 'Cita <img src=x onerror=alert(1)>',
        messageBody: 'Hola <b>padre</b>\n<script>steal()</script>',
      });

      const sentInput = sendSpy.mock.calls[0][0];
      expect(sentInput.html).not.toContain('<script>');
      expect(sentInput.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(sentInput.html).toContain('#032344');
      expect(sentInput.html).toContain('#053f74');
      expect(sentInput.html).toContain('#0399de');
      expect(sentInput.html).toContain('cid:asaie-brand-logo');
      expect(sentInput.text).toBeDefined();

      await adapter.sendPasswordResetEmail({
        recipientEmail: 'docente@colegio.edu.co',
        recipientFullName: 'Lewis López',
        resetToken: 'abc123',
        resetUrl: 'https://campus.asaie.co/auth/reset-password?token=abc123',
        expiresInMinutes: 30,
      });

      const resetInput = sendSpy.mock.calls[1][0];
      expect(resetInput.html).toContain('Restablecer Mi Contraseña');
      expect(resetInput.html).toContain('https://campus.asaie.co/auth/reset-password?token=abc123');
      expect(resetInput.html).toContain('30 minutos');
      expect(resetInput.html).toContain('#0277bd');
    });

    it('rejects wrong dimensions, NaN and zero-norm vectors in ConfigurableEmbeddingAdapter', async () => {
      const adapter = new ConfigurableEmbeddingAdapter(
        createConfig({ EMBEDDING_PROVIDER: 'fallback' }),
        logger,
      );

      expect(() => adapter.validateVector([1, 2, 3])).toThrow(DomainException);
      expect(() =>
        adapter.validateVector(new Array<number>(768).fill(0)),
      ).toThrow(DomainException);

      const generated = await adapter.generateEmbedding(
        'Nivelación y recuperación de áreas según SIEE',
      );
      expect(generated).toHaveLength(768);
      expect(generated.every((v) => Number.isFinite(v))).toBe(true);
    });
  });

  describe('CryptoPasswordHasherAdapter, SmartLoggerService & GlobalExceptionFilter', () => {
    it('hashes/verifies scrypt passwords and marks legacy bcrypt hashes for automatic rehash', async () => {
      const hasher = new CryptoPasswordHasherAdapter();
      const hashed = await hasher.hash('Asaie2026*Secure');

      await expect(hasher.verify('Asaie2026*Secure', hashed)).resolves.toBe(
        true,
      );
      await expect(hasher.verify('WrongPass', hashed)).resolves.toBe(false);
      expect(hasher.needsRehash(hashed)).toBe(false);
      expect(
        hasher.needsRehash(
          '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        ),
      ).toBe(true);
    });

    it('handles circular references, BigInt, Error and redacts tokens in SmartLoggerService', () => {
      const stdoutSpy = jest
        .spyOn(process.stdout, 'write')
        .mockImplementation(() => true);

      const circular: Record<string, unknown> = {
        schoolId: 1n,
        email: 'secreto@asaie.co',
        resetToken: 'super-secret-token',
      };
      circular.self = circular;

      expect(() =>
        logger.log('Token Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig', circular),
      ).not.toThrow();

      const written = String(stdoutSpy.mock.calls[0][0]);
      expect(written).not.toContain('secreto@asaie.co');
      expect(written).not.toContain('super-secret-token');
      expect(written).not.toContain('eyJhbGciOiJIUzI1NiJ9');
      expect(written).toContain('[CIRCULAR_REFERENCE]');
      stdoutSpy.mockRestore();
    });

    it('strips query strings and maps PostgreSQL 23505 to 409 Conflict in GlobalExceptionFilter', () => {
      const filter = new GlobalExceptionFilter(logger);
      const replyMock = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const hostMock = {
        switchToHttp: () => ({
          getResponse: () => replyMock,
          getRequest: () => ({
            method: 'POST',
            url: '/api/v1/auth/reset-password?token=secret123',
          }),
        }),
      } as any;

      filter.catch({ code: '23505' }, hostMock);

      expect(replyMock.status).toHaveBeenCalledWith(409);
      const sent = replyMock.send.mock.calls[0][0];
      expect(sent.path).toBe('/api/v1/auth/reset-password');
      expect(sent.path).not.toContain('secret123');
      expect(sent.errorCode).toBe('DUPLICATE_RESOURCE');
    });
  });
});
