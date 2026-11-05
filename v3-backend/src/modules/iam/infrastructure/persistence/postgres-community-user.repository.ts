import { Injectable } from '@nestjs/common';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  CommunityUser,
  SchoolMembershipItem,
} from '../../domain/entities/community-user.entity';
import { CommunityRole } from '../../domain/enums/community-role.enum';
import {
  CommunityUserRepositoryPort,
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

    await this.db.withTenantTransaction(input.schoolId, async (client) => {
      await client.query(
        `INSERT INTO user_school_memberships (school_id, user_id, role, is_active)
         VALUES ($1, $2, $3::community_role, TRUE)
         ON CONFLICT (school_id, user_id, role)
         DO UPDATE SET is_active = TRUE`,
        [String(input.schoolId), String(userId), input.role],
      );
    });

    const memberships = await this.loadUserMemberships(userId);
    return this.mapToAggregate(userRow, memberships);
  }

  private async loadUserMemberships(
    userId: bigint,
  ): Promise<SchoolMembershipItem[]> {
    const res = await this.db.queryGlobal<MembershipRow>(
      `SELECT m.school_id, s.name AS school_name, s.dane_code, m.role, m.is_active
       FROM user_school_memberships m
       INNER JOIN schools s ON s.id = m.school_id
       WHERE m.user_id = $1 AND m.is_active = TRUE AND s.is_active = TRUE
       ORDER BY m.school_id ASC`,
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
