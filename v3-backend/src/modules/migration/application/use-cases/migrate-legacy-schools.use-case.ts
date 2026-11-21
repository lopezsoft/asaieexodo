import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import { CommunityUserRepositoryPort } from '../../../iam/domain/ports/community-user.repository.port';
import { PasswordHasherPort } from '../../../iam/domain/ports/password-hasher.port';

interface LegacySchoolSeed {
  readonly legacyId: number;
  readonly daneCode: string;
  readonly name: string;
  readonly shortName: string;
  readonly legacyDbName: string;
  readonly storageFolder: string;
}

const NINE_ACTIVE_LEGACY_SCHOOLS: readonly LegacySchoolSeed[] = [
  {
    legacyId: 1,
    daneCode: '323580006675',
    name: 'INSTITUCIÓN EDUCATIVA BEATO JUAN XXIII',
    shortName: 'BEATO JUAN XXIII',
    legacyDbName: 'pto_beato',
    storageFolder: 'pto_beato',
  },
  {
    legacyId: 3,
    daneCode: '123580000783',
    name: 'INSTITUCIÓN EDUCATIVA GERMÁN GÓMEZ PELÁEZ',
    shortName: 'IE GERMÁN GÓMEZ PELÁEZ',
    legacyDbName: 'pto_gegopel',
    storageFolder: 'pto_gegopel',
  },
  {
    legacyId: 7,
    daneCode: '223466002479',
    name: 'INSTITUCIÓN EDUCATIVA BELÉN',
    shortName: 'IE BELÉN',
    legacyDbName: 'asaie',
    storageFolder: 'asaie',
  },
  {
    legacyId: 10,
    daneCode: '123570000520',
    name: 'INSTITUCIÓN EDUCATIVA TÉCNICA EN PROMOCIÓN SOCIAL EL ROSARIO',
    shortName: 'IETPS EL ROSARIO (DEMO)',
    legacyDbName: 'asaie_exodo',
    storageFolder: 'asaie_exodo',
  },
  {
    legacyId: 14,
    daneCode: '123570000416',
    name: 'INSTITUCIÓN EDUCATIVA JOSÉ CELESTINO MUTIS',
    shortName: 'IE JOSÉ CELESTINO MUTIS',
    legacyDbName: 'pnvo_jocemu',
    storageFolder: 'pnvo_jocemu',
  },
  {
    legacyId: 15,
    daneCode: '123570000521',
    name: 'INSTITUCIÓN EDUCATIVA TÉCNICA EN PROMOCIÓN SOCIAL EL ROSARIO - PUEBLO NUEVO',
    shortName: 'IETPS EL ROSARIO',
    legacyDbName: 'pnvo_rosario',
    storageFolder: 'pnvo_rosario',
  },
  {
    legacyId: 18,
    daneCode: '123464000016',
    name: 'INSTITUCIÓN EDUCATIVA FRANCISCO JOSÉ DE CALDAS',
    shortName: 'IE FRANCISCO JOSÉ DE CALDAS',
    legacyDbName: 'mom_franjocal',
    storageFolder: 'mom_franjocal',
  },
  {
    legacyId: 19,
    daneCode: '223464000339',
    name: 'INSTITUCIÓN EDUCATIVA SAN PEDRO CLAVER',
    shortName: 'IE SAN PEDRO CLAVER',
    legacyDbName: 'mom_spclaver',
    storageFolder: 'mom_spclaver',
  },
  {
    legacyId: 21,
    daneCode: '123672000011',
    name: 'INSTITUCIÓN EDUCATIVA JULIO C. MIRANDA',
    shortName: 'IE JULIO C. MIRANDA',
    legacyDbName: 'sant_jcmiranda',
    storageFolder: 'sant_jcmiranda',
  },
];

@Injectable()
export class MigrateLegacySchoolsUseCase {
  constructor(
    private readonly db: PostgresRlsService,
    private readonly userRepository: CommunityUserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {}

  async executeBootstrap(): Promise<Record<string, unknown>> {
    const currentYear = new Date().getFullYear();
    const migratedSchools: Array<{
      id: number;
      legacyId: number;
      name: string;
      legacyDbName: string;
    }> = [];

    const bootstrapPassword = this.configService
      .get<string>('BOOTSTRAP_ADMIN_PASSWORD', '')
      .trim();
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (nodeEnv === 'production' && bootstrapPassword.length < 12) {
      throw new Error(
        'BOOTSTRAP_ADMIN_PASSWORD debe definirse con al menos 12 caracteres.',
      );
    }

    const defaultPasswordHash = await this.passwordHasher.hash(
      bootstrapPassword || 'Asaie2026*',
    );

    const lockDate = `${currentYear + 1}-12-31`;

    for (const seed of NINE_ACTIVE_LEGACY_SCHOOLS) {
      const schoolRes = await this.db.queryGlobal<{ id: string }>(
        `INSERT INTO schools (
           dane_code, name, short_name, storage_folder,
           subscription_lock_date, legacy_db_name, is_active
         )
         VALUES ($1, $2, $3, $4, $5::DATE, $6, TRUE)
         ON CONFLICT (legacy_db_name)
         DO UPDATE SET
           dane_code = EXCLUDED.dane_code,
           name = EXCLUDED.name,
           short_name = EXCLUDED.short_name,
           storage_folder = EXCLUDED.storage_folder,
           updated_at = NOW()
         RETURNING id`,
        [
          seed.daneCode,
          seed.name,
          seed.shortName,
          seed.storageFolder,
          lockDate,
          seed.legacyDbName,
        ],
      );

      const newSchoolId = BigInt(schoolRes.rows[0].id);

      // Inicializar estructura base y trazabilidad ETL dentro del contexto RLS del colegio
      await this.db.withTenantTransaction(newSchoolId, async (client) => {
        await client.query(
          `INSERT INTO migration_id_mappings (
             school_id, entity_name, legacy_id, new_id, legacy_source_db
           )
           VALUES ($1, 'schools', $2, $1, $3)
           ON CONFLICT (school_id, entity_name, legacy_id)
           DO UPDATE SET new_id = EXCLUDED.new_id, migrated_at = NOW()`,
          [String(newSchoolId), String(seed.legacyId), seed.legacyDbName],
        );

        await client.query(
          `INSERT INTO school_shifts (school_id, catalog_shift_id, shift_code, name)
           VALUES
             ($1, 1, 1, 'MAÑANA'),
             ($1, 2, 2, 'TARDE'),
             ($1, 6, 6, 'JORNADA ÚNICA')
           ON CONFLICT (school_id, shift_code) DO NOTHING`,
          [String(newSchoolId)],
        );

        await client.query(
          `INSERT INTO academic_years (school_id, year, start_date, end_date, is_closed)
           VALUES ($1, $2, $3::DATE, $4::DATE, FALSE)
           ON CONFLICT (school_id, year)
           DO UPDATE SET updated_at = NOW()`,
          [
            String(newSchoolId),
            currentYear,
            `${currentYear}-01-19`,
            `${currentYear}-11-30`,
          ],
        );

        await client.query(
          `INSERT INTO academic_periods (
             school_id, grade_group_id, academic_year, period_number, name, weight_percentage,
             start_date, end_date, grading_open_date, grading_close_date, is_active
           )
           VALUES
             ($1, NULL, $2, 1, 'PRIMER PERIODO', 25.00, $3::DATE, $4::DATE, $3::DATE, $4::DATE, TRUE),
             ($1, NULL, $2, 2, 'SEGUNDO PERIODO', 25.00, $5::DATE, $6::DATE, $5::DATE, $6::DATE, FALSE),
             ($1, NULL, $2, 3, 'TERCER PERIODO', 25.00, $7::DATE, $8::DATE, $7::DATE, $8::DATE, FALSE),
             ($1, NULL, $2, 4, 'CUARTO PERIODO', 25.00, $9::DATE, $10::DATE, $9::DATE, $10::DATE, FALSE)
           ON CONFLICT (school_id, academic_year, grade_group_id, period_number) DO NOTHING`,
          [
            String(newSchoolId),
            currentYear,
            `${currentYear}-01-19`,
            `${currentYear}-03-27`,
            `${currentYear}-03-30`,
            `${currentYear}-06-12`,
            `${currentYear}-07-06`,
            `${currentYear}-09-11`,
            `${currentYear}-09-14`,
            `${currentYear}-11-27`,
          ],
        );

        await client.query(
          `INSERT INTO education_levels (school_id, level_code, name, display_order)
           VALUES
             ($1, 'PREESCOLAR', 'Educación Preescolar', 1),
             ($1, 'PRIMARIA', 'Educación Básica Primaria', 2),
             ($1, 'SECUNDARIA', 'Educación Básica Secundaria', 3),
             ($1, 'MEDIA', 'Educación Media Académica y Técnica', 4)
           ON CONFLICT (school_id, level_code) DO NOTHING`,
          [String(newSchoolId)],
        );
      });

      // Vincular usuario maestro de Comunidad Educativa con documentTypeId=1 (consistente con seeds)
      const rolesToAssign: CommunityRole[] = [
        CommunityRole.RECTOR,
        CommunityRole.COORDINATOR,
        CommunityRole.SECRETARY,
        CommunityRole.TEACHER,
        CommunityRole.STUDENT,
        CommunityRole.FAMILY,
      ];

      for (const role of rolesToAssign) {
        await this.userRepository.upsertWithMembership({
          documentTypeId: 1,
          documentNumber: '1000000001',
          email: 'comunidad@asaie.co',
          username: 'admin.comunidad',
          passwordHash: defaultPasswordHash,
          firstName: 'ADMINISTRADOR',
          middleName: null,
          lastName: 'COMUNIDAD EDUCATIVA',
          secondLastName: null,
          schoolId: newSchoolId,
          role,
        });
      }

      migratedSchools.push({
        id: Number(newSchoolId),
        legacyId: seed.legacyId,
        name: seed.name,
        legacyDbName: seed.legacyDbName,
      });
    }

    this.logger.log(
      'Inicializacion de los 9 colegios activos en PostgreSQL 17 completada',
      {
        totalMigratedSchools: migratedSchools.length,
      },
    );

    return {
      totalMigratedSchools: migratedSchools.length,
      schools: migratedSchools,
    };
  }
}
