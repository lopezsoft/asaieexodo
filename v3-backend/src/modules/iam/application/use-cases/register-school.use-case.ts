import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import { MailSenderPort } from '../../../../shared/application/ports/mail-sender.port';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';
import { CommunityRole } from '../../domain/enums/community-role.enum';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import {
  ProvisionedSchoolSummary,
  PublicRegistrationCatalogs,
  SchoolOnboardingRepositoryPort,
} from '../../domain/ports/school-onboarding.repository.port';
import { AuthenticatedSessionOutput } from './authenticate-community-user.use-case';

export interface RegisterSchoolInput {
  readonly schoolName: string;
  readonly shortName?: string;
  readonly daneCode?: string;
  readonly taxId?: string;
  readonly calendarId?: number;
  readonly sectorId?: number;
  readonly institutionTypeId?: number;
  readonly schoolEmail?: string;
  readonly schoolPhone?: string;
  readonly schoolAddress?: string;
  readonly adminDocumentTypeId: number;
  readonly adminDocumentNumber: string;
  readonly adminFirstName: string;
  readonly adminMiddleName?: string;
  readonly adminLastName: string;
  readonly adminSecondLastName?: string;
  readonly adminEmail: string;
  readonly adminPhone?: string;
  readonly username: string;
  readonly password: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface RegisteredSchoolSessionOutput
  extends AuthenticatedSessionOutput {
  readonly onboarding: {
    readonly trialDays: number;
    readonly subscriptionLockDate: string;
    readonly emailConfirmationSent: boolean;
    readonly provisioned: ProvisionedSchoolSummary;
  };
}

const DEFAULT_TRIAL_DAYS = 30;
const MIN_TRIAL_DAYS = 7;
const MAX_TRIAL_DAYS = 365;
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const EMAIL_TOKEN_DURATION_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class RegisterSchoolUseCase {
  constructor(
    private readonly onboardingRepository: SchoolOnboardingRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly jwtService: JwtService,
    private readonly mailSender: MailSenderPort,
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {}

  static buildStorageFolderSlug(name: string, randomSuffix?: string): string {
    const asciiBase = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80);

    const safeBase = asciiBase.length >= 3 ? asciiBase : `ie_${asciiBase || 'school'}`;
    const suffix = randomSuffix ?? crypto.randomBytes(3).toString('hex');
    return `${safeBase}_${suffix}`.slice(0, 120);
  }

  async getPublicRegistrationCatalogs(): Promise<PublicRegistrationCatalogs> {
    return this.onboardingRepository.getPublicRegistrationCatalogs();
  }

  async registerSchool(
    input: RegisterSchoolInput,
  ): Promise<RegisteredSchoolSessionOutput> {
    const schoolName = input.schoolName.trim();
    const shortName = this.normalizeOptionalString(input.shortName);
    const daneCode = this.normalizeOptionalString(input.daneCode);
    const taxId = this.normalizeOptionalString(input.taxId);
    const schoolEmail = this.normalizeOptionalEmail(input.schoolEmail);
    const schoolPhone = this.normalizeOptionalString(input.schoolPhone);
    const schoolAddress = this.normalizeOptionalString(input.schoolAddress);
    const adminEmail = input.adminEmail.trim().toLowerCase();
    const username = input.username.trim().toLowerCase();
    const adminDocumentNumber = input.adminDocumentNumber.trim();
    const academicYear = new Date().getFullYear();

    const trialDays = this.resolveTrialDays();
    const subscriptionLockDate = this.computeTrialLockDate(trialDays);
    const storageFolder = RegisterSchoolUseCase.buildStorageFolderSlug(
      shortName || schoolName,
    );

    const passwordHash = await this.passwordHasher.hash(input.password);
    const rawVerificationToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawVerificationToken)
      .digest('hex');

    const now = Date.now();
    const result =
      await this.onboardingRepository.registerSchoolWithStarterSetup({
        schoolName,
        shortName,
        daneCode,
        taxId,
        calendarId: input.calendarId ?? 1,
        sectorId: input.sectorId ?? 1,
        institutionTypeId: input.institutionTypeId ?? 1,
        schoolEmail,
        schoolPhone,
        schoolAddress,
        storageFolder,
        subscriptionLockDate,
        adminDocumentTypeId: input.adminDocumentTypeId,
        adminDocumentNumber,
        adminFirstName: input.adminFirstName.trim(),
        adminMiddleName: this.normalizeOptionalString(input.adminMiddleName),
        adminLastName: input.adminLastName.trim(),
        adminSecondLastName: this.normalizeOptionalString(
          input.adminSecondLastName,
        ),
        adminEmail,
        adminPhone: this.normalizeOptionalString(input.adminPhone),
        username,
        passwordHash,
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: new Date(now + EMAIL_TOKEN_DURATION_MS),
        sessionExpiresAt: new Date(now + SESSION_DURATION_MS),
        academicYear,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      });

    const accessToken = await this.jwtService.signAsync({
      sub: Number(result.user.id),
      username: result.user.username,
      fullName: result.user.fullName,
      schoolId: Number(result.schoolId),
      activeRole: CommunityRole.SCHOOL_ADMIN,
      academicYear,
      sid: result.session.id,
      jti: result.session.tokenJti,
      tokenType: 'ACCESS',
    });

    const emailConfirmationSent = await this.dispatchVerificationEmailSafe({
      recipientEmail: adminEmail,
      recipientFullName: result.user.fullName,
      schoolName: result.schoolName,
      confirmationToken: rawVerificationToken,
    });

    this.logger.log(
      'Nueva Institución Educativa auto-registrada y aprovisionada con éxito',
      {
        schoolId: Number(result.schoolId),
        trialDays,
        emailConfirmationSent,
        academicYear,
      },
    );

    return {
      accessToken,
      sessionId: result.session.id,
      activeSchoolId: Number(result.schoolId),
      activeSchoolName: result.schoolName,
      activeRole: CommunityRole.SCHOOL_ADMIN,
      academicYear,
      user: result.user.toPublicProfile(),
      onboarding: {
        trialDays,
        subscriptionLockDate: result.subscriptionLockDate,
        emailConfirmationSent,
        provisioned: result.provisioned,
      },
    };
  }

  private async dispatchVerificationEmailSafe(params: {
    recipientEmail: string;
    recipientFullName: string;
    schoolName: string;
    confirmationToken: string;
  }): Promise<boolean> {
    try {
      const frontendBaseUrl = this.configService
        .get<string>('FRONTEND_URL', 'http://localhost:7200')
        .replace(/\/+$/, '');
      const confirmationUrl = `${frontendBaseUrl}/auth/confirm-email?token=${encodeURIComponent(params.confirmationToken)}`;

      const delivery = await this.mailSender.sendEmailConfirmation({
        recipientEmail: params.recipientEmail,
        recipientFullName: params.recipientFullName,
        schoolName: params.schoolName,
        confirmationToken: params.confirmationToken,
        confirmationUrl,
      });
      return delivery.delivered;
    } catch {
      return false;
    }
  }

  private resolveTrialDays(): number {
    const raw = Number(
      this.configService.get<string>(
        'SCHOOL_TRIAL_DAYS',
        String(DEFAULT_TRIAL_DAYS),
      ),
    );
    if (!Number.isFinite(raw)) {
      return DEFAULT_TRIAL_DAYS;
    }
    return Math.min(MAX_TRIAL_DAYS, Math.max(MIN_TRIAL_DAYS, Math.round(raw)));
  }

  private computeTrialLockDate(trialDays: number): string {
    const lockDate = new Date();
    lockDate.setUTCDate(lockDate.getUTCDate() + trialDays);
    return lockDate.toISOString().slice(0, 10);
  }

  private normalizeOptionalString(value?: string): string | null {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  }

  private normalizeOptionalEmail(value?: string): string | null {
    const trimmed = value?.trim().toLowerCase();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  }
}
