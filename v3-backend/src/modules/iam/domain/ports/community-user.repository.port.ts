import { CommunityUser } from '../entities/community-user.entity';
import { CommunityRole } from '../enums/community-role.enum';

export type SecurityTokenType =
  | 'EMAIL_VERIFICATION'
  | 'PASSWORD_RESET'
  | 'MFA_CHALLENGE'
  | 'INVITATION';

export interface UpsertCommunityUserInput {
  readonly documentTypeId: number;
  readonly documentNumber: string;
  readonly email?: string | null;
  readonly username: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly middleName?: string | null;
  readonly lastName: string;
  readonly secondLastName?: string | null;
  readonly schoolId: bigint;
  readonly role: CommunityRole;
}

export interface CreateAuthSessionInput {
  readonly schoolId: bigint;
  readonly userId: bigint;
  readonly ipAddress?: string | null;
  readonly userAgent?: string | null;
  readonly deviceInfo?: string | null;
  readonly expiresAt: Date;
}

export interface AuthSessionRecord {
  readonly id: string;
  readonly tokenJti: string;
  readonly schoolId: bigint;
  readonly userId: bigint;
  readonly expiresAt: Date;
}

export interface CreateSecurityTokenInput {
  readonly userId: bigint;
  readonly tokenType: SecurityTokenType;
  readonly tokenHash: string;
  readonly targetEmail?: string | null;
  readonly requestedIp?: string | null;
  readonly expiresAt: Date;
}

export interface ConsumedSecurityToken {
  readonly id: string;
  readonly userId: bigint;
  readonly tokenType: SecurityTokenType;
  readonly targetEmail: string | null;
}

export interface UpdateOwnProfileInput {
  readonly firstName: string;
  readonly middleName?: string | null;
  readonly lastName: string;
  readonly secondLastName?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly avatarUrl?: string | null;
}

export abstract class CommunityUserRepositoryPort {
  abstract findByUsernameOrDocument(
    identifier: string,
  ): Promise<CommunityUser | null>;
  abstract findById(userId: bigint): Promise<CommunityUser | null>;
  abstract upsertWithMembership(
    input: UpsertCommunityUserInput,
  ): Promise<CommunityUser>;
  abstract updateOwnProfile(
    userId: bigint,
    input: UpdateOwnProfileInput,
  ): Promise<CommunityUser>;
  abstract updateUsername(
    userId: bigint,
    newUsername: string,
  ): Promise<CommunityUser>;
  abstract updatePasswordHash(
    userId: bigint,
    newPasswordHash: string,
  ): Promise<void>;
  abstract markEmailVerified(userId: bigint): Promise<void>;
  abstract updateLastLoginAt(userId: bigint): Promise<void>;

  // Gestion transaccional de sesiones en auth_sessions (RLS)
  abstract createAuthSession(
    input: CreateAuthSessionInput,
  ): Promise<AuthSessionRecord>;
  abstract revokeAuthSession(
    schoolId: bigint,
    sessionId: string,
    reason: string,
  ): Promise<void>;
  abstract revokeAllUserSessions(
    userId: bigint,
    reason: string,
    exceptSessionId?: string,
  ): Promise<void>;

  // Gestion de tokens criptograficos de un solo uso (user_security_tokens)
  abstract revokePendingSecurityTokens(
    userId: bigint,
    tokenType: SecurityTokenType,
  ): Promise<void>;
  abstract createSecurityToken(input: CreateSecurityTokenInput): Promise<void>;
  abstract consumeSecurityToken(
    tokenHash: string,
    expectedType: SecurityTokenType,
  ): Promise<ConsumedSecurityToken | null>;
}
