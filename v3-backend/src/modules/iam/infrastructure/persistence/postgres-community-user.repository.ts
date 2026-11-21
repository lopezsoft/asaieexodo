import { Injectable } from '@nestjs/common';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  CommunityUser,
  SchoolMembershipItem,
} from '../../domain/entities/community-user.entity';
import { CommunityRole } from '../../domain/enums/community-role.enum';
import {
  AuthSessionRecord,
  CommunityUserRepositoryPort,
  ConsumedSecurityToken,
  CreateAuthSessionInput,
  CreateSecurityTokenInput,
  SecurityTokenType,
  UpdateOwnProfileInput,
  UpsertCommunityUserInput,
} from '../../domain/ports/community-user.repository.port';

interface UserRow {
  id: string;
  document_type_id: number;
  document_number: string;
  email: string | null;
  username: string;
  password_hash: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  second_last_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface MembershipRow {
  school_id: string;
  school_name: string;
  dane_code: string | null;
  role: CommunityRole;
  is_active: boolean;
}

@Injectable()
export class PostgresCommunityUserRepository
  implements CommunityUserRepositoryPort
{
  constructor(private readonly db: PostgresRlsService) {}

  async findByUsernameOrDocument(
    identifier: string,
  ): Promise<CommunityUser | null> {
    const userRes = await this.db.queryGlobal<UserRow>(
      `SELECT id, document_type_id, document_number, email, username, password_hash,
              first_name, middle_name, last_name, second_last_name, avatar_url, is_active
       FROM users
       WHERE username = $1 OR document_number = $1
       LIMIT 1`,
      [identifier],
    );

    if (userRes.rowCount === 0) {
      return null;
    }

    const row = userRes.rows[0];
    const memberships = await this.loadUserMemberships(BigInt(row.id));
    return this.mapToAggregate(row, memberships);
  }

  async findById(userId: bigint): Promise<CommunityUser | null> {
    const userRes = await this.db.queryGlobal<UserRow>(
      `SELECT id, document_type_id, document_number, email, username, password_hash,
              first_name, middle_name, last_name, second_last_name, avatar_url, is_active
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [String(userId)],
    );

    if (userRes.rowCount === 0) {
      return null;
    }

    const row = userRes.rows[0];
    const memberships = await this.loadUserMemberships(userId);
    return this.mapToAggregate(row, memberships);
  }

  async upsertWithMembership(
    input: UpsertCommunityUserInput,
  ): Promise<CommunityUser> {
    const userRes = await this.db.queryGlobal<UserRow>(
      `INSERT INTO users (
         document_type_id, document_number, email, username, password_hash,
         first_name, middle_name, last_name, second_last_name
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (document_type_id, document_number)
       DO UPDATE SET
         email = COALESCE(EXCLUDED.email, users.email),
         first_name = EXCLUDED.first_name,
         middle_name = EXCLUDED.middle_name,
         last_name = EXCLUDED.last_name,
         second_last_name = EXCLUDED.second_last_name,
         updated_at = NOW()
       RETURNING id, document_type_id, document_number, email, username, password_hash,
                 first_name, middle_name, last_name, second_last_name, avatar_url, is_active`,
      [
        input.documentTypeId,
        input.documentNumber,
        input.email ?? null,
        input.username,
        input.passwordHash,
        input.firstName,
        input.middleName ?? null,
        input.lastName,
        input.secondLastName ?? null,
      ],
    );

    const userRow = userRes.rows[0];
    const userId = BigInt(userRow.id);

    // Columna `role` es VARCHAR(30) con CHECK (sin cast ::community_role inexistente)
    await this.db.withTenantTransaction(input.schoolId, async (client) => {
      await client.query(
        `INSERT INTO user_school_memberships (school_id, user_id, role, is_active, status)
         VALUES ($1, $2, $3, TRUE, 'ACTIVE')
         ON CONFLICT (school_id, user_id, role)
         DO UPDATE SET is_active = TRUE, status = 'ACTIVE', updated_at = NOW()`,
        [String(input.schoolId), String(userId), input.role],
      );
    });

    const memberships = await this.loadUserMemberships(userId);
    return this.mapToAggregate(userRow, memberships);
  }

  async updatePasswordHash(
    userId: bigint,
    newPasswordHash: string,
  ): Promise<void> {
    await this.db.queryGlobal(
      `UPDATE users
       SET password_hash = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [String(userId), newPasswordHash],
    );
  }

  async markEmailVerified(userId: bigint): Promise<void> {
    await this.db.queryGlobal(
      `UPDATE users
       SET email_verified_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [String(userId)],
    );
  }

  async updateLastLoginAt(userId: bigint): Promise<void> {
    await this.db.queryGlobal(
      `UPDATE users
       SET last_login_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [String(userId)],
    );
  }

  async createAuthSession(
    input: CreateAuthSessionInput,
  ): Promise<AuthSessionRecord> {
    return this.db.withTenantTransaction(input.schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        token_jti: string;
        school_id: string;
        user_id: string;
        expires_at: Date;
      }>(
        `INSERT INTO auth_sessions (
           school_id, user_id, ip_address, user_agent, device_info, expires_at
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, token_jti, school_id, user_id, expires_at`,
        [
          String(input.schoolId),
          String(input.userId),
          input.ipAddress ?? null,
          input.userAgent ?? null,
          input.deviceInfo ?? null,
          input.expiresAt.toISOString(),
        ],
      );

      const row = res.rows[0];
      return {
        id: row.id,
        tokenJti: row.token_jti,
        schoolId: BigInt(row.school_id),
        userId: BigInt(row.user_id),
        expiresAt: new Date(row.expires_at),
      };
    });
  }

  async revokeAuthSession(
    schoolId: bigint,
    sessionId: string,
    reason: string,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      await client.query(
        `UPDATE auth_sessions
         SET is_revoked = TRUE,
             ended_at = NOW(),
             revoked_at = NOW(),
             revocation_reason = $3
         WHERE school_id = $1 AND id = $2 AND is_revoked = FALSE`,
        [String(schoolId), sessionId, reason],
      );
    });
  }

  async revokeAllUserSessions(
    userId: bigint,
    reason: string,
    exceptSessionId?: string,
  ): Promise<void> {
    if (exceptSessionId) {
      await this.db.queryGlobal(
        `UPDATE auth_sessions
         SET is_revoked = TRUE,
             ended_at = NOW(),
             revoked_at = NOW(),
             revocation_reason = $2
         WHERE user_id = $1 AND id <> $3 AND is_revoked = FALSE`,
        [String(userId), reason, exceptSessionId],
      );
      return;
    }

    await this.db.queryGlobal(
      `UPDATE auth_sessions
       SET is_revoked = TRUE,
           ended_at = NOW(),
           revoked_at = NOW(),
           revocation_reason = $2
       WHERE user_id = $1 AND is_revoked = FALSE`,
      [String(userId), reason],
    );
  }

  async updateOwnProfile(
    userId: bigint,
    input: UpdateOwnProfileInput,
  ): Promise<CommunityUser> {
    const res = await this.db.queryGlobal<UserRow>(
      `UPDATE users
       SET first_name = $2,
           middle_name = $3,
           last_name = $4,
           second_last_name = $5,
           email = COALESCE($6, email),
           phone = COALESCE($7, phone),
           avatar_url = CASE WHEN $8::boolean THEN $9 ELSE avatar_url END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, document_type_id, document_number, email, username, password_hash,
                 first_name, middle_name, last_name, second_last_name, avatar_url, is_active`,
      [
        String(userId),
        input.firstName.trim(),
        input.middleName?.trim() || null,
        input.lastName.trim(),
        input.secondLastName?.trim() || null,
        input.email !== undefined ? input.email?.trim() || null : null,
        input.phone !== undefined ? input.phone?.trim() || null : null,
        input.avatarUrl !== undefined,
        input.avatarUrl ?? null,
      ],
    );

    const memberships = await this.loadUserMemberships(userId);
    return this.mapToAggregate(res.rows[0], memberships);
  }

  async updateUsername(
    userId: bigint,
    newUsername: string,
  ): Promise<CommunityUser> {
    const res = await this.db.queryGlobal<UserRow>(
      `UPDATE users
       SET username = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, document_type_id, document_number, email, username, password_hash,
                 first_name, middle_name, last_name, second_last_name, avatar_url, is_active`,
      [String(userId), newUsername.trim().toLowerCase()],
    );

    const memberships = await this.loadUserMemberships(userId);
    return this.mapToAggregate(res.rows[0], memberships);
  }

  async revokePendingSecurityTokens(
    userId: bigint,
    tokenType: SecurityTokenType,
  ): Promise<void> {
    await this.db.queryGlobal(
      `UPDATE user_security_tokens
       SET revoked_at = NOW()
       WHERE user_id = $1
         AND token_type = $2
         AND consumed_at IS NULL
         AND revoked_at IS NULL`,
      [String(userId), tokenType],
    );
  }

  async createSecurityToken(input: CreateSecurityTokenInput): Promise<void> {
    await this.db.queryGlobal(
      `INSERT INTO user_security_tokens (
         user_id, token_type, token_hash, target_email, requested_ip, expires_at
       )
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        String(input.userId),
        input.tokenType,
        input.tokenHash,
        input.targetEmail ?? null,
        input.requestedIp ?? null,
        input.expiresAt.toISOString(),
      ],
    );
  }

  async consumeSecurityToken(
    tokenHash: string,
    expectedType: SecurityTokenType,
  ): Promise<ConsumedSecurityToken | null> {
    const res = await this.db.queryGlobal<{
      id: string;
      user_id: string;
      token_type: SecurityTokenType;
      target_email: string | null;
    }>(
      `UPDATE user_security_tokens
       SET consumed_at = NOW()
       WHERE token_hash = $1
         AND token_type = $2
         AND consumed_at IS NULL
         AND revoked_at IS NULL
         AND expires_at > NOW()
       RETURNING id, user_id, token_type, target_email`,
      [tokenHash, expectedType],
    );

    if (res.rowCount === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      userId: BigInt(row.user_id),
      tokenType: row.token_type,
      targetEmail: row.target_email,
    };
  }

  private async loadUserMemberships(
    userId: bigint,
  ): Promise<SchoolMembershipItem[]> {
    const res = await this.db.queryGlobal<MembershipRow>(
      `SELECT m.school_id, s.name AS school_name, s.dane_code, m.role, m.is_active
       FROM user_school_memberships m
       INNER JOIN schools s ON s.id = m.school_id
       WHERE m.user_id = $1
         AND m.is_active = TRUE
         AND m.status = 'ACTIVE'
         AND s.is_active = TRUE
       ORDER BY m.is_default_school DESC, m.school_id ASC`,
      [String(userId)],
    );

    return res.rows.map((m) => ({
      schoolId: BigInt(m.school_id),
      schoolName: m.school_name,
      schoolDaneCode: m.dane_code,
      role: m.role,
      isActive: m.is_active,
    }));
  }

  private mapToAggregate(
    row: UserRow,
    memberships: SchoolMembershipItem[],
  ): CommunityUser {
    return CommunityUser.reconstitute(BigInt(row.id), {
      documentTypeId: row.document_type_id,
      documentNumber: row.document_number,
      email: row.email,
      username: row.username,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      middleName: row.middle_name,
      lastName: row.last_name,
      secondLastName: row.second_last_name,
      avatarUrl: row.avatar_url,
      isActive: row.is_active,
      memberships,
    });
  }
}
