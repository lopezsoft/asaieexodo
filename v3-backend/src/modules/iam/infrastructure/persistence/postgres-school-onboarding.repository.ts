import { ConflictException, Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { CommunityUser } from '../../domain/entities/community-user.entity';
import { CommunityRole } from '../../domain/enums/community-role.enum';
import {
  PublicCatalogOption,
  PublicRegistrationCatalogs,
  RegisterSchoolTransactionInput,
  RegisterSchoolTransactionResult,
  SchoolOnboardingRepositoryPort,
} from '../../domain/ports/school-onboarding.repository.port';

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

@Injectable()
export class PostgresSchoolOnboardingRepository
  implements SchoolOnboardingRepositoryPort
{
  constructor(private readonly db: PostgresRlsService) {}

  async getPublicRegistrationCatalogs(): Promise<PublicRegistrationCatalogs> {
    const [documentTypesRes, calendarsRes, sectorsRes, institutionTypesRes] =
      await Promise.all([
        this.db.queryGlobal<{ id: number; code: string; name: string }>(
          `SELECT id, code, name
           FROM document_types
           WHERE is_active = TRUE
           ORDER BY id ASC`,
        ),
        this.db.queryGlobal<{ id: number; name: string }>(
          `SELECT id, name
           FROM academic_calendars
           ORDER BY id ASC`,
        ),
        this.db.queryGlobal<{ id: number; name: string }>(
          `SELECT id, name
           FROM school_sectors
           ORDER BY id ASC`,
        ),
        this.db.queryGlobal<{ id: number; name: string }>(
          `SELECT id, name
           FROM institution_types
           ORDER BY id ASC`,
        ),
      ]);

    const mapSimple = (
      rows: Array<{ id: number; name: string; code?: string }>,
    ): PublicCatalogOption[] =>
      rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        ...(row.code ? { code: row.code } : {}),
      }));

    return {
      documentTypes: mapSimple(documentTypesRes.rows),
      academicCalendars: mapSimple(calendarsRes.rows),
      schoolSectors: mapSimple(sectorsRes.rows),
      institutionTypes: mapSimple(institutionTypesRes.rows),
    };
  }

  async registerSchoolWithStarterSetup(
    input: RegisterSchoolTransactionInput,
  ): Promise<RegisterSchoolTransactionResult> {
    return this.db.withGlobalTransaction(async (client) => {
      await this.assertUniqueSchoolAndAdminData(client, input);

      const directorFullName = [
        input.adminFirstName,
        input.adminMiddleName,
        input.adminLastName,
        input.adminSecondLastName,
      ]
        .filter((part): part is string => Boolean(part && part.trim().length > 0))
        .join(' ')
        .slice(0, 150);

      const schoolRes = await client.query<{
        id: string;
        name: string;
        dane_code: string | null;
      }>(
        `INSERT INTO schools (
           country_id, calendar_id, sector_id, institution_type_id,
           dane_code, tax_id, name, short_name,
           director_name, director_document,
           address, phones, email, storage_folder,
           subscription_lock_date, is_active
         )
         VALUES (
           45, $1, $2, $3,
           $4, $5, $6, $7,
           $8, $9,
           $10, $11, $12, $13,
           $14::date, TRUE
         )
         RETURNING id, name, dane_code`,
        [
          input.calendarId,
          input.sectorId,
          input.institutionTypeId,
          input.daneCode,
          input.taxId,
          input.schoolName,
          input.shortName,
          directorFullName,
          input.adminDocumentNumber,
          input.schoolAddress,
          input.schoolPhone,
          input.schoolEmail ?? input.adminEmail,
          input.storageFolder,
          input.subscriptionLockDate,
        ],
      );

      const schoolRow = schoolRes.rows[0];
      const schoolId = BigInt(schoolRow.id);

      const userRes = await client.query<UserRow>(
        `INSERT INTO users (
           document_type_id, document_number, email, username, password_hash,
           first_name, middle_name, last_name, second_last_name, phone,
           is_active, last_login_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, NOW())
         RETURNING id, document_type_id, document_number, email, username, password_hash,
                   first_name, middle_name, last_name, second_last_name, avatar_url, is_active`,
        [
          input.adminDocumentTypeId,
          input.adminDocumentNumber,
          input.adminEmail,
          input.username,
          input.passwordHash,
          input.adminFirstName,
          input.adminMiddleName,
          input.adminLastName,
          input.adminSecondLastName,
          input.adminPhone,
        ],
      );

      const userRow = userRes.rows[0];
      const userId = BigInt(userRow.id);

      await client.query(
        `INSERT INTO user_security_tokens (
           user_id, token_type, token_hash, target_email, requested_ip, expires_at
         )
         VALUES ($1, 'EMAIL_VERIFICATION', $2, $3, $4, $5)`,
        [
          String(userId),
          input.emailVerificationTokenHash,
          input.adminEmail,
          input.ipAddress,
          input.emailVerificationExpiresAt.toISOString(),
        ],
      );

      // Activar contexto RLS estricto para aprovisionamiento del nuevo colegio en la misma transaccion
      await client.query('SET LOCAL ROLE asaie_app_runtime');
      await client.query(`SELECT set_config('app.current_school_id', $1, true)`, [
        String(schoolId),
      ]);

      await client.query(
        `INSERT INTO user_school_memberships (
           school_id, user_id, role, is_default_school, is_active, status
         )
         VALUES ($1, $2, $3, TRUE, TRUE, 'ACTIVE')`,
        [String(schoolId), String(userId), CommunityRole.SCHOOL_ADMIN],
      );

      const campusRes = await client.query<{ id: string }>(
        `INSERT INTO campuses (
           school_id, zone_id, dane_code, consecutive_code, name,
           address, phones, email, is_main_campus, is_active
         )
         VALUES (
           $1,
           (SELECT id FROM geographical_zones WHERE id = 1 LIMIT 1),
           $2, '01', 'Sede Principal',
           $3, $4, $5, TRUE, TRUE
         )
         RETURNING id`,
        [
          String(schoolId),
          input.daneCode,
          input.schoolAddress,
          input.schoolPhone,
          input.schoolEmail ?? input.adminEmail,
        ],
      );

      const mainCampusId = campusRes.rows[0].id;

      await client.query(
        `INSERT INTO academic_years (
           school_id, year, start_date, end_date, is_online_enrollment_open, is_closed
         )
         VALUES ($1, $2, $3::date, $4::date, TRUE, FALSE)`,
        [
          String(schoolId),
          input.academicYear,
          `${input.academicYear}-01-15`,
          `${input.academicYear}-12-15`,
        ],
      );

      const shiftsRes = await client.query<{ id: string }>(
        `INSERT INTO school_shifts (
           school_id, catalog_shift_id, shift_code, name, is_active
         )
         SELECT $1, id, id, name, TRUE
         FROM school_shifts_catalog
         WHERE id IN (1, 2)
         ORDER BY id ASC
         RETURNING id`,
        [String(schoolId)],
      );

      for (const shiftRow of shiftsRes.rows) {
        await client.query(
          `INSERT INTO campus_shifts (school_id, campus_id, shift_id, is_active)
           VALUES ($1, $2, $3, TRUE)
           ON CONFLICT (school_id, campus_id, shift_id) DO NOTHING`,
          [String(schoolId), mainCampusId, shiftRow.id],
        );
      }

      const levelsRes = await client.query<{ id: string }>(
        `INSERT INTO education_levels (
           school_id, catalog_level_id, level_code, name, abbreviation, display_order, is_active
         )
         SELECT $1, id, COALESCE(code, id::text), name, LEFT(name, 20), id, TRUE
         FROM education_levels_catalog
         WHERE id IN (1, 2, 3, 4)
         ORDER BY id ASC
         RETURNING id`,
        [String(schoolId)],
      );

      for (const levelRow of levelsRes.rows) {
        await client.query(
          `INSERT INTO campus_education_levels (
             school_id, campus_id, education_level_id, is_active
           )
           VALUES ($1, $2, $3, TRUE)
           ON CONFLICT (school_id, campus_id, education_level_id) DO NOTHING`,
          [String(schoolId), mainCampusId, levelRow.id],
        );
      }

      const modulesRes = await client.query(
        `INSERT INTO school_modules (school_id, system_module_id, is_active, status)
         SELECT $1, id, TRUE, 1
         FROM system_modules
         WHERE is_active = TRUE
         ON CONFLICT (school_id, system_module_id) DO NOTHING`,
        [String(schoolId)],
      );

      const sessionRes = await client.query<{
        id: string;
        token_jti: string;
        school_id: string;
        user_id: string;
        expires_at: Date;
      }>(
        `INSERT INTO auth_sessions (
           school_id, user_id, ip_address, user_agent, expires_at
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, token_jti, school_id, user_id, expires_at`,
        [
          String(schoolId),
          String(userId),
          input.ipAddress,
          input.userAgent,
          input.sessionExpiresAt.toISOString(),
        ],
      );

      const sessionRow = sessionRes.rows[0];

      const shiftsCount = shiftsRes.rowCount ?? shiftsRes.rows.length;
      const educationLevelsCount = levelsRes.rowCount ?? levelsRes.rows.length;
      const enabledModulesCount = modulesRes.rowCount ?? 0;

      await client.query(
        `INSERT INTO audit_logs (
           school_id, user_id, entity_name, entity_id, action, ip_address, previous_data, new_data
         )
         VALUES ($1, $2, 'schools', $3, 'SELF_REGISTERED', $4, NULL, $5::jsonb)`,
        [
          String(schoolId),
          String(userId),
          String(schoolId),
          input.ipAddress,
          JSON.stringify({
            schoolId: Number(schoolId),
            academicYear: input.academicYear,
            subscriptionLockDate: input.subscriptionLockDate,
            shiftsCount,
            educationLevelsCount,
            enabledModulesCount,
          }),
        ],
      );

      const user = CommunityUser.reconstitute(userId, {
        documentTypeId: userRow.document_type_id,
        documentNumber: userRow.document_number,
        email: userRow.email,
        username: userRow.username,
        passwordHash: userRow.password_hash,
        firstName: userRow.first_name,
        middleName: userRow.middle_name,
        lastName: userRow.last_name,
        secondLastName: userRow.second_last_name,
        avatarUrl: userRow.avatar_url,
        isActive: userRow.is_active,
        memberships: [
          {
            schoolId,
            schoolName: schoolRow.name,
            schoolDaneCode: schoolRow.dane_code,
            role: CommunityRole.SCHOOL_ADMIN,
            isActive: true,
          },
        ],
      });

      return {
        schoolId,
        schoolName: schoolRow.name,
        subscriptionLockDate: input.subscriptionLockDate,
        user,
        session: {
          id: sessionRow.id,
          tokenJti: sessionRow.token_jti,
          schoolId: BigInt(sessionRow.school_id),
          userId: BigInt(sessionRow.user_id),
          expiresAt: new Date(sessionRow.expires_at),
        },
        provisioned: {
          mainCampusCreated: true,
          academicYear: input.academicYear,
          shiftsCount,
          educationLevelsCount,
          enabledModulesCount,
        },
      };
    });
  }

  private async assertUniqueSchoolAndAdminData(
    client: PoolClient,
    input: RegisterSchoolTransactionInput,
  ): Promise<void> {
    const usernameCheck = await client.query(
      `SELECT 1 FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1`,
      [input.username],
    );
    if ((usernameCheck.rowCount ?? 0) > 0) {
      throw new ConflictException(
        'El nombre de usuario ya está registrado. Por favor elige otro.',
      );
    }

    const docCheck = await client.query(
      `SELECT 1
       FROM users
       WHERE document_type_id = $1 AND document_number = $2
       LIMIT 1`,
      [input.adminDocumentTypeId, input.adminDocumentNumber],
    );
    if ((docCheck.rowCount ?? 0) > 0) {
      throw new ConflictException(
        'Ya existe una cuenta registrada con ese tipo y número de documento. Inicia sesión con tus credenciales.',
      );
    }

    const emailCheck = await client.query(
      `SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [input.adminEmail],
    );
    if ((emailCheck.rowCount ?? 0) > 0) {
      throw new ConflictException(
        'Ya existe una cuenta asociada a ese correo electrónico.',
      );
    }

    if (input.daneCode) {
      const daneCheck = await client.query(
        `SELECT 1 FROM schools WHERE dane_code = $1 LIMIT 1`,
        [input.daneCode],
      );
      if ((daneCheck.rowCount ?? 0) > 0) {
        throw new ConflictException(
          'Ya existe una Institución Educativa registrada con ese código DANE.',
        );
      }
    }
  }
}
