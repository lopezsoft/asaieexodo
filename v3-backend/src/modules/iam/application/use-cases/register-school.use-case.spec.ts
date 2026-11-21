import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailSenderPort } from '../../../../shared/application/ports/mail-sender.port';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';
import { CommunityUser } from '../../domain/entities/community-user.entity';
import { CommunityRole } from '../../domain/enums/community-role.enum';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import {
  RegisterSchoolTransactionInput,
  SchoolOnboardingRepositoryPort,
} from '../../domain/ports/school-onboarding.repository.port';
import { RegisterSchoolUseCase } from './register-school.use-case';

function createConfig(values: Record<string, string>): ConfigService {
  return {
    get: <T>(key: string, defaultValue?: T): T =>
      (values[key] ?? defaultValue) as T,
  } as unknown as ConfigService;
}

describe('RegisterSchoolUseCase (Self-Service School Onboarding)', () => {
  const jwtService = new JwtService({
    secret: 'unit-test-secret-key-at-least-32-characters-long',
  });

  function createUseCase(overrides?: {
    repo?: Partial<SchoolOnboardingRepositoryPort>;
    mail?: Partial<MailSenderPort>;
    config?: Record<string, string>;
  }) {
    let capturedRepoInput: RegisterSchoolTransactionInput | null = null;

    const repo: SchoolOnboardingRepositoryPort = {
      getPublicRegistrationCatalogs: jest.fn().mockResolvedValue({
        documentTypes: [{ id: 1, code: 'C.C', name: 'Cédula de Ciudadanía' }],
        academicCalendars: [{ id: 1, name: 'CALENDARIO A' }],
        schoolSectors: [{ id: 1, name: 'OFICIAL' }],
        institutionTypes: [{ id: 1, name: 'Institución' }],
      }),
      registerSchoolWithStarterSetup: jest
        .fn()
        .mockImplementation(async (input: RegisterSchoolTransactionInput) => {
          capturedRepoInput = input;
          const user = CommunityUser.reconstitute(101n, {
            documentTypeId: input.adminDocumentTypeId,
            documentNumber: input.adminDocumentNumber,
            email: input.adminEmail,
            username: input.username,
            passwordHash: input.passwordHash,
            firstName: input.adminFirstName,
            middleName: input.adminMiddleName,
            lastName: input.adminLastName,
            secondLastName: input.adminSecondLastName,
            avatarUrl: null,
            isActive: true,
            memberships: [
              {
                schoolId: 55n,
                schoolName: input.schoolName,
                schoolDaneCode: input.daneCode,
                role: CommunityRole.SCHOOL_ADMIN,
                isActive: true,
              },
            ],
          });

          return {
            schoolId: 55n,
            schoolName: input.schoolName,
            subscriptionLockDate: input.subscriptionLockDate,
            user,
            session: {
              id: 'session-uuid-55',
              tokenJti: 'jti-uuid-55',
              schoolId: 55n,
              userId: 101n,
              expiresAt: input.sessionExpiresAt,
            },
            provisioned: {
              mainCampusCreated: true,
              academicYear: input.academicYear,
              shiftsCount: 2,
              educationLevelsCount: 4,
              enabledModulesCount: 8,
            },
          };
        }),
      ...overrides?.repo,
    };

    const passwordHasher: PasswordHasherPort = {
      hash: jest.fn().mockResolvedValue('scrypt:mock-salt:mock-hash'),
      verify: jest.fn().mockResolvedValue(true),
      needsRehash: jest.fn().mockReturnValue(false),
      verifyDummy: jest.fn().mockResolvedValue(undefined),
    };

    const mailSender: MailSenderPort = {
      sendTransactionalEmail: jest.fn(),
      sendEmailConfirmation: jest.fn().mockResolvedValue({
        delivered: true,
        messageId: 'msg-1',
        provider: 'NODEMAILER_JSON_TEST',
        recipientEmail: 'rectoria@colegio.edu.co',
        templateType: 'EMAIL_CONFIRMATION',
      }),
      sendPasswordResetEmail: jest.fn(),
      sendPasswordChangedAlert: jest.fn(),
      sendCrmOmnichannelNotification: jest.fn(),
      ...overrides?.mail,
    };

    const logger = new SmartLoggerService();
    jest.spyOn(logger, 'log').mockImplementation(() => undefined);

    const useCase = new RegisterSchoolUseCase(
      repo,
      passwordHasher,
      jwtService,
      mailSender,
      createConfig({
        FRONTEND_URL: 'http://localhost:7200',
        SCHOOL_TRIAL_DAYS: '30',
        ...overrides?.config,
      }),
      logger,
    );

    return {
      useCase,
      repo,
      passwordHasher,
      mailSender,
      getCapturedRepoInput: () => capturedRepoInput,
    };
  }

  it('registers a new school, hashes password, signs SCHOOL_ADMIN JWT and sends verification email', async () => {
    const { useCase, passwordHasher, mailSender, getCapturedRepoInput } =
      createUseCase();

    const output = await useCase.registerSchool({
      schoolName: 'Institución Educativa San José',
      shortName: 'IE San José',
      daneCode: '323580006675',
      adminDocumentTypeId: 1,
      adminDocumentNumber: '1000999888',
      adminFirstName: 'María',
      adminLastName: 'Gómez',
      adminEmail: 'Rectoria@Colegio.EDU.CO',
      username: 'Maria.Gomez',
      password: 'Password2026*',
      ipAddress: '127.0.0.1',
      userAgent: 'jest-test',
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith('Password2026*');

    const captured = getCapturedRepoInput();
    expect(captured).not.toBeNull();
    expect(captured?.username).toBe('maria.gomez');
    expect(captured?.adminEmail).toBe('rectoria@colegio.edu.co');
    expect(captured?.storageFolder).toMatch(/^ie_san_jose_[0-9a-f]{6}$/);

    const verifiedPayload = await jwtService.verifyAsync(output.accessToken);
    expect(verifiedPayload.schoolId).toBe(55);
    expect(verifiedPayload.activeRole).toBe(CommunityRole.SCHOOL_ADMIN);
    expect(verifiedPayload.tokenType).toBe('ACCESS');
    expect(verifiedPayload.sid).toBe('session-uuid-55');

    expect(output.activeSchoolId).toBe(55);
    expect(output.activeRole).toBe(CommunityRole.SCHOOL_ADMIN);
    expect(output.onboarding.trialDays).toBe(30);
    expect(output.onboarding.emailConfirmationSent).toBe(true);
    expect(output.onboarding.provisioned.enabledModulesCount).toBe(8);
    expect(mailSender.sendEmailConfirmation).toHaveBeenCalledTimes(1);
  });

  it('propagates ConflictException when repository reports duplicate username, document or DANE', async () => {
    const { useCase } = createUseCase({
      repo: {
        registerSchoolWithStarterSetup: jest
          .fn()
          .mockRejectedValue(
            new ConflictException('El nombre de usuario ya está registrado.'),
          ),
      },
    });

    await expect(
      useCase.registerSchool({
        schoolName: 'Colegio Duplicado',
        adminDocumentTypeId: 1,
        adminDocumentNumber: '123456',
        adminFirstName: 'Juan',
        adminLastName: 'Pérez',
        adminEmail: 'juan@colegio.edu.co',
        username: 'juan.perez',
        password: 'Password2026*',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('keeps registration successful even if SMTP email delivery fails', async () => {
    const { useCase } = createUseCase({
      mail: {
        sendEmailConfirmation: jest
          .fn()
          .mockRejectedValue(new Error('SMTP connection timeout')),
      },
    });

    const output = await useCase.registerSchool({
      schoolName: 'Colegio Sin SMTP',
      adminDocumentTypeId: 1,
      adminDocumentNumber: '987654',
      adminFirstName: 'Laura',
      adminLastName: 'Díaz',
      adminEmail: 'laura@colegio.edu.co',
      username: 'laura.diaz',
      password: 'Password2026*',
    });

    expect(output.accessToken).toBeTruthy();
    expect(output.onboarding.emailConfirmationSent).toBe(false);
    expect(output.onboarding.provisioned.mainCampusCreated).toBe(true);
  });

  it('sanitizes storageFolder slug removing accents, symbols and handling short names', () => {
    expect(
      RegisterSchoolUseCase.buildStorageFolderSlug(
        'I.E. Niño Jesús de Praga - Ñandú!',
        'abc123',
      ),
    ).toBe('i_e_nino_jesus_de_praga_nandu_abc123');

    expect(
      RegisterSchoolUseCase.buildStorageFolderSlug('!!', 'def456'),
    ).toBe('ie_school_def456');
  });
});
