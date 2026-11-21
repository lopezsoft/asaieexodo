import { CommunityUser } from '../entities/community-user.entity';
import { AuthSessionRecord } from './community-user.repository.port';

export interface PublicCatalogOption {
  readonly id: number;
  readonly name: string;
  readonly code?: string;
}

export interface PublicRegistrationCatalogs {
  readonly documentTypes: PublicCatalogOption[];
  readonly academicCalendars: PublicCatalogOption[];
  readonly schoolSectors: PublicCatalogOption[];
  readonly institutionTypes: PublicCatalogOption[];
}

export interface RegisterSchoolTransactionInput {
  readonly schoolName: string;
  readonly shortName: string | null;
  readonly daneCode: string | null;
  readonly taxId: string | null;
  readonly calendarId: number;
  readonly sectorId: number;
  readonly institutionTypeId: number;
  readonly schoolEmail: string | null;
  readonly schoolPhone: string | null;
  readonly schoolAddress: string | null;
  readonly storageFolder: string;
  readonly subscriptionLockDate: string;
  readonly adminDocumentTypeId: number;
  readonly adminDocumentNumber: string;
  readonly adminFirstName: string;
  readonly adminMiddleName: string | null;
  readonly adminLastName: string;
  readonly adminSecondLastName: string | null;
  readonly adminEmail: string;
  readonly adminPhone: string | null;
  readonly username: string;
  readonly passwordHash: string;
  readonly emailVerificationTokenHash: string;
  readonly emailVerificationExpiresAt: Date;
  readonly sessionExpiresAt: Date;
  readonly academicYear: number;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
}

export interface ProvisionedSchoolSummary {
  readonly mainCampusCreated: boolean;
  readonly academicYear: number;
  readonly shiftsCount: number;
  readonly educationLevelsCount: number;
  readonly enabledModulesCount: number;
}

export interface RegisterSchoolTransactionResult {
  readonly schoolId: bigint;
  readonly schoolName: string;
  readonly subscriptionLockDate: string;
  readonly user: CommunityUser;
  readonly session: AuthSessionRecord;
  readonly provisioned: ProvisionedSchoolSummary;
}

/**
 * Puerto de repositorio para el flujo publico de auto-registro y aprovisionamiento
 * inicial de nuevas Instituciones Educativas en la arquitectura Multi-Tenant RLS.
 */
export abstract class SchoolOnboardingRepositoryPort {
  abstract getPublicRegistrationCatalogs(): Promise<PublicRegistrationCatalogs>;
  abstract registerSchoolWithStarterSetup(
    input: RegisterSchoolTransactionInput,
  ): Promise<RegisterSchoolTransactionResult>;
}
