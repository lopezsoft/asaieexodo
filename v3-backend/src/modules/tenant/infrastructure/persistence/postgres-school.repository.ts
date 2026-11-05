import { Injectable } from '@nestjs/common';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { School } from '../../domain/entities/school.entity';
import {
  CreateSchoolCommandInput,
  SchoolRepositoryPort,
} from '../../domain/ports/school.repository.port';

interface SchoolRow {
  id: string;
  public_uuid: string;
  dane_code: string | null;
  tax_id: string | null;
  name: string;
  short_name: string | null;
  director_name: string | null;
  secretary_name: string | null;
  address: string | null;
  phones: string | null;
  email: string | null;
  storage_folder: string;
  subscription_lock_date: Date;
  is_active: boolean;
  legacy_db_name: string | null;
}

@Injectable()
export class PostgresSchoolRepository implements SchoolRepositoryPort {
  constructor(private readonly db: PostgresRlsService) {}

  async findById(schoolId: bigint): Promise<School | null> {
    const result = await this.db.queryGlobal<SchoolRow>(
      `SELECT id, public_uuid, dane_code, tax_id, name, short_name, director_name,
              secretary_name, address, phones, email, storage_folder,
              subscription_lock_date, is_active, legacy_db_name
       FROM schools
       WHERE id = $1
       LIMIT 1`,
      [String(schoolId)],
    );

    if (result.rowCount === 0) {
      return null;
    }
    return this.mapRowToEntity(result.rows[0]);
  }

  async findAllActive(): Promise<School[]> {
    const result = await this.db.queryGlobal<SchoolRow>(
      `SELECT id, public_uuid, dane_code, tax_id, name, short_name, director_name,
              secretary_name, address, phones, email, storage_folder,
              subscription_lock_date, is_active, legacy_db_name
       FROM schools
       WHERE is_active = TRUE
       ORDER BY id ASC`,
    );

    return result.rows.map((row) => this.mapRowToEntity(row));
  }

  async create(input: CreateSchoolCommandInput): Promise<School> {
    const result = await this.db.queryGlobal<SchoolRow>(
      `INSERT INTO schools (
         dane_code, tax_id, name, short_name, director_name, secretary_name,
         address, phones, email, storage_folder, legacy_db_name
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, public_uuid, dane_code, tax_id, name, short_name, director_name,
                 secretary_name, address, phones, email, storage_folder,
                 subscription_lock_date, is_active, legacy_db_name`,
      [
        input.daneCode ?? null,
        input.taxId ?? null,
        input.name,
        input.shortName ?? null,
        input.directorName ?? null,
        input.secretaryName ?? null,
        input.address ?? null,
        input.phones ?? null,
        input.email ?? null,
        input.storageFolder,
        input.legacyDbName ?? null,
      ],
    );

    return this.mapRowToEntity(result.rows[0]);
  }

  private mapRowToEntity(row: SchoolRow): School {
    return School.reconstitute(BigInt(row.id), {
      publicUuid: row.public_uuid,
      daneCode: row.dane_code,
      taxId: row.tax_id,
      name: row.name,
      shortName: row.short_name,
      directorName: row.director_name,
      secretaryName: row.secretary_name,
      address: row.address,
      phones: row.phones,
      email: row.email,
      storageFolder: row.storage_folder,
      subscriptionLockDate: new Date(row.subscription_lock_date),
      isActive: row.is_active,
      legacyDbName: row.legacy_db_name,
    });
  }
}
