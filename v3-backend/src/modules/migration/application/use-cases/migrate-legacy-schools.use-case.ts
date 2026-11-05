import { Injectable } from '@nestjs/common';
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
    daneCode: '1234567890',
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

    const defaultPasswordHash = await this.passwordHasher.hash('Asaie2026*');

    for (const seed of NINE_ACTIVE_LEGACY_SCHOOLS) {
      const schoolRes = await this.db.queryGlobal<{ id: string }>(
        `INSERT INTO schools (
           dane_code, name, short_name, storage_folder, legacy_db_name, is_active
         )
         VALUES ($1, $2, $3, $4, $5, TRUE)
         ON CONFLICT (legacy_db_name)
         DO UPDATE SET
           dane_code = EXCLUDED.dane_code,
           name = EXCLUDED.name,
           short_name = EXCLUDED.short_name,
           updated_at = NOW()
         RETURNING id`,
        [
          seed.daneCode,
          seed.name,
          seed.shortName,
          seed.storageFolder,
          seed.legacyDbName,
        ],
      );

      const newSchoolId = BigInt(schoolRes.rows[0].id);

      await this.db.queryGlobal(
        `INSERT INTO migration_id_mappings (school_id, entity_name, legacy_id, new_id)
         VALUES ($1, 'schools', $2, $1)
         ON CONFLICT (school_id, entity_name, legacy_id)
         DO UPDATE SET new_id = EXCLUDED.new_id`,
        [String(newSchoolId), seed.legacyId],
      );

      // Inicializar estructura base del colegio dentro de su propio contexto RLS
      await this.db.withTenantTransaction(newSchoolId, async (client) => {
        await client.query(
          `INSERT INTO school_shifts (school_id, code, name)
           VALUES
             ($1, 1, 'MAÑANA'),
             ($1, 2, 'TARDE'),
             ($1, 6, 'JORNADA ÚNICA')
           ON CONFLICT (school_id, code) DO NOTHING`,
          [String(newSchoolId)],
        );

        const yearRes = await client.query<{ id: string }>(
          `INSERT INTO academic_years (school_id, year, min_passing_score, min_scale_score, max_scale_score)
           VALUES ($1, $2, 3.00, 1.00, 5.00)
           ON CONFLICT (school_id, year)
           DO UPDATE SET updated_at = NOW()
           RETURNING id`,
          [String(newSchoolId), currentYear],
        );

        const academicYearId = yearRes.rows[0].id;

        await client.query(
          `INSERT INTO academic_periods (
             school_id, academic_year_id, period_number, name, weight_percentage,
             start_date, end_date, grading_open_date, grading_close_date
           )
           VALUES
             ($1, $2, 1, 'PRIMER PERIODO', 25.00, '2026-01-20', '2026-04-05', '2026-01-20', '2026-04-12'),
             ($1, $2, 2, 'SEGUNDO PERIODO', 25.00, '2026-04-06', '2026-06-20', '2026-04-06', '2026-06-28'),
             ($1, $2, 3, 'TERCER PERIODO', 25.00, '2026-07-06', '2026-09-15', '2026-07-06', '2026-09-22'),
             ($1, $2, 4, 'CUARTO PERIODO', 25.00, '2026-09-16', '2026-11-30', '2026-09-16', '2026-12-05')
           ON CONFLICT (school_id, academic_year_id, period_number) DO NOTHING`,
          [String(newSchoolId), academicYearId],
        );

        await client.query(
          `INSERT INTO education_levels (school_id, code, name, display_order)
           VALUES
             ($1, 'PREESCOLAR', 'Educación Preescolar', 1),
             ($1, 'PRIMARIA', 'Educación Básica Primaria', 2),
             ($1, 'SECUNDARIA', 'Educación Básica Secundaria', 3),
             ($1, 'MEDIA', 'Educación Media Académica y Técnica', 4)
           ON CONFLICT (school_id, code) DO NOTHING`,
          [String(newSchoolId)],
        );
      });

      // Vincular usuario maestro de Comunidad Educativa en todos los roles para pruebas y administracion
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
          documentTypeId: 3,
          documentNumber: '1000000001',
          email: 'comunidad@asaie.co',
          username: 'admin.comunidad',
          passwordHash: defaultPasswordHash,
          firstName: 'USUARIO',
          middleName: 'COMUNIDAD',
          lastName: 'EDUCATIVA',
          secondLastName: 'ASAIE',
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
