import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { CommunityRole } from '../../domain/enums/community-role.enum';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';

export interface ProvisionCommunityUserInput {
  readonly schoolId: bigint;
  readonly role: CommunityRole;
  readonly documentTypeId?: number | null;
  readonly documentNumber: string;
  readonly firstName: string;
  readonly middleName?: string | null;
  readonly lastName: string;
  readonly secondLastName?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly genderId?: number | null;
  readonly birthDate?: string | null;
}

/**
 * Servicio de aprovisionamiento automático de cuentas IAM (`users` + `user_school_memberships`).
 * Reemplaza los triggers legacy `docentes_after_insert`, `administrativos_after_insert`
 * y `inscripciones_after_insert` utilizando hash criptográfico `scrypt` (nunca SHA1),
 * con soporte nativo multi-colegio (un mismo docente puede pertenecer a múltiples sedes/colegios).
 */
@Injectable()
export class IamCommunityProvisioningService {
  constructor(private readonly passwordHasher: PasswordHasherPort) {}

  async provisionCommunityUser(
    client: PoolClient,
    input: ProvisionCommunityUserInput,
  ): Promise<bigint> {
    const cleanDoc = input.documentNumber.trim();
    const docTypeId = input.documentTypeId ?? 1;
    const baseUsername = cleanDoc.slice(0, 100);

    // 1. Buscar usuario existente por documento o nombre de usuario
    const existingRes = await client.query<{ id: string }>(
      `SELECT id
         FROM users
        WHERE (document_type_id = $1 AND document_number = $2)
           OR username = $3
        ORDER BY (document_type_id = $1 AND document_number = $2) DESC
        LIMIT 1`,
      [docTypeId, cleanDoc, baseUsername],
    );

    let userId: bigint;
    if (existingRes.rowCount && existingRes.rowCount > 0) {
      userId = BigInt(existingRes.rows[0].id);
    } else {
      const passwordHash = await this.passwordHasher.hash(cleanDoc);
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO users (
           document_type_id, document_number, email, username, password_hash,
           first_name, middle_name, last_name, second_last_name,
           gender_id, birth_date, phone, is_active
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::date, $12, TRUE)
         RETURNING id`,
        [
          docTypeId,
          cleanDoc,
          input.email?.trim() || null,
          baseUsername,
          passwordHash,
          input.firstName.trim().toUpperCase(),
          input.middleName?.trim().toUpperCase() || null,
          input.lastName.trim().toUpperCase(),
          input.secondLastName?.trim().toUpperCase() || null,
          input.genderId ?? null,
          input.birthDate || null,
          input.phone?.trim() || null,
        ],
      );
      userId = BigInt(inserted.rows[0].id);
    }

    // 2. Garantizar membresía activa en el colegio actual para el rol correspondiente
    await client.query(
      `INSERT INTO user_school_memberships (
         school_id, user_id, role, is_default_school, is_active, status
       )
       VALUES ($1, $2, $3, TRUE, TRUE, 'ACTIVE')
       ON CONFLICT (school_id, user_id, role) DO UPDATE SET
         is_active = TRUE,
         status = 'ACTIVE',
         updated_at = NOW()`,
      [input.schoolId.toString(), userId.toString(), input.role],
    );

    return userId;
  }
}
