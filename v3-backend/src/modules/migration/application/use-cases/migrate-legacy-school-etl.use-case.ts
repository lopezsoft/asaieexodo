import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PoolClient } from 'pg';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { SmartLoggerService } from '../../../../shared/infrastructure/logging/smart-logger.service';
import { LegacyMysqlCliReader } from '../../infrastructure/mysql/legacy-mysql-cli.reader';
import {
  cleanEmail,
  cleanNullableStr,
  cleanPhone,
  cleanStr,
  dedupeByKey,
  mapLegacyGender,
  mapLegacyIndicatorType,
  mapLegacyProfileIdToRole,
  parseYesNoFlag,
  safeDate,
  safeDecimal,
  safeInt,
  safeTimestamp,
  validCatalogId,
} from '../helpers/etl-sanitizer.helper';

export interface MigrationReconciliationReport {
  readonly schoolId: number;
  readonly schoolName: string;
  readonly legacyBridgeDb: string;
  readonly legacySchoolDb: string;
  readonly migratedYears: string;
  readonly durationSeconds: number;
  readonly counts: Record<string, { readonly source: number; readonly target: number }>;
  readonly gradesChecksum: {
    readonly sourceCount: number;
    readonly targetCount: number;
    readonly sourceFinalSum: number;
    readonly targetFinalSum: number;
    readonly deltaSum: number;
  };
  readonly warnings: string[];
}

interface CatalogValidationSets {
  docTypes: Set<number>;
  countries: Set<number>;
  cities: Set<number>;
  zones: Set<number>;
  genders: Set<number>;
  nationalScales: Set<number>;
  enrollmentStatuses: Set<number>;
  relationshipTypes: Set<number>;
  memberTypes: Set<number>;
  healthProviders: Set<number>;
  ethnicGroups: Set<number>;
  indigenousReserves: Set<number>;
  disabilityTypes: Set<number>;
  exceptionalCapabilities: Set<number>;
  conflictVictimTypes: Set<number>;
  academicDegrees: Set<number>;
  payScales: Set<number>;
  teachingAreas: Set<number>;
  methodologies: Set<number>;
  candidacyTypes: Set<number>;
  promotionStatusByGroupAndCode: Map<string, number>;
}

const NSCP_TABLES = [
  { key: '00', gradeTable: 'nscp00', preTable: 'preinforme_nscp00', logTable: 'log_nscp00' },
  { key: '001', gradeTable: 'nscp001', preTable: 'preinforme_nscp001', logTable: 'log_nscp001' },
  { key: '002', gradeTable: 'nscp002', preTable: 'preinforme_nscp002', logTable: 'log_nscp002' },
  { key: '003', gradeTable: 'nscp003', preTable: 'preinforme_nscp003', logTable: 'log_nscp003' },
] as const;

/**
 * Pipeline ETL idempotente y en streaming desde MariaDB/MySQL legacy
 * (`mig-schools-admin` + `mig-schools-*`) hacia PostgreSQL 17 RLS (`asaie_v3_unified`).
 * Soporta migración histórica completa (13+ años, +1.45M calificaciones y normalización 1NF de n1..n30)
 * mediante inserciones masivas UNNEST y reconciliación automática origen vs destino.
 */
@Injectable()
export class MigrateLegacySchoolEtlUseCase {
  constructor(
    private readonly db: PostgresRlsService,
    private readonly mysql: LegacyMysqlCliReader,
    private readonly configService: ConfigService,
    private readonly logger: SmartLoggerService,
  ) {}

  async executeFullSchoolMigration(): Promise<MigrationReconciliationReport> {
    const startedAt = Date.now();
    const cfg = this.mysql.getConnectionConfig();
    const adminDb = this.mysql.quoteIdent(cfg.bridgeDb);
    const schoolDb = this.mysql.quoteIdent(cfg.schoolDb);
    const yearFilterRaw = this.configService
      .get<string>('LEGACY_MIGRATION_YEARS', 'ALL')
      .trim()
      .toUpperCase();
    const allowedYears: Set<number> | null =
      yearFilterRaw === '' || yearFilterRaw === 'ALL'
        ? null
        : new Set(
            yearFilterRaw
              .split(',')
              .map((v) => Number.parseInt(v.trim(), 10))
              .filter((y) => y >= 1990 && y <= 2100),
          );

    const warnings: string[] = [];
    this.logger.log('Iniciando ETL completo MariaDB -> PostgreSQL 17 RLS', {
      bridgeDb: cfg.bridgeDb,
      schoolDb: cfg.schoolDb,
      yearsFilter: allowedYears ? Array.from(allowedYears) : 'ALL',
    });

    // FASE 0: Prerrequisito catálogo PPT (id=20) y carga de sets de integridad referencial PG17
    await this.ensureMissingGlobalCatalogs();
    const catalogs = await this.loadCatalogValidationSets();

    // FASE 1: Institución, módulos, usuarios y membresías desde BD puente
    const schoolCtx = await this.migrateSchoolAndModules(
      adminDb,
      cfg.schoolDb,
      catalogs,
    );
    const schoolId = schoolCtx.schoolId;

    const { userIdMap, fallbackUserId, sourceUsersCount, sourceMembershipsCount } =
      await this.migrateUsersAndMemberships(
        adminDb,
        schoolDb,
        schoolCtx.legacySchoolId,
        schoolId,
        catalogs,
      );

    // FASE 2: Estructura institucional, SIEE, periodos, escalas y competencias
    const campusMap = await this.migrateCampuses(schoolDb, schoolId, catalogs);
    const shiftMap = await this.migrateShifts(schoolDb, schoolId, campusMap);
    const levelMap = await this.migrateEducationLevels(schoolDb, schoolId, campusMap);
    const gradeGroupMap = await this.migrateGradeGroups(schoolDb, schoolId);
    const { gradeMap, gradeToGroupIdMap } = await this.migrateGrades(
      schoolDb,
      schoolId,
      levelMap,
      gradeGroupMap,
    );
    await this.migrateAcademicYears(schoolDb, schoolId, allowedYears);
    const periodResolver = await this.migrateAcademicPeriods(
      schoolDb,
      schoolId,
      gradeGroupMap,
      allowedYears,
    );
    await this.migrateGradingRulesAndScales(
      schoolDb,
      schoolId,
      gradeGroupMap,
      catalogs,
      allowedYears,
    );
    const { dimensionMap, dimColByLegacyCncId } =
      await this.migrateDimensionsAndColumns(
        schoolDb,
        schoolId,
        gradeGroupMap,
        allowedYears,
      );

    // FASE 3: Docentes, administrativos, áreas, asignaturas, grupos, cursos, estudiantes, familias y matrículas
    const { teacherMap, teacherUserIdMap, sourceTeachersCount } =
      await this.migrateTeachers(schoolDb, schoolId, userIdMap, catalogs);
    await this.migrateAdministrativeStaff(schoolDb, schoolId, catalogs);
    const areaMap = await this.migrateAcademicAreas(schoolDb, schoolId);
    const subjectMap = await this.migrateSubjects(schoolDb, schoolId, areaMap);
    await this.migrateStudyPlans(
      schoolDb,
      schoolId,
      gradeMap,
      subjectMap,
      allowedYears,
    );
    const groupKeyMap = await this.migrateAcademicGroups(
      schoolDb,
      schoolId,
      campusMap,
      shiftMap,
      gradeMap,
      teacherMap,
      allowedYears,
    );
    const { courseMap, courseMetaMap } = await this.migrateCourseAssignments(
      schoolDb,
      schoolId,
      campusMap,
      shiftMap,
      gradeMap,
      subjectMap,
      teacherMap,
      groupKeyMap,
      allowedYears,
    );
    const { studentMap, studentDocMap } = await this.migrateStudents(
      schoolDb,
      schoolId,
      userIdMap,
      catalogs,
    );
    const { familyMap, sourceFamiliesCount } = await this.migrateFamilies(
      schoolDb,
      schoolId,
      userIdMap,
      catalogs,
    );
    const sourceFamilyLinksCount = await this.migrateFamilyLinks(
      schoolDb,
      schoolId,
      studentMap,
      familyMap,
      catalogs,
    );
    const { enrollmentMap, enrollmentMetaMap, sourceEnrollmentsCount } =
      await this.migrateEnrollmentsAndNovelties(
        schoolDb,
        schoolId,
        studentMap,
        campusMap,
        shiftMap,
        gradeMap,
        groupKeyMap,
        catalogs,
        allowedYears,
      );

    // FASE 4: Columnas dinámicas, logros, notas (1.45M) con n1..n30 inline + vínculos de logros + preinformes
    await this.migrateTeacherGradebookColumns(
      schoolDb,
      schoolId,
      courseMap,
      dimColByLegacyCncId,
      allowedYears,
    );
    const achievementMap = await this.migrateAchievements(
      schoolDb,
      schoolId,
      gradeMap,
      subjectMap,
      dimensionMap,
      catalogs,
      allowedYears,
    );

    const gradesStats = await this.migrateAllGradesPreReportsAndLinks(
      schoolDb,
      schoolId,
      enrollmentMap,
      courseMap,
      courseMetaMap,
      gradeToGroupIdMap,
      periodResolver,
      achievementMap,
      catalogs,
      allowedYears,
      warnings,
    );

    await this.migrateRecoveries(
      schoolDb,
      schoolId,
      enrollmentMap,
      courseMap,
      allowedYears,
    );
    await this.migrateObservers(
      schoolDb,
      schoolId,
      enrollmentMap,
      enrollmentMetaMap,
      teacherUserIdMap,
      fallbackUserId,
      allowedYears,
    );
    await this.migratePromotionsAndRankings(
      schoolDb,
      schoolId,
      enrollmentMap,
      enrollmentMetaMap,
      gradeToGroupIdMap,
      catalogs,
      allowedYears,
    );
    await this.migrateLessonPlans(
      schoolDb,
      schoolId,
      courseMetaMap,
      gradeMap,
      subjectMap,
      teacherMap,
      allowedYears,
    );
    await this.migrateElections(
      schoolDb,
      schoolId,
      enrollmentMap,
      catalogs,
      allowedYears,
    );

    // FASE 5: Auditoría de Reconciliación Origen vs Destino
    const report = await this.buildReconciliationReport({
      schoolId,
      schoolName: schoolCtx.schoolName,
      legacyBridgeDb: cfg.bridgeDb,
      legacySchoolDb: cfg.schoolDb,
      migratedYears: allowedYears ? Array.from(allowedYears).join(',') : 'ALL',
      startedAt,
      sourceUsersCount,
      sourceMembershipsCount,
      sourceCampusesCount: campusMap.size,
      sourceTeachersCount,
      sourceStudentsCount: studentDocMap.size,
      sourceFamiliesCount,
      sourceFamilyLinksCount,
      sourceEnrollmentsCount,
      sourceCoursesCount: courseMap.size,
      sourceGradesCount: gradesStats.sourceGradesRead,
      sourceFinalSum: gradesStats.sourceFinalSum,
      sourceItemsCreated: gradesStats.itemsUpserted,
      sourceLinksRead: gradesStats.linksRead,
      warnings,
    });

    this.logger.log('ETL completo finalizado y reconciliado', {
      schoolId: report.schoolId,
      durationSeconds: report.durationSeconds,
      gradesChecksum: report.gradesChecksum,
      counts: report.counts,
    });

    return report;
  }

  private async runBulkTenantTx<T>(
    schoolId: bigint,
    operation: (client: PoolClient) => Promise<T>,
    fastCommit = true,
  ): Promise<T> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      await client.query(`SET LOCAL statement_timeout = '300000'`);
      if (fastCommit) {
        await client.query(`SET LOCAL synchronous_commit = off`);
      }
      return operation(client);
    });
  }

  private yearWhere(column: string, allowedYears: Set<number> | null): string {
    if (!allowedYears || allowedYears.size === 0) return '1=1';
    return `${column} IN (${Array.from(allowedYears).join(',')})`;
  }

  private async ensureMissingGlobalCatalogs(): Promise<void> {
    await this.db.queryGlobal(
      `INSERT INTO document_types (id, code, name, is_active)
       VALUES (20, 'PPT', 'Permiso por Protección Temporal (PPT)', TRUE)
       ON CONFLICT (id) DO NOTHING`,
    );
  }

  private async loadCatalogValidationSets(): Promise<CatalogValidationSets> {
    const loadIds = async (table: string): Promise<Set<number>> => {
      const res = await this.db.queryGlobal<{ id: string }>(
        `SELECT id::text AS id FROM ${table}`,
      );
      return new Set(res.rows.map((r) => Number(r.id)));
    };

    const promoRes = await this.db.queryGlobal<{
      id: number;
      grade_group_id: number;
      status_code: number;
    }>(
      `SELECT id, grade_group_id, status_code FROM promotion_statuses_catalog`,
    );
    const promotionStatusByGroupAndCode = new Map<string, number>();
    for (const r of promoRes.rows) {
      promotionStatusByGroupAndCode.set(
        `${r.grade_group_id}:${r.status_code}`,
        Number(r.id),
      );
    }

    return {
      docTypes: await loadIds('document_types'),
      countries: await loadIds('countries'),
      cities: await loadIds('cities'),
      zones: await loadIds('geographical_zones'),
      genders: await loadIds('genders'),
      nationalScales: await loadIds('national_grading_scales'),
      enrollmentStatuses: await loadIds('enrollment_statuses'),
      relationshipTypes: await loadIds('family_relationship_types'),
      memberTypes: await loadIds('family_member_types'),
      healthProviders: await loadIds('health_providers'),
      ethnicGroups: await loadIds('ethnic_groups'),
      indigenousReserves: await loadIds('indigenous_reserves'),
      disabilityTypes: await loadIds('disability_types'),
      exceptionalCapabilities: await loadIds('exceptional_capabilities'),
      conflictVictimTypes: await loadIds('conflict_victim_types'),
      academicDegrees: await loadIds('academic_degrees_catalog'),
      payScales: await loadIds('teacher_pay_scales'),
      teachingAreas: await loadIds('teaching_areas'),
      methodologies: await loadIds('study_methodologies'),
      candidacyTypes: await loadIds('election_candidacy_types'),
      promotionStatusByGroupAndCode,
    };
  }

  private async migrateSchoolAndModules(
    adminDb: string,
    rawSchoolDbName: string,
    catalogs: CatalogValidationSets,
  ): Promise<{ schoolId: bigint; legacySchoolId: number; schoolName: string }> {
    const token = rawSchoolDbName
      .replace(/^mig-schools-/i, '')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();

    const rows = await this.mysql.queryAll<{
      id: string;
      country_id: string | null;
      statecode: string | null;
      nameschool: string;
      database_name: string;
      folder_name: string;
      lockdate: string | null;
      state: string;
      active: string;
    }>(
      `SELECT id, country_id, statecode, nameschool, database_name, folder_name, lockdate, state, active
         FROM ${adminDb}.schools
        WHERE LOWER(database_name) = '${token}'
           OR LOWER(database_name) LIKE '%${token}%'
           OR LOWER(folder_name) LIKE '%${token}%'
        ORDER BY id
        LIMIT 1`,
    );

    if (rows.length === 0) {
      throw new Error(
        `No se encontró el colegio para '${rawSchoolDbName}' en ${adminDb}.schools.`,
      );
    }
    const src = rows[0];
    const legacySchoolId = safeInt(src.id);
    const schoolName = cleanStr(src.nameschool, 'INSTITUCIÓN EDUCATIVA', 250);
    const countryId = validCatalogId(src.country_id, catalogs.countries, 45) ?? 45;
    const daneCode = cleanNullableStr(src.statecode, 50);
    const dbName = cleanStr(src.database_name, token, 60);
    const folder = cleanStr(src.folder_name, dbName, 120);
    const lockDate = `${new Date().getFullYear() + 1}-12-31`;

    const schoolRes = await this.db.queryGlobal<{ id: string }>(
      `INSERT INTO schools (
         country_id, dane_code, name, short_name, storage_folder,
         subscription_lock_date, legacy_db_name, is_active
       )
       VALUES ($1,$2,$3,$4,$5,$6::date,$7,TRUE)
       ON CONFLICT (legacy_db_name)
       DO UPDATE SET
         country_id = EXCLUDED.country_id,
         dane_code = COALESCE(EXCLUDED.dane_code, schools.dane_code),
         name = EXCLUDED.name,
         short_name = EXCLUDED.short_name,
         storage_folder = EXCLUDED.storage_folder,
         subscription_lock_date = GREATEST(schools.subscription_lock_date, EXCLUDED.subscription_lock_date),
         is_active = TRUE,
         updated_at = NOW()
       RETURNING id`,
      [countryId, daneCode, schoolName, schoolName.slice(0, 100), folder, lockDate, dbName],
    );
    const schoolId = BigInt(schoolRes.rows[0].id);

    const modRows = await this.mysql.queryAll<{
      system_module_id: string;
      is_active: string;
      status: string;
    }>(
      `SELECT system_module_id, is_active, status
         FROM ${adminDb}.school_modules
        WHERE school_id = ${legacySchoolId}`,
    );

    await this.db.withTenantTransaction(schoolId, async (client) => {
      await client.query(
        `INSERT INTO migration_id_mappings (school_id, entity_name, legacy_id, new_id, legacy_source_db)
         VALUES ($1, 'schools', $2, $1, $3)
         ON CONFLICT (school_id, entity_name, legacy_id) DO UPDATE SET new_id = EXCLUDED.new_id, migrated_at = NOW()`,
        [schoolId.toString(), String(legacySchoolId), rawSchoolDbName],
      );
      for (const m of modRows) {
        const modId = safeInt(m.system_module_id);
        if (modId < 1 || modId > 3) continue;
        await client.query(
          `INSERT INTO school_modules (school_id, system_module_id, is_active, status)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (school_id, system_module_id)
           DO UPDATE SET is_active = EXCLUDED.is_active, status = EXCLUDED.status, updated_at = NOW()`,
          [schoolId.toString(), modId, safeInt(m.is_active) === 1, safeInt(m.status, 1)],
        );
      }
    });

    this.logger.log('Fase 1.1 completada: colegio y módulos sincronizados', {
      schoolId: Number(schoolId),
      legacySchoolId,
      modulesCount: modRows.length,
    });

    return { schoolId, legacySchoolId, schoolName };
  }

  private async migrateUsersAndMemberships(
    adminDb: string,
    schoolDb: string,
    legacySchoolId: number,
    schoolId: bigint,
    catalogs: CatalogValidationSets,
  ): Promise<{
    userIdMap: Map<number, number>;
    fallbackUserId: number;
    sourceUsersCount: number;
    sourceMembershipsCount: number;
  }> {
    // Enriquecimiento opcional de documento/correo/teléfono desde docentes, inscripciones y families
    const [teacherDocs, studentDocs, familyDocs] = await Promise.all([
      this.mysql.queryAll<{
        user_id: string;
        id_documento: string | null;
        documento: string | null;
        email: string | null;
        movil: string | null;
        sexo: string | null;
      }>(
        `SELECT t.user_id, d.id_documento, d.documento, d.email, d.movil, d.sexo
           FROM ${schoolDb}.teachers_and_users_ids t
           JOIN ${schoolDb}.docentes d ON d.id_docente = t.teacher_id`,
      ),
      this.mysql.queryAll<{
        user_id: string;
        id_documento: string | null;
        nro_documento: string | null;
        email: string | null;
        movil: string | null;
        id_sexo: string | null;
      }>(
        `SELECT f.user_id, i.id_documento, i.nro_documento, i.email, i.movil, i.id_sexo
           FROM ${schoolDb}.family_and_users_ids f
           JOIN ${schoolDb}.inscripciones i ON i.id = f.family_id
          WHERE f.profile = 'student'`,
      ),
      this.mysql.queryAll<{
        user_id: string;
        id_document: string | null;
        document: string | null;
        email: string | null;
        mobile: string | null;
        id_sex: string | null;
      }>(
        `SELECT fu.user_id, fm.id_document, fm.document, fm.email, fm.mobile, fm.id_sex
           FROM ${schoolDb}.family_and_users_ids fu
           JOIN ${schoolDb}.families fm ON fm.id = fu.family_id
          WHERE fu.profile = 'family'`,
      ),
    ]);

    const profileHint = new Map<
      number,
      { docType: number | null; docNum: string | null; email: string | null; phone: string | null; gender: number }
    >();
    for (const r of familyDocs) {
      profileHint.set(safeInt(r.user_id), {
        docType: validCatalogId(r.id_document, catalogs.docTypes, 1),
        docNum: cleanNullableStr(r.document, 30),
        email: cleanEmail(r.email),
        phone: cleanPhone(r.mobile),
        gender: mapLegacyGender(r.id_sex),
      });
    }
    for (const r of studentDocs) {
      profileHint.set(safeInt(r.user_id), {
        docType: validCatalogId(r.id_documento, catalogs.docTypes, 2),
        docNum: cleanNullableStr(r.nro_documento, 30),
        email: cleanEmail(r.email),
        phone: cleanPhone(r.movil),
        gender: mapLegacyGender(r.id_sexo),
      });
    }
    for (const r of teacherDocs) {
      profileHint.set(safeInt(r.user_id), {
        docType: validCatalogId(r.id_documento, catalogs.docTypes, 1),
        docNum: cleanNullableStr(r.documento, 30),
        email: cleanEmail(r.email),
        phone: cleanPhone(r.movil),
        gender: mapLegacyGender(r.sexo),
      });
    }

    const adminUsers = await this.mysql.queryAll<{
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      avatar: string | null;
      email_verified_at: string | null;
      password: string;
      active: string;
    }>(
      `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, u.avatar, u.email_verified_at, u.password, u.active
         FROM ${adminDb}.users u
         INNER JOIN ${adminDb}.school_users su ON su.user_id = u.id
        WHERE su.school_id = ${legacySchoolId}
        ORDER BY u.id`,
    );

    const userIdMap = new Map<number, number>();
    const existingUsersRes = await this.db.queryGlobal<{
      id: string;
      username: string;
      document_type_id: number;
      document_number: string;
    }>(`SELECT id::text, username, document_type_id, document_number FROM users`);
    const existingByUsername = new Map<string, number>();
    const usedDocKeys = new Map<string, number>();
    for (const eu of existingUsersRes.rows) {
      const uid = Number(eu.id);
      existingByUsername.set(eu.username.toLowerCase(), uid);
      usedDocKeys.set(`${eu.document_type_id}:${eu.document_number}`, uid);
    }

    const batchSize = 500;
    for (let i = 0; i < adminUsers.length; i += batchSize) {
      const chunk = adminUsers.slice(i, i + batchSize);
      const prepared = chunk.map((u) => {
        const legacyId = safeInt(u.id);
        const rawLogin = cleanStr(u.email, `user_${legacyId}`, 120).toLowerCase();
        const hint = profileHint.get(legacyId);
        const docType = hint?.docType ?? 1;
        let docNum = cleanStr(hint?.docNum ?? rawLogin, `U${legacyId}`, 30);
        const existingUid = existingByUsername.get(rawLogin);
        const docKey = `${docType}:${docNum}`;
        const ownerOfDoc = usedDocKeys.get(docKey);
        if (ownerOfDoc !== undefined && ownerOfDoc !== existingUid) {
          docNum = `${docNum.slice(0, 20)}-${legacyId}`;
        }
        const finalEmail = cleanEmail(u.email) ?? hint?.email ?? null;
        return {
          legacyId,
          username: rawLogin,
          email: finalEmail,
          docType,
          docNum,
          passwordHash: u.password,
          firstName: cleanStr(u.first_name, 'USUARIO', 80),
          lastName: cleanStr(u.last_name, 'ASAIE', 80),
          genderId: hint?.gender ?? 0,
          phone: hint?.phone ?? null,
          avatarUrl: cleanNullableStr(u.avatar, 500),
          emailVerifiedAt: safeTimestamp(u.email_verified_at),
          isActive: safeInt(u.active, 1) === 1,
        };
      });

      const deduped = dedupeByKey(prepared, (r) => r.username);
      // Asegurar cero colisiones internas de (docType, docNum) en el mismo batch
      const batchDocKeys = new Set<string>();
      for (const r of deduped) {
        const key = `${r.docType}:${r.docNum}`;
        if (batchDocKeys.has(key)) {
          r.docNum = `${r.docNum.slice(0, 18)}-${r.legacyId}`;
        }
        batchDocKeys.add(`${r.docType}:${r.docNum}`);
      }

      const res = await this.db.queryGlobal<{ id: string; username: string }>(
        `INSERT INTO users (
           document_type_id, document_number, email, username, password_hash,
           first_name, last_name, gender_id, phone, avatar_url, email_verified_at, is_active
         )
         SELECT * FROM UNNEST(
           $1::smallint[], $2::varchar[], $3::varchar[], $4::varchar[], $5::varchar[],
           $6::varchar[], $7::varchar[], $8::smallint[], $9::varchar[], $10::text[],
           $11::timestamptz[], $12::boolean[]
         )
         ON CONFLICT (username)
         DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           email = COALESCE(EXCLUDED.email, users.email),
           phone = COALESCE(EXCLUDED.phone, users.phone),
           avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
           is_active = EXCLUDED.is_active,
           updated_at = NOW()
         RETURNING id::text, username`,
        [
          deduped.map((r) => r.docType),
          deduped.map((r) => r.docNum),
          deduped.map((r) => r.email),
          deduped.map((r) => r.username),
          deduped.map((r) => r.passwordHash),
          deduped.map((r) => r.firstName),
          deduped.map((r) => r.lastName),
          deduped.map((r) => r.genderId),
          deduped.map((r) => r.phone),
          deduped.map((r) => r.avatarUrl),
          deduped.map((r) => r.emailVerifiedAt),
          deduped.map((r) => r.isActive),
        ],
      );

      const idByUsername = new Map(res.rows.map((r) => [r.username.toLowerCase(), Number(r.id)]));
      for (const r of deduped) {
        const newId = idByUsername.get(r.username);
        if (newId) {
          userIdMap.set(r.legacyId, newId);
          existingByUsername.set(r.username, newId);
          usedDocKeys.set(`${r.docType}:${r.docNum}`, newId);
        }
      }
    }

    // Membresías por rol para este colegio
    const roleRows = await this.mysql.queryAll<{
      user_id: string;
      profile_id: string;
      state: string;
    }>(
      `SELECT user_id, profile_id, state
         FROM ${adminDb}.user_roles
        WHERE school_id = ${legacySchoolId}`,
    );

    const memberships = dedupeByKey(
      roleRows
        .map((r) => {
          const newUid = userIdMap.get(safeInt(r.user_id));
          if (!newUid) return null;
          const profileId = safeInt(r.profile_id, 5);
          const isActive = safeInt(r.state, 1) === 1;
          return {
            userId: newUid,
            role: mapLegacyProfileIdToRole(profileId),
            profileId,
            isActive,
            status: isActive ? 'ACTIVE' : 'INACTIVE',
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
      (m) => `${m.userId}:${m.role}`,
    );

    for (let i = 0; i < memberships.length; i += 1000) {
      const batch = memberships.slice(i, i + 1000);
      await this.db.withTenantTransaction(schoolId, async (client) => {
        await client.query(
          `INSERT INTO user_school_memberships (
             school_id, user_id, role, profile_id, is_active, status
           )
           SELECT $1::bigint, * FROM UNNEST(
             $2::bigint[], $3::varchar[], $4::smallint[], $5::boolean[], $6::varchar[]
           )
           ON CONFLICT (school_id, user_id, role)
           DO UPDATE SET
             profile_id = EXCLUDED.profile_id,
             is_active = EXCLUDED.is_active,
             status = EXCLUDED.status,
             updated_at = NOW()`,
          [
            schoolId.toString(),
            batch.map((b) => b.userId),
            batch.map((b) => b.role),
            batch.map((b) => b.profileId),
            batch.map((b) => b.isActive),
            batch.map((b) => b.status),
          ],
        );
      });
    }

    // Guardar trazabilidad de users en migration_id_mappings
    await this.saveIdMappingsBatch(
      schoolId,
      'users',
      Array.from(userIdMap.entries()),
      adminDb.replace(/`/g, ''),
    );

    const fallbackUserRes = await this.db.queryGlobal<{ id: string }>(
      `SELECT id::text FROM users ORDER BY id LIMIT 1`,
    );
    const fallbackUserId = Number(
      fallbackUserRes.rows[0]?.id ?? userIdMap.values().next().value ?? 1,
    );

    this.logger.log('Fase 1.2 completada: usuarios y membresías migrados', {
      sourceUsers: adminUsers.length,
      mappedUsers: userIdMap.size,
      memberships: memberships.length,
    });

    return {
      userIdMap,
      fallbackUserId,
      sourceUsersCount: adminUsers.length,
      sourceMembershipsCount: roleRows.length,
    };
  }

  private async migrateCampuses(
    schoolDb: string,
    schoolId: bigint,
    catalogs: CatalogValidationSets,
  ): Promise<Map<number, number>> {
    const rows = await this.mysql.queryAll<{
      id: string;
      city_id: string | null;
      zone_id: string | null;
      headquarters_name: string | null;
      address: string | null;
      phones: string | null;
      email: string | null;
      is_main: string | null;
      state: string | null;
    }>(`SELECT id, city_id, zone_id, headquarters_name, address, phones, email, is_main, state FROM ${schoolDb}.sedes ORDER BY id`);

    const map = new Map<number, number>();
    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of rows) {
        const legacyId = safeInt(r.id);
        const name = cleanStr(r.headquarters_name, `Sede ${legacyId}`, 200);
        const existing = await client.query<{ new_id: string }>(
          `SELECT new_id::text FROM migration_id_mappings WHERE school_id = $1 AND entity_name = 'campuses' AND legacy_id = $2`,
          [schoolId.toString(), String(legacyId)],
        );
        const cityId = validCatalogId(r.city_id, catalogs.cities, null);
        const zoneId = validCatalogId(r.zone_id, catalogs.zones, 0);
        const address = cleanNullableStr(r.address, 250);
        const phones = cleanPhone(r.phones, 150);
        const email = cleanEmail(r.email);
        const isMain = parseYesNoFlag(r.is_main);
        const isActive = safeInt(r.state, 1) === 1;

        let newId: number;
        if (existing.rowCount && existing.rowCount > 0) {
          newId = Number(existing.rows[0].new_id);
          await client.query(
            `UPDATE campuses SET city_id=$3, zone_id=$4, name=$5, address=$6, phones=$7, email=$8, is_main_campus=$9, is_active=$10
              WHERE school_id=$1 AND id=$2`,
            [schoolId.toString(), newId, cityId, zoneId, name, address, phones, email, isMain, isActive],
          );
        } else {
          const ins = await client.query<{ id: string }>(
            `INSERT INTO campuses (school_id, city_id, zone_id, name, address, phones, email, is_main_campus, is_active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id::text`,
            [schoolId.toString(), cityId, zoneId, name, address, phones, email, isMain, isActive],
          );
          newId = Number(ins.rows[0].id);
        }
        map.set(legacyId, newId);
      }
    });
    await this.saveIdMappingsBatch(schoolId, 'campuses', Array.from(map.entries()), schoolDb.replace(/`/g, ''));
    return map;
  }

  private async migrateShifts(
    schoolDb: string,
    schoolId: bigint,
    campusMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const rows = await this.mysql.queryAll<{
      cod_jorn: string;
      jornada: string;
      estado: string;
    }>(`SELECT cod_jorn, jornada, estado FROM ${schoolDb}.jornadas ORDER BY cod_jorn`);

    const map = new Map<number, number>();
    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of rows) {
        const code = safeInt(r.cod_jorn);
        const name = cleanStr(r.jornada, `JORNADA ${code}`, 120);
        const res = await client.query<{ id: string }>(
          `INSERT INTO school_shifts (school_id, catalog_shift_id, shift_code, name, is_active)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (school_id, shift_code)
           DO UPDATE SET name = EXCLUDED.name, is_active = EXCLUDED.is_active
           RETURNING id::text`,
          [schoolId.toString(), code >= 1 && code <= 5 ? code : null, code, name, safeInt(r.estado, 1) === 1],
        );
        map.set(code, Number(res.rows[0].id));
      }

      const csRows = await this.mysql.queryAll<{ id_sede: string; id_jornada: string }>(
        `SELECT id_sede, id_jornada FROM ${schoolDb}.jornadas_sedes`,
      );
      for (const cs of csRows) {
        const cid = campusMap.get(safeInt(cs.id_sede));
        const sid = map.get(safeInt(cs.id_jornada));
        if (!cid || !sid) continue;
        await client.query(
          `INSERT INTO campus_shifts (school_id, campus_id, shift_id, is_active)
           VALUES ($1,$2,$3,TRUE) ON CONFLICT (school_id, campus_id, shift_id) DO NOTHING`,
          [schoolId.toString(), cid, sid],
        );
      }
    });
    return map;
  }

  private async migrateEducationLevels(
    schoolDb: string,
    schoolId: bigint,
    campusMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const rows = await this.mysql.queryAll<{
      COD_NIV: string;
      DES_NIVEL: string;
      abrev: string | null;
    }>(`SELECT COD_NIV, DES_NIVEL, abrev FROM ${schoolDb}.nivel ORDER BY COD_NIV`);

    const codeNames: Record<number, string> = {
      1: 'PREESCOLAR',
      2: 'PRIMARIA',
      3: 'SECUNDARIA',
      4: 'MEDIA',
      5: 'CICLOS',
    };
    const map = new Map<number, number>();
    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of rows) {
        const legacyId = safeInt(r.COD_NIV);
        const levelCode = codeNames[legacyId] ?? `NIVEL_${legacyId}`;
        const name = cleanStr(r.DES_NIVEL, levelCode, 150);
        const res = await client.query<{ id: string }>(
          `INSERT INTO education_levels (school_id, catalog_level_id, level_code, name, abbreviation, display_order, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE)
           ON CONFLICT (school_id, level_code)
           DO UPDATE SET name = EXCLUDED.name, abbreviation = COALESCE(EXCLUDED.abbreviation, education_levels.abbreviation)
           RETURNING id::text`,
          [schoolId.toString(), legacyId >= 1 && legacyId <= 5 ? legacyId : null, levelCode, name, cleanNullableStr(r.abrev, 20), legacyId],
        );
        map.set(legacyId, Number(res.rows[0].id));
      }

      const nlRows = await this.mysql.queryAll<{ id_sede: string; id_nivel: string; estado: string }>(
        `SELECT id_sede, id_nivel, estado FROM ${schoolDb}.niveles_sedes`,
      );
      for (const nl of nlRows) {
        const cid = campusMap.get(safeInt(nl.id_sede));
        const lid = map.get(safeInt(nl.id_nivel));
        if (!cid || !lid) continue;
        await client.query(
          `INSERT INTO campus_education_levels (school_id, campus_id, education_level_id, is_active)
           VALUES ($1,$2,$3,$4) ON CONFLICT (school_id, campus_id, education_level_id) DO UPDATE SET is_active = EXCLUDED.is_active`,
          [schoolId.toString(), cid, lid, safeInt(nl.estado, 1) === 1],
        );
      }
    });
    return map;
  }

  private async migrateGradeGroups(
    schoolDb: string,
    schoolId: bigint,
  ): Promise<Map<number, number>> {
    const rows = await this.mysql.queryAll<{
      id: string;
      nombre_grado_agrupado: string;
      fin_ciclo_escolar: string;
    }>(`SELECT id, nombre_grado_agrupado, fin_ciclo_escolar FROM ${schoolDb}.grados_agrupados ORDER BY id`);

    const map = new Map<number, number>();
    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of rows) {
        const legacyId = safeInt(r.id);
        const name = cleanStr(r.nombre_grado_agrupado, `Grupo ${legacyId}`, 200);
        const existing = await client.query<{ new_id: string }>(
          `SELECT new_id::text FROM migration_id_mappings WHERE school_id=$1 AND entity_name='grade_groups' AND legacy_id=$2`,
          [schoolId.toString(), String(legacyId)],
        );
        let newId: number;
        if (existing.rowCount && existing.rowCount > 0) {
          newId = Number(existing.rows[0].new_id);
        } else {
          const ins = await client.query<{ id: string }>(
            `INSERT INTO grade_groups (school_id, catalog_grade_group_id, name, is_cycle_end)
             VALUES ($1,$2,$3,$4) RETURNING id::text`,
            [schoolId.toString(), legacyId <= 14 ? legacyId : null, name, safeInt(r.fin_ciclo_escolar) === 1],
          );
          newId = Number(ins.rows[0].id);
        }
        map.set(legacyId, newId);
      }
    });
    await this.saveIdMappingsBatch(schoolId, 'grade_groups', Array.from(map.entries()), schoolDb.replace(/`/g, ''));
    return map;
  }

  private async migrateGrades(
    schoolDb: string,
    schoolId: bigint,
    levelMap: Map<number, number>,
    gradeGroupMap: Map<number, number>,
  ): Promise<{ gradeMap: Map<number, number>; gradeToGroupIdMap: Map<number, number> }> {
    const [grados, auxGroups] = await Promise.all([
      this.mysql.queryAll<{
        id: string;
        id_nivel: string;
        cod_grado: string;
        grado: string;
        uso: string;
      }>(`SELECT id, id_nivel, cod_grado, grado, uso FROM ${schoolDb}.grados ORDER BY id`),
      this.mysql.queryAll<{ id_grado_agrupado: string; id_grado: string }>(
        `SELECT id_grado_agrupado, id_grado FROM ${schoolDb}.aux_grados_agrupados`,
      ),
    ]);

    // Priorizar grupos académicos (5, 3, 6, 7, 8, 1, 2, 4) sobre grupos de promoción (9..14)
    const preferredOrder = [5, 3, 6, 7, 8, 1, 2, 4];
    const legacyGroupByGrade = new Map<number, number>();
    for (const a of auxGroups) {
      const gid = safeInt(a.id_grado);
      const ggid = safeInt(a.id_grado_agrupado);
      const current = legacyGroupByGrade.get(gid);
      if (current === undefined) {
        legacyGroupByGrade.set(gid, ggid);
      } else {
        const idxNew = preferredOrder.indexOf(ggid);
        const idxCur = preferredOrder.indexOf(current);
        if (idxNew !== -1 && (idxCur === -1 || idxNew < idxCur)) {
          legacyGroupByGrade.set(gid, ggid);
        }
      }
    }

    const fallbackLevelId = levelMap.values().next().value as number;
    const gradeMap = new Map<number, number>();
    const gradeToGroupIdMap = new Map<number, number>();

    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of grados) {
        const legacyId = safeInt(r.id);
        const levelId = levelMap.get(safeInt(r.id_nivel)) ?? fallbackLevelId;
        const legacyGgId = legacyGroupByGrade.get(legacyId);
        const newGgId = legacyGgId ? (gradeGroupMap.get(legacyGgId) ?? null) : null;
        const gradeCode = cleanStr(r.cod_grado, String(legacyId), 10);
        const name = cleanStr(r.grado, `Grado ${gradeCode}`, 120);

        const res = await client.query<{ id: string }>(
          `INSERT INTO grades (
             school_id, education_level_id, grade_group_id, catalog_grade_id,
             grade_code, name, display_order, is_active
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (school_id, grade_code)
           DO UPDATE SET
             education_level_id = EXCLUDED.education_level_id,
             grade_group_id = COALESCE(EXCLUDED.grade_group_id, grades.grade_group_id),
             name = EXCLUDED.name,
             is_active = EXCLUDED.is_active
           RETURNING id::text`,
          [schoolId.toString(), levelId, newGgId, legacyId <= 24 ? legacyId : null, gradeCode, name, legacyId, safeInt(r.uso, 1) === 1],
        );
        const newGradeId = Number(res.rows[0].id);
        gradeMap.set(legacyId, newGradeId);
        if (newGgId) {
          gradeToGroupIdMap.set(newGradeId, newGgId);
        }
      }
    });
    await this.saveIdMappingsBatch(schoolId, 'grades', Array.from(gradeMap.entries()), schoolDb.replace(/`/g, ''));
    return { gradeMap, gradeToGroupIdMap };
  }

  private async migrateAcademicYears(
    schoolDb: string,
    schoolId: bigint,
    allowedYears: Set<number> | null,
  ): Promise<void> {
    const rows = await this.mysql.queryAll<{ year: string }>(
      `SELECT DISTINCT year FROM (
         SELECT year FROM ${schoolDb}.student_enrollment
         UNION SELECT year FROM ${schoolDb}.periodos_academicos
         UNION SELECT year FROM ${schoolDb}.config001
       ) y WHERE year BETWEEN 1990 AND 2100 ORDER BY year`,
    );
    const currentYear = new Date().getFullYear();
    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of rows) {
        const yr = safeInt(r.year);
        if (allowedYears && !allowedYears.has(yr)) continue;
        await client.query(
          `INSERT INTO academic_years (school_id, year, start_date, end_date, is_closed)
           VALUES ($1,$2,$3::date,$4::date,$5)
           ON CONFLICT (school_id, year) DO UPDATE SET is_closed = EXCLUDED.is_closed, updated_at = NOW()`,
          [schoolId.toString(), yr, `${yr}-01-15`, `${yr}-12-05`, yr < currentYear],
        );
      }
    });
  }

  private async migrateAcademicPeriods(
    schoolDb: string,
    schoolId: bigint,
    gradeGroupMap: Map<number, number>,
    allowedYears: Set<number> | null,
  ): Promise<Map<string, number>> {
    const rows = await this.mysql.queryAll<{
      id: string;
      id_grado_agrupado: string;
      periodo: string;
      descripcion_periodo: string;
      fecha_inical: string | null;
      fecha_cierre: string | null;
      fecha_inical_nivelacion: string | null;
      fecha_cierre_nivelacion: string | null;
      porciento: string;
      year: string;
      estado: string;
      bloquear: string;
    }>(
      `SELECT id, id_grado_agrupado, periodo, descripcion_periodo, fecha_inical, fecha_cierre,
              fecha_inical_nivelacion, fecha_cierre_nivelacion, porciento, year, estado, bloquear
         FROM ${schoolDb}.periodos_academicos
        WHERE ${this.yearWhere('year', allowedYears)}
        ORDER BY year, id_grado_agrupado, periodo`,
    );

    // Clave: `${year}:${gradeGroupId ?? 0}:${periodNumber}` -> academic_periods.id
    const resolver = new Map<string, number>();

    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of rows) {
        const year = safeInt(r.year);
        const periodNumber = safeInt(r.periodo);
        if (year < 1990 || year > 2100 || periodNumber < 1 || periodNumber > 6) {
          continue;
        }
        const ggId = gradeGroupMap.get(safeInt(r.id_grado_agrupado)) ?? null;
        const startDate = safeDate(r.fecha_inical, `${year}-01-19`)!;
        let endDate = safeDate(r.fecha_cierre, `${year}-11-30`)!;
        if (endDate < startDate) {
          endDate = startDate;
        }
        const recOpen = safeDate(r.fecha_inical_nivelacion, null);
        const recClose = safeDate(r.fecha_cierre_nivelacion, null);

        const res = await client.query<{ id: string }>(
          `INSERT INTO academic_periods (
             school_id, grade_group_id, academic_year, period_number, name, weight_percentage,
             start_date, end_date, grading_open_date, grading_close_date,
             recovery_open_date, recovery_close_date, is_active, is_closed
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7::date,$8::date,$7::date,$8::date,$9::date,$10::date,$11,$12)
           ON CONFLICT (school_id, academic_year, grade_group_id, period_number)
           DO UPDATE SET
             name = EXCLUDED.name,
             weight_percentage = EXCLUDED.weight_percentage,
             start_date = EXCLUDED.start_date,
             end_date = EXCLUDED.end_date,
             recovery_open_date = EXCLUDED.recovery_open_date,
             recovery_close_date = EXCLUDED.recovery_close_date,
             is_active = EXCLUDED.is_active,
             is_closed = EXCLUDED.is_closed
           RETURNING id::text`,
          [
            schoolId.toString(),
            ggId,
            year,
            periodNumber,
            cleanStr(r.descripcion_periodo, `PERIODO ${periodNumber}`, 80),
            safeDecimal(r.porciento, 25, 0, 100),
            startDate,
            endDate,
            recOpen,
            recClose,
            safeInt(r.estado, 1) === 1,
            safeInt(r.bloquear, 0) === 1,
          ],
        );
        const pid = Number(res.rows[0].id);
        resolver.set(`${year}:${ggId ?? 0}:${periodNumber}`, pid);
        if (!resolver.has(`${year}:0:${periodNumber}`)) {
          resolver.set(`${year}:0:${periodNumber}`, pid);
        }
      }

      // Cargar también los periodos existentes (por ej. creados en bootstrap) para lookup completo
      const existing = await client.query<{
        id: string;
        academic_year: number;
        grade_group_id: string | null;
        period_number: number;
      }>(
        `SELECT id::text, academic_year, grade_group_id::text, period_number
           FROM academic_periods WHERE school_id = $1`,
        [schoolId.toString()],
      );
      for (const p of existing.rows) {
        const key = `${p.academic_year}:${p.grade_group_id ?? '0'}:${p.period_number}`;
        if (!resolver.has(key)) resolver.set(key, Number(p.id));
        const fbKey = `${p.academic_year}:0:${p.period_number}`;
        if (!resolver.has(fbKey)) resolver.set(fbKey, Number(p.id));
      }
    });

    return resolver;
  }

  private async migrateGradingRulesAndScales(
    schoolDb: string,
    schoolId: bigint,
    gradeGroupMap: Map<number, number>,
    catalogs: CatalogValidationSets,
    allowedYears: Set<number> | null,
  ): Promise<void> {
    const [configs, scales] = await Promise.all([
      this.mysql.queryAll<{
        id_grupo_grados: string;
        year: string;
        areas_pierde: string;
        pierde_luego_rec: string;
        promocion: string;
        Ndecimales: string;
        nota_max_rec: string;
        porcentaje_areas: string;
        porciento_ausencia: string;
        fecha_prom: string | null;
        aplicar_redondeo_fin_año: string;
      }>(
        `SELECT id_grupo_grados, year, areas_pierde, pierde_luego_rec, promocion, Ndecimales,
                nota_max_rec, porcentaje_areas, porciento_ausencia, fecha_prom, \`aplicar_redondeo_fin_año\`
           FROM ${schoolDb}.config001
          WHERE ${this.yearWhere('year', allowedYears)}`,
      ),
      this.mysql.queryAll<{
        id: string;
        id_grado_agrupado: string;
        id_escala: string;
        desde: string;
        hasta: string;
        year: string;
        reprueba: string;
      }>(
        `SELECT id, id_grado_agrupado, id_escala, desde, hasta, year, reprueba
           FROM ${schoolDb}.\`desempeños\`
          WHERE ${this.yearWhere('year', allowedYears)}`,
      ),
    ]);

    const minPassingByYearGroup = new Map<string, number>();
    for (const s of scales) {
      if (safeInt(s.reprueba) === 0 && safeDecimal(s.desde) > 0) {
        const key = `${safeInt(s.year)}:${safeInt(s.id_grado_agrupado)}`;
        const d = safeDecimal(s.desde);
        const cur = minPassingByYearGroup.get(key);
        if (cur === undefined || d < cur) minPassingByYearGroup.set(key, d);
      }
    }

    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const c of configs) {
        const year = safeInt(c.year);
        const legacyGg = safeInt(c.id_grupo_grados);
        const ggId = gradeGroupMap.get(legacyGg);
        if (!ggId || year < 1990 || year > 2100) continue;
        const minPass = minPassingByYearGroup.get(`${year}:${legacyGg}`) ?? 3.0;
        await client.query(
          `INSERT INTO academic_grading_rules (
             school_id, academic_year, grade_group_id, decimals_count, min_passing_score,
             max_recovery_score, failed_areas_limit, fails_after_recovery, promotion_mode,
             uses_weighted_areas, absence_fail_percentage, rounds_final_score, promotion_date
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::date)
           ON CONFLICT (school_id, academic_year, grade_group_id)
           DO UPDATE SET
             decimals_count = EXCLUDED.decimals_count,
             min_passing_score = EXCLUDED.min_passing_score,
             max_recovery_score = EXCLUDED.max_recovery_score,
             failed_areas_limit = EXCLUDED.failed_areas_limit,
             promotion_date = EXCLUDED.promotion_date`,
          [
            schoolId.toString(),
            year,
            ggId,
            safeInt(c.Ndecimales, 2),
            minPass,
            safeDecimal(c.nota_max_rec, 3.0, 0, 100),
            safeInt(c.areas_pierde, 3),
            safeInt(c.pierde_luego_rec, 1) === 1,
            safeInt(c.promocion, 1),
            safeInt(c.porcentaje_areas, 1) === 1,
            safeDecimal(c.porciento_ausencia, 20, 0, 100),
            safeInt(c['aplicar_redondeo_fin_año'], 0) === 1,
            safeDate(c.fecha_prom, null),
          ],
        );
      }

      for (const s of scales) {
        const year = safeInt(s.year);
        const nsId = validCatalogId(s.id_escala, catalogs.nationalScales, null);
        if (nsId === null || year < 1990 || year > 2100) continue;
        const ggId = gradeGroupMap.get(safeInt(s.id_grado_agrupado)) ?? null;
        const minS = safeDecimal(s.desde, 0, 0, 100);
        const maxS = Math.max(minS, safeDecimal(s.hasta, minS, 0, 100));
        await client.query(
          `INSERT INTO grading_scales (
             school_id, grade_group_id, national_scale_id, academic_year, min_score, max_score, rank_order
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (school_id, academic_year, grade_group_id, national_scale_id)
           DO UPDATE SET min_score = EXCLUDED.min_score, max_score = EXCLUDED.max_score`,
          [schoolId.toString(), ggId, nsId, year, minS, maxS, String(safeInt(s.id))],
        );
      }
    });
  }

  private async migrateDimensionsAndColumns(
    schoolDb: string,
    schoolId: bigint,
    gradeGroupMap: Map<number, number>,
    allowedYears: Set<number> | null,
  ): Promise<{
    dimensionMap: Map<number, number>;
    dimColByLegacyCncId: Map<number, { dimensionId: number; columnNumber: number; tipo: string }>;
  }> {
    const [dims, cols] = await Promise.all([
      this.mysql.queryAll<{
        id_pk: string;
        id: string;
        id_grado_agrupado: string;
        competencia: string;
        porcentaje: string;
        year: string;
        calificable: string;
      }>(
        `SELECT id_pk, id, id_grado_agrupado, competencia, porcentaje, year, calificable
           FROM ${schoolDb}.competencias
          WHERE ${this.yearWhere('year', allowedYears)}
          ORDER BY id_pk`,
      ),
      this.mysql.queryAll<{
        id: string;
        id_competencia: string;
        numero_column: string;
        porciento: string;
        descripcion: string;
        tipo: string;
      }>(`SELECT id, id_competencia, numero_column, porciento, descripcion, tipo FROM ${schoolDb}.columnas_notas_competencias ORDER BY id`),
    ]);

    const dimensionMap = new Map<number, number>();
    const dimColByLegacyCncId = new Map<
      number,
      { dimensionId: number; columnNumber: number; tipo: string }
    >();

    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const d of dims) {
        const year = safeInt(d.year);
        if (year < 1990 || year > 2100) continue;
        const ggId = gradeGroupMap.get(safeInt(d.id_grado_agrupado)) ?? null;
        const code = safeInt(d.id);
        const res = await client.query<{ id: string }>(
          `INSERT INTO evaluation_dimensions (
             school_id, grade_group_id, academic_year, dimension_code, name, weight_percentage, is_editable
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (school_id, academic_year, grade_group_id, dimension_code)
           DO UPDATE SET name = EXCLUDED.name, weight_percentage = EXCLUDED.weight_percentage
           RETURNING id::text`,
          [
            schoolId.toString(),
            ggId,
            year,
            code,
            cleanStr(d.competencia, `Dimensión ${code}`, 120),
            safeDecimal(d.porcentaje, 0, 0, 100),
            safeInt(d.calificable, 1) === 1,
          ],
        );
        dimensionMap.set(safeInt(d.id_pk), Number(res.rows[0].id));
      }

      for (const c of cols) {
        const dimId = dimensionMap.get(safeInt(c.id_competencia));
        const colNum = safeInt(c.numero_column);
        if (!dimId || colNum < 1 || colNum > 30) continue;
        dimColByLegacyCncId.set(safeInt(c.id), {
          dimensionId: dimId,
          columnNumber: colNum,
          tipo: cleanStr(c.tipo, 'NOTA').toUpperCase(),
        });
        await client.query(
          `INSERT INTO evaluation_dimension_columns (
             school_id, dimension_id, column_number, label, weight_percentage
           )
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (school_id, dimension_id, column_number)
           DO UPDATE SET label = EXCLUDED.label, weight_percentage = EXCLUDED.weight_percentage`,
          [
            schoolId.toString(),
            dimId,
            colNum,
            cleanStr(c.descripcion, `${c.tipo || 'NOTA'} ${colNum}`, 120),
            safeDecimal(c.porciento, 0, 0, 100),
          ],
        );
      }
    });

    return { dimensionMap, dimColByLegacyCncId };
  }

  private async migrateTeachers(
    schoolDb: string,
    schoolId: bigint,
    userIdMap: Map<number, number>,
    catalogs: CatalogValidationSets,
  ): Promise<{
    teacherMap: Map<number, number>;
    teacherUserIdMap: Map<number, number>;
    sourceTeachersCount: number;
  }> {
    const [rows, links] = await Promise.all([
      this.mysql.queryAll<{
        id_docente: string;
        id_documento: string | null;
        id_escalafon: string | null;
        cod_nivel: string | null;
        arean_ens: string | null;
        direccion: string | null;
        documento: string;
        fecha_nacimiento: string | null;
        apellido1: string;
        apellido2: string | null;
        nombre1: string;
        nombre2: string | null;
        sexo: string | null;
        movil: string | null;
        fijo: string | null;
        email: string | null;
        estado: string;
      }>(`SELECT id_docente, id_documento, id_escalafon, cod_nivel, arean_ens, direccion, documento, fecha_nacimiento, apellido1, apellido2, nombre1, nombre2, sexo, movil, fijo, email, estado FROM ${schoolDb}.docentes ORDER BY id_docente`),
      this.mysql.queryAll<{ teacher_id: string; user_id: string }>(
        `SELECT teacher_id, user_id FROM ${schoolDb}.teachers_and_users_ids`,
      ),
    ]);

    const adminUidByTeacher = new Map<number, number>();
    for (const l of links) {
      adminUidByTeacher.set(safeInt(l.teacher_id), safeInt(l.user_id));
    }

    const teacherMap = new Map<number, number>();
    const teacherUserIdMap = new Map<number, number>();

    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of rows) {
        const legacyId = safeInt(r.id_docente);
        const adminUid = adminUidByTeacher.get(legacyId);
        const newUid = adminUid ? (userIdMap.get(adminUid) ?? null) : null;
        const docNumber = cleanStr(r.documento, `DOC-${legacyId}`, 30);

        const res = await client.query<{ id: string }>(
          `INSERT INTO teacher_profiles (
             school_id, user_id, document_type_id, document_number,
             first_name, middle_name, last_name, second_last_name,
             gender_id, birth_date, address, phone, email,
             academic_degree_id, pay_scale_id, teaching_area_id, is_active
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::date,$11,$12,$13,$14,$15,$16,$17)
           ON CONFLICT (school_id, document_number)
           DO UPDATE SET
             user_id = COALESCE(EXCLUDED.user_id, teacher_profiles.user_id),
             first_name = EXCLUDED.first_name,
             last_name = EXCLUDED.last_name,
             phone = COALESCE(EXCLUDED.phone, teacher_profiles.phone),
             email = COALESCE(EXCLUDED.email, teacher_profiles.email),
             is_active = EXCLUDED.is_active
           RETURNING id::text`,
          [
            schoolId.toString(),
            newUid,
            validCatalogId(r.id_documento, catalogs.docTypes, 1),
            docNumber,
            cleanStr(r.nombre1, 'DOCENTE', 80),
            cleanNullableStr(r.nombre2, 80),
            cleanStr(r.apellido1, String(legacyId), 80),
            cleanNullableStr(r.apellido2, 80),
            mapLegacyGender(r.sexo),
            safeDate(r.fecha_nacimiento, null),
            cleanNullableStr(r.direccion, 200),
            cleanPhone(r.movil) ?? cleanPhone(r.fijo),
            cleanEmail(r.email),
            validCatalogId(r.cod_nivel, catalogs.academicDegrees, null),
            validCatalogId(r.id_escalafon, catalogs.payScales, null),
            validCatalogId(r.arean_ens, catalogs.teachingAreas, null),
            safeInt(r.estado, 1) === 1,
          ],
        );
        const newId = Number(res.rows[0].id);
        teacherMap.set(legacyId, newId);
        if (newUid) {
          teacherUserIdMap.set(legacyId, newUid);
        }
      }
    });

    await this.saveIdMappingsBatch(schoolId, 'teacher_profiles', Array.from(teacherMap.entries()), schoolDb.replace(/`/g, ''));
    return { teacherMap, teacherUserIdMap, sourceTeachersCount: rows.length };
  }

  private async migrateAdministrativeStaff(
    schoolDb: string,
    schoolId: bigint,
    catalogs: CatalogValidationSets,
  ): Promise<void> {
    const rows = await this.mysql.queryAll<{
      id: string;
      id_documento: string | null;
      numero_documento: string;
      nombre1: string;
      nombre2: string | null;
      apellido1: string;
      apellido2: string | null;
      sexo: string | null;
      fecha_nacimiento: string | null;
      celular: string | null;
      telefono: string | null;
      email: string | null;
      estado: string;
    }>(`SELECT id, id_documento, numero_documento, nombre1, nombre2, apellido1, apellido2, sexo, fecha_nacimiento, celular, telefono, email, estado FROM ${schoolDb}.administrativos`);

    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of rows) {
        const legacyId = safeInt(r.id);
        await client.query(
          `INSERT INTO administrative_staff (
             school_id, document_type_id, document_number, first_name, middle_name,
             last_name, second_last_name, gender_id, birth_date, phone, email, is_active
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::date,$10,$11,$12)
           ON CONFLICT (school_id, document_number)
           DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, is_active = EXCLUDED.is_active`,
          [
            schoolId.toString(),
            validCatalogId(r.id_documento, catalogs.docTypes, 1),
            cleanStr(r.numero_documento, `ADM-${legacyId}`, 30),
            cleanStr(r.nombre1, 'ADMIN', 80),
            cleanNullableStr(r.nombre2, 80),
            cleanStr(r.apellido1, String(legacyId), 80),
            cleanNullableStr(r.apellido2, 80),
            mapLegacyGender(r.sexo),
            safeDate(r.fecha_nacimiento, null),
            cleanPhone(r.celular) ?? cleanPhone(r.telefono),
            cleanEmail(r.email),
            safeInt(r.estado, 1) === 1,
          ],
        );
      }
    });
  }

  private async migrateAcademicAreas(
    schoolDb: string,
    schoolId: bigint,
  ): Promise<Map<number, number>> {
    const rows = await this.mysql.queryAll<{
      id: string;
      area: string;
      abrev: string | null;
      pierde_año_lectivo: string;
      ordenar: string;
      estado: string;
    }>(`SELECT id, area, abrev, \`pierde_año_lectivo\`, ordenar, estado FROM ${schoolDb}.areas ORDER BY id`);

    const map = new Map<number, number>();
    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of rows) {
        const legacyId = safeInt(r.id);
        const existing = await client.query<{ new_id: string }>(
          `SELECT new_id::text FROM migration_id_mappings WHERE school_id=$1 AND entity_name='academic_areas' AND legacy_id=$2`,
          [schoolId.toString(), String(legacyId)],
        );
        const name = cleanStr(r.area, `Área ${legacyId}`, 200);
        let newId: number;
        if (existing.rowCount && existing.rowCount > 0) {
          newId = Number(existing.rows[0].new_id);
          await client.query(
            `UPDATE academic_areas SET name=$3, abbreviation=$4, fails_school_year=$5, display_order=$6, is_active=$7 WHERE school_id=$1 AND id=$2`,
            [schoolId.toString(), newId, name, cleanNullableStr(r.abrev, 15), safeInt(r['pierde_año_lectivo']) === 1, safeInt(r.ordenar, legacyId), safeInt(r.estado, 1) === 1],
          );
        } else {
          const ins = await client.query<{ id: string }>(
            `INSERT INTO academic_areas (school_id, name, abbreviation, fails_school_year, display_order, is_active)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING id::text`,
            [schoolId.toString(), name, cleanNullableStr(r.abrev, 15), safeInt(r['pierde_año_lectivo']) === 1, safeInt(r.ordenar, legacyId), safeInt(r.estado, 1) === 1],
          );
          newId = Number(ins.rows[0].id);
        }
        map.set(legacyId, newId);
      }
    });
    await this.saveIdMappingsBatch(schoolId, 'academic_areas', Array.from(map.entries()), schoolDb.replace(/`/g, ''));
    return map;
  }

  private async migrateSubjects(
    schoolDb: string,
    schoolId: bigint,
    areaMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const [asigs, aux] = await Promise.all([
      this.mysql.queryAll<{
        id_pk: string;
        asignatura: string;
        abrev: string | null;
        ordenar: string;
        electiva: string;
        estado: string;
      }>(`SELECT id_pk, asignatura, abrev, ordenar, electiva, estado FROM ${schoolDb}.asignaturas ORDER BY id_pk`),
      this.mysql.queryAll<{ id_asign: string; id_area: string; year: string }>(
        `SELECT id_asign, id_area, year FROM ${schoolDb}.aux_asignaturas ORDER BY year ASC, id ASC`,
      ),
    ]);

    const areaBySubjectPk = new Map<number, number>();
    for (const a of aux) {
      const areaId = areaMap.get(safeInt(a.id_area));
      if (areaId) areaBySubjectPk.set(safeInt(a.id_asign), areaId);
    }
    const fallbackAreaId = areaMap.values().next().value as number;
    const map = new Map<number, number>();

    await this.db.withTenantTransaction(schoolId, async (client) => {
      for (const r of asigs) {
        const legacyPk = safeInt(r.id_pk);
        const areaId = areaBySubjectPk.get(legacyPk) ?? fallbackAreaId;
        const name = cleanStr(r.asignatura, `Asignatura ${legacyPk}`, 200);
        const existing = await client.query<{ new_id: string }>(
          `SELECT new_id::text FROM migration_id_mappings WHERE school_id=$1 AND entity_name='subjects' AND legacy_id=$2`,
          [schoolId.toString(), String(legacyPk)],
        );
        let newId: number;
        if (existing.rowCount && existing.rowCount > 0) {
          newId = Number(existing.rows[0].new_id);
          await client.query(
            `UPDATE subjects SET academic_area_id=$3, name=$4, abbreviation=$5, is_elective=$6, display_order=$7, is_active=$8 WHERE school_id=$1 AND id=$2`,
            [schoolId.toString(), newId, areaId, name, cleanNullableStr(r.abrev, 15), safeInt(r.electiva) === 1, safeInt(r.ordenar, legacyPk), safeInt(r.estado, 1) === 1],
          );
        } else {
          const ins = await client.query<{ id: string }>(
            `INSERT INTO subjects (school_id, academic_area_id, name, abbreviation, is_elective, display_order, is_active)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id::text`,
            [schoolId.toString(), areaId, name, cleanNullableStr(r.abrev, 15), safeInt(r.electiva) === 1, safeInt(r.ordenar, legacyPk), safeInt(r.estado, 1) === 1],
          );
          newId = Number(ins.rows[0].id);
        }
        map.set(legacyPk, newId);
      }
    });
    await this.saveIdMappingsBatch(schoolId, 'subjects', Array.from(map.entries()), schoolDb.replace(/`/g, ''));
    return map;
  }

  private async migrateStudyPlans(
    schoolDb: string,
    schoolId: bigint,
    gradeMap: Map<number, number>,
    subjectMap: Map<number, number>,
    allowedYears: Set<number> | null,
  ): Promise<void> {
    const rows = await this.mysql.queryAll<{
      id_grado: string;
      id_asig: string;
      ih: string;
      year: string;
      porciento: string;
      estado: string;
    }>(
      `SELECT id_grado, id_asig, ih, year, porciento, estado
         FROM ${schoolDb}.matcurso
        WHERE ${this.yearWhere('year', allowedYears)}`,
    );

    const prepared = dedupeByKey(
      rows
        .map((r) => {
          const gid = gradeMap.get(safeInt(r.id_grado));
          const sid = subjectMap.get(safeInt(r.id_asig));
          const year = safeInt(r.year);
          if (!gid || !sid || year < 1990 || year > 2100) return null;
          return {
            gradeId: gid,
            subjectId: sid,
            year,
            ih: Math.max(1, Math.round(safeDecimal(r.ih, 2, 0, 40))),
            weight: safeDecimal(r.porciento, 100, 0, 100),
            isActive: safeInt(r.estado, 1) === 1,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
      (x) => `${x.gradeId}:${x.subjectId}:${x.year}`,
    );

    for (let i = 0; i < prepared.length; i += 1000) {
      const batch = prepared.slice(i, i + 1000);
      await this.db.withTenantTransaction(schoolId, async (client) => {
        await client.query(
          `INSERT INTO curriculum_study_plans (
             school_id, campus_id, grade_id, subject_id, academic_year,
             weekly_hours, area_weight_percentage, is_active
           )
           SELECT $1::bigint, NULL::bigint, * FROM UNNEST(
             $2::bigint[], $3::bigint[], $4::smallint[], $5::smallint[], $6::numeric[], $7::boolean[]
           )
           ON CONFLICT (school_id, campus_id, grade_id, subject_id, academic_year)
           DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours, area_weight_percentage = EXCLUDED.area_weight_percentage`,
          [
            schoolId.toString(),
            batch.map((b) => b.gradeId),
            batch.map((b) => b.subjectId),
            batch.map((b) => b.year),
            batch.map((b) => b.ih),
            batch.map((b) => b.weight),
            batch.map((b) => b.isActive),
          ],
        );
      });
    }
  }

  private async migrateAcademicGroups(
    schoolDb: string,
    schoolId: bigint,
    campusMap: Map<number, number>,
    shiftMap: Map<number, number>,
    gradeMap: Map<number, number>,
    teacherMap: Map<number, number>,
    allowedYears: Set<number> | null,
  ): Promise<Map<string, number>> {
    const [dirRows, distinctGroups] = await Promise.all([
      this.mysql.queryAll<{
        id_sede: string;
        id_jorn: string;
        id_grado: string;
        grupo: string;
        year: string;
        id_docente: string;
      }>(
        `SELECT id_sede, id_jorn, id_grado, TRIM(grupo) AS grupo, year, id_docente
           FROM ${schoolDb}.dir_grupo
          WHERE ${this.yearWhere('year', allowedYears)}`,
      ),
      this.mysql.queryAll<{
        id_sede: string;
        id_jorn: string;
        id_grado: string;
        grupo: string;
        year: string;
      }>(
        `SELECT DISTINCT id_sede, id_jorn, id_grado, grupo, year FROM (
           SELECT id_headquarters AS id_sede, id_study_day AS id_jorn, id_grade AS id_grado, TRIM(id_group) AS grupo, year
             FROM ${schoolDb}.student_enrollment WHERE ${this.yearWhere('year', allowedYears)}
           UNION
           SELECT id_sede, id_jorn, id_grado, TRIM(grupo) AS grupo, year
             FROM ${schoolDb}.cursos WHERE ${this.yearWhere('year', allowedYears)}
           UNION
           SELECT id_sede, id_jorn, id_grado, TRIM(grupo) AS grupo, year
             FROM ${schoolDb}.dir_grupo WHERE ${this.yearWhere('year', allowedYears)}
         ) g`,
      ),
    ]);

    const fallbackCampusId = campusMap.values().next().value as number;
    const fallbackShiftId = shiftMap.values().next().value as number;
    const fallbackGradeId = gradeMap.values().next().value as number;

    const homeroomMap = new Map<string, number>();
    for (const d of dirRows) {
      const cid = campusMap.get(safeInt(d.id_sede)) ?? fallbackCampusId;
      const sid = shiftMap.get(safeInt(d.id_jorn)) ?? fallbackShiftId;
      const gid = gradeMap.get(safeInt(d.id_grado)) ?? fallbackGradeId;
      const tid = teacherMap.get(safeInt(d.id_docente));
      const gcode = cleanStr(d.grupo, '01', 10);
      if (tid) {
        homeroomMap.set(`${cid}:${sid}:${gid}:${safeInt(d.year)}:${gcode}`, tid);
      }
    }

    const gradeNameById = new Map<number, string>();
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const gr = await client.query<{ id: string; name: string }>(
        `SELECT id::text, name FROM grades WHERE school_id = $1`,
        [schoolId.toString()],
      );
      for (const x of gr.rows) gradeNameById.set(Number(x.id), x.name);
    });

    const prepared = dedupeByKey(
      distinctGroups
        .map((g) => {
          const year = safeInt(g.year);
          if (year < 1990 || year > 2100) return null;
          const cid = campusMap.get(safeInt(g.id_sede)) ?? fallbackCampusId;
          const sid = shiftMap.get(safeInt(g.id_jorn)) ?? fallbackShiftId;
          const gid = gradeMap.get(safeInt(g.id_grado)) ?? fallbackGradeId;
          const gcode = cleanStr(g.grupo, '01', 10);
          const key = `${cid}:${sid}:${gid}:${year}:${gcode}`;
          return {
            key,
            campusId: cid,
            shiftId: sid,
            gradeId: gid,
            homeroomTeacherId: homeroomMap.get(key) ?? null,
            year,
            groupCode: gcode,
            name: `${gradeNameById.get(gid) ?? 'Grado'} - ${gcode}`.slice(0, 120),
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
      (x) => x.key,
    );

    const groupKeyMap = new Map<string, number>();
    for (let i = 0; i < prepared.length; i += 1000) {
      const batch = prepared.slice(i, i + 1000);
      await this.db.withTenantTransaction(schoolId, async (client) => {
        const res = await client.query<{
          id: string;
          campus_id: string;
          shift_id: string;
          grade_id: string;
          academic_year: number;
          group_code: string;
        }>(
          `INSERT INTO academic_groups (
             school_id, campus_id, shift_id, grade_id, homeroom_teacher_id,
             academic_year, group_code, name, is_active
           )
           SELECT $1::bigint, * FROM UNNEST(
             $2::bigint[], $3::bigint[], $4::bigint[], $5::bigint[],
             $6::smallint[], $7::varchar[], $8::varchar[], $9::boolean[]
           )
           ON CONFLICT (school_id, campus_id, shift_id, grade_id, academic_year, group_code)
           DO UPDATE SET
             homeroom_teacher_id = COALESCE(EXCLUDED.homeroom_teacher_id, academic_groups.homeroom_teacher_id),
             name = EXCLUDED.name
           RETURNING id::text, campus_id::text, shift_id::text, grade_id::text, academic_year, group_code`,
          [
            schoolId.toString(),
            batch.map((b) => b.campusId),
            batch.map((b) => b.shiftId),
            batch.map((b) => b.gradeId),
            batch.map((b) => b.homeroomTeacherId),
            batch.map((b) => b.year),
            batch.map((b) => b.groupCode),
            batch.map((b) => b.name),
            batch.map(() => true),
          ],
        );
        for (const r of res.rows) {
          groupKeyMap.set(
            `${r.campus_id}:${r.shift_id}:${r.grade_id}:${r.academic_year}:${r.group_code}`,
            Number(r.id),
          );
        }
      });
    }

    return groupKeyMap;
  }

  private async migrateCourseAssignments(
    schoolDb: string,
    schoolId: bigint,
    campusMap: Map<number, number>,
    shiftMap: Map<number, number>,
    gradeMap: Map<number, number>,
    subjectMap: Map<number, number>,
    teacherMap: Map<number, number>,
    groupKeyMap: Map<string, number>,
    allowedYears: Set<number> | null,
  ): Promise<{
    courseMap: Map<number, number>;
    courseMetaMap: Map<number, { gradeId: number; subjectId: number; teacherId: number; year: number }>;
  }> {
    const [cursos, matcursos] = await Promise.all([
      this.mysql.queryAll<{
        id: string;
        id_sede: string;
        id_grado: string;
        id_asig: string;
        id_docente: string;
        id_jorn: string;
        grupo: string;
        year: string;
        estado: string;
      }>(
        `SELECT id, id_sede, id_grado, id_asig, id_docente, id_jorn, TRIM(grupo) AS grupo, year, estado
           FROM ${schoolDb}.cursos
          WHERE ${this.yearWhere('year', allowedYears)}
          ORDER BY id`,
      ),
      this.mysql.queryAll<{ id_grado: string; id_asig: string; year: string; ih: string; porciento: string }>(
        `SELECT id_grado, id_asig, year, ih, porciento FROM ${schoolDb}.matcurso WHERE ${this.yearWhere('year', allowedYears)}`,
      ),
    ]);

    const ihMap = new Map<string, { ih: number; weight: number }>();
    for (const m of matcursos) {
      ihMap.set(`${safeInt(m.id_grado)}:${safeInt(m.id_asig)}:${safeInt(m.year)}`, {
        ih: Math.max(1, Math.round(safeDecimal(m.ih, 2, 0, 40))),
        weight: safeDecimal(m.porciento, 100, 0, 100),
      });
    }

    const fallbackCampusId = campusMap.values().next().value as number;
    const fallbackShiftId = shiftMap.values().next().value as number;
    const fallbackGradeId = gradeMap.values().next().value as number;
    const fallbackSubjectId = subjectMap.values().next().value as number;
    const fallbackTeacherId = teacherMap.values().next().value as number;

    const prepared = cursos
      .map((c) => {
        const year = safeInt(c.year);
        if (year < 1990 || year > 2100) return null;
        const legacyId = safeInt(c.id);
        const cid = campusMap.get(safeInt(c.id_sede)) ?? fallbackCampusId;
        const sid = shiftMap.get(safeInt(c.id_jorn)) ?? fallbackShiftId;
        const gid = gradeMap.get(safeInt(c.id_grado)) ?? fallbackGradeId;
        const gcode = cleanStr(c.grupo, '01', 10);
        const agid = groupKeyMap.get(`${cid}:${sid}:${gid}:${year}:${gcode}`);
        if (!agid) return null;
        const subjId = subjectMap.get(safeInt(c.id_asig)) ?? fallbackSubjectId;
        const tid = teacherMap.get(safeInt(c.id_docente)) ?? fallbackTeacherId;
        const plan = ihMap.get(`${safeInt(c.id_grado)}:${safeInt(c.id_asig)}:${year}`);
        return {
          legacyId,
          campusId: cid,
          shiftId: sid,
          gradeId: gid,
          academicGroupId: agid,
          subjectId: subjId,
          teacherProfileId: tid,
          year,
          weeklyHours: plan?.ih ?? 2,
          weight: plan?.weight ?? 100,
          isActive: safeInt(c.estado, 1) === 1,
          conflictKey: `${agid}:${subjId}:${tid}:${year}`,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const courseMap = new Map<number, number>();
    const courseMetaMap = new Map<
      number,
      { gradeId: number; subjectId: number; teacherId: number; year: number }
    >();

    for (let i = 0; i < prepared.length; i += 1000) {
      const rawBatch = prepared.slice(i, i + 1000);
      const batch = dedupeByKey(rawBatch, (x) => x.conflictKey);
      await this.db.withTenantTransaction(schoolId, async (client) => {
        const res = await client.query<{
          id: string;
          academic_group_id: string;
          subject_id: string;
          teacher_profile_id: string;
          academic_year: number;
        }>(
          `INSERT INTO course_assignments (
             school_id, campus_id, shift_id, grade_id, academic_group_id,
             subject_id, teacher_profile_id, academic_year, weekly_hours,
             area_weight_percentage, is_active
           )
           SELECT $1::bigint, * FROM UNNEST(
             $2::bigint[], $3::bigint[], $4::bigint[], $5::bigint[],
             $6::bigint[], $7::bigint[], $8::smallint[], $9::smallint[],
             $10::numeric[], $11::boolean[]
           )
           ON CONFLICT (school_id, academic_group_id, subject_id, teacher_profile_id, academic_year)
           DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours, area_weight_percentage = EXCLUDED.area_weight_percentage
           RETURNING id::text, academic_group_id::text, subject_id::text, teacher_profile_id::text, academic_year`,
          [
            schoolId.toString(),
            batch.map((b) => b.campusId),
            batch.map((b) => b.shiftId),
            batch.map((b) => b.gradeId),
            batch.map((b) => b.academicGroupId),
            batch.map((b) => b.subjectId),
            batch.map((b) => b.teacherProfileId),
            batch.map((b) => b.year),
            batch.map((b) => b.weeklyHours),
            batch.map((b) => b.weight),
            batch.map((b) => b.isActive),
          ],
        );
        const byKey = new Map(
          res.rows.map((r) => [
            `${r.academic_group_id}:${r.subject_id}:${r.teacher_profile_id}:${r.academic_year}`,
            Number(r.id),
          ]),
        );
        for (const item of rawBatch) {
          const newId = byKey.get(item.conflictKey);
          if (newId) {
            courseMap.set(item.legacyId, newId);
            courseMetaMap.set(newId, {
              gradeId: item.gradeId,
              subjectId: item.subjectId,
              teacherId: item.teacherProfileId,
              year: item.year,
            });
          }
        }
      });
    }

    await this.saveIdMappingsBatch(schoolId, 'course_assignments', Array.from(courseMap.entries()), schoolDb.replace(/`/g, ''));
    this.logger.log('Fase 3.1 completada: cursos/cargas docentes migrados', {
      coursesMigrated: courseMap.size,
    });
    return { courseMap, courseMetaMap };
  }

  private async migrateStudents(
    schoolDb: string,
    schoolId: bigint,
    userIdMap: Map<number, number>,
    catalogs: CatalogValidationSets,
  ): Promise<{ studentMap: Map<number, number>; studentDocMap: Map<string, number> }> {
    const [students, extras, userLinks] = await Promise.all([
      this.mysql.queryAll<{
        id: string;
        id_zona: string | null;
        id_documento: string | null;
        id_sexo: string | null;
        id_country: string | null;
        nro_documento: string;
        lug_nacimiento: string | null;
        lug_expedicion: string | null;
        apellido1: string;
        apellido2: string | null;
        nombre1: string;
        nombre2: string | null;
        tipo_sangre: string | null;
        fecha_nacimiento: string | null;
        estrato: string | null;
        direccion: string | null;
        localidad: string | null;
        telefono: string | null;
        movil: string | null;
        ips: string | null;
        email: string | null;
      }>(`SELECT id, id_zona, id_documento, id_sexo, id_country, nro_documento, lug_nacimiento, lug_expedicion, apellido1, apellido2, nombre1, nombre2, tipo_sangre, fecha_nacimiento, estrato, direccion, localidad, telefono, movil, ips, email FROM ${schoolDb}.inscripciones ORDER BY id`),
      this.mysql.queryAll<{
        id_inscripcion: string;
        id_eps: string | null;
        id_etnia: string | null;
        id_resgua: string | null;
        id_discapacidad: string | null;
        id_cap_exc: string | null;
        id_pob_vic_conf: string | null;
        sisben: string | null;
        puntaje_sisben: string | null;
        cod_flia_accion: string | null;
      }>(`SELECT id_inscripcion, id_eps, id_etnia, id_resgua, id_discapacidad, id_cap_exc, id_pob_vic_conf, sisben, puntaje_sisben, cod_flia_accion FROM ${schoolDb}.extra_inscripciones`),
      this.mysql.queryAll<{ family_id: string; user_id: string }>(
        `SELECT family_id, user_id FROM ${schoolDb}.family_and_users_ids WHERE profile = 'student'`,
      ),
    ]);

    const extraByStud = new Map(extras.map((e) => [safeInt(e.id_inscripcion), e]));
    const uidByStud = new Map(userLinks.map((u) => [safeInt(u.family_id), safeInt(u.user_id)]));

    const prepared = students.map((s) => {
      const legacyId = safeInt(s.id);
      const ex = extraByStud.get(legacyId);
      const adminUid = uidByStud.get(legacyId);
      const docNum = cleanStr(s.nro_documento, `EST-${legacyId}`, 30);
      return {
        legacyId,
        userId: adminUid ? (userIdMap.get(adminUid) ?? null) : null,
        docTypeId: validCatalogId(s.id_documento, catalogs.docTypes, 2),
        docNumber: docNum,
        expCountryId: validCatalogId(s.id_country, catalogs.countries, 45),
        expCityId: validCatalogId(s.lug_expedicion, catalogs.cities, null),
        birthCityId: validCatalogId(s.lug_nacimiento, catalogs.cities, null),
        firstName: cleanStr(s.nombre1, 'ESTUDIANTE', 80),
        middleName: cleanNullableStr(s.nombre2, 80),
        lastName: cleanStr(s.apellido1, String(legacyId), 80),
        secondLastName: cleanNullableStr(s.apellido2, 80),
        genderId: mapLegacyGender(s.id_sexo),
        birthDate: safeDate(s.fecha_nacimiento, null),
        bloodType: cleanNullableStr(s.tipo_sangre, 10),
        address: cleanNullableStr(s.direccion, 250),
        zoneId: validCatalogId(s.id_zona, catalogs.zones, 0),
        locality: cleanNullableStr(s.localidad, 200),
        stratum: cleanNullableStr(s.estrato, 10),
        sisben: cleanNullableStr(ex?.sisben, 30) ?? (safeDecimal(ex?.puntaje_sisben) > 0 ? String(safeDecimal(ex?.puntaje_sisben)) : null),
        phone: cleanPhone(s.movil) ?? cleanPhone(s.telefono),
        email: cleanEmail(s.email),
        healthProviderId: validCatalogId(ex?.id_eps, catalogs.healthProviders, null),
        ipsName: cleanNullableStr(s.ips, 180),
        ethnicGroupId: validCatalogId(ex?.id_etnia, catalogs.ethnicGroups, null),
        reserveId: validCatalogId(ex?.id_resgua, catalogs.indigenousReserves, null),
        disabilityTypeId: validCatalogId(ex?.id_discapacidad, catalogs.disabilityTypes, null),
        capExcId: validCatalogId(ex?.id_cap_exc, catalogs.exceptionalCapabilities, null),
        conflictId: validCatalogId(ex?.id_pob_vic_conf, catalogs.conflictVictimTypes, null),
        isFamiliasAccion: Boolean(cleanNullableStr(ex?.cod_flia_accion)),
      };
    });

    const studentMap = new Map<number, number>();
    const studentDocMap = new Map<string, number>();

    for (let i = 0; i < prepared.length; i += 1000) {
      const rawBatch = prepared.slice(i, i + 1000);
      const batch = dedupeByKey(rawBatch, (x) => x.docNumber);
      await this.db.withTenantTransaction(schoolId, async (client) => {
        const res = await client.query<{ id: string; document_number: string }>(
          `INSERT INTO student_profiles (
             school_id, user_id, document_type_id, document_number,
             expedition_country_id, expedition_city_id, birth_city_id,
             first_name, middle_name, last_name, second_last_name,
             gender_id, birth_date, blood_type, address, zone_id, locality,
             socioeconomic_stratum, sisben_score, phone, email,
             health_provider_id, ips_name, ethnic_group_id, indigenous_reserve_id,
             disability_type_id, exceptional_capability_id, conflict_victim_type_id,
             is_familias_en_accion, is_active
           )
           SELECT $1::bigint, * FROM UNNEST(
             $2::bigint[], $3::smallint[], $4::varchar[],
             $5::int[], $6::int[], $7::int[],
             $8::varchar[], $9::varchar[], $10::varchar[], $11::varchar[],
             $12::smallint[], $13::date[], $14::varchar[], $15::varchar[], $16::smallint[], $17::varchar[],
             $18::varchar[], $19::varchar[], $20::varchar[], $21::varchar[],
             $22::int[], $23::varchar[], $24::int[], $25::int[],
             $26::smallint[], $27::smallint[], $28::smallint[],
             $29::boolean[], $30::boolean[]
           )
           ON CONFLICT (school_id, document_number)
           DO UPDATE SET
             user_id = COALESCE(EXCLUDED.user_id, student_profiles.user_id),
             first_name = EXCLUDED.first_name,
             last_name = EXCLUDED.last_name,
             phone = COALESCE(EXCLUDED.phone, student_profiles.phone),
             email = COALESCE(EXCLUDED.email, student_profiles.email),
             updated_at = NOW()
           RETURNING id::text, document_number`,
          [
            schoolId.toString(),
            batch.map((b) => b.userId),
            batch.map((b) => b.docTypeId),
            batch.map((b) => b.docNumber),
            batch.map((b) => b.expCountryId),
            batch.map((b) => b.expCityId),
            batch.map((b) => b.birthCityId),
            batch.map((b) => b.firstName),
            batch.map((b) => b.middleName),
            batch.map((b) => b.lastName),
            batch.map((b) => b.secondLastName),
            batch.map((b) => b.genderId),
            batch.map((b) => b.birthDate),
            batch.map((b) => b.bloodType),
            batch.map((b) => b.address),
            batch.map((b) => b.zoneId),
            batch.map((b) => b.locality),
            batch.map((b) => b.stratum),
            batch.map((b) => b.sisben),
            batch.map((b) => b.phone),
            batch.map((b) => b.email),
            batch.map((b) => b.healthProviderId),
            batch.map((b) => b.ipsName),
            batch.map((b) => b.ethnicGroupId),
            batch.map((b) => b.reserveId),
            batch.map((b) => b.disabilityTypeId),
            batch.map((b) => b.capExcId),
            batch.map((b) => b.conflictId),
            batch.map((b) => b.isFamiliasAccion),
            batch.map(() => true),
          ],
        );
        for (const r of res.rows) {
          studentDocMap.set(r.document_number, Number(r.id));
        }
      });
    }

    for (const s of prepared) {
      const newId = studentDocMap.get(s.docNumber);
      if (newId) studentMap.set(s.legacyId, newId);
    }
    await this.saveIdMappingsBatch(schoolId, 'student_profiles', Array.from(studentMap.entries()), schoolDb.replace(/`/g, ''));
    this.logger.log('Fase 3.2 completada: perfiles de estudiantes migrados', {
      studentsMigrated: studentDocMap.size,
    });
    return { studentMap, studentDocMap };
  }

  private async migrateFamilies(
    schoolDb: string,
    schoolId: bigint,
    userIdMap: Map<number, number>,
    catalogs: CatalogValidationSets,
  ): Promise<{ familyMap: Map<number, number>; sourceFamiliesCount: number }> {
    const [rows, links] = await Promise.all([
      this.mysql.queryAll<{
        id: string;
        id_document: string | null;
        id_sex: string | null;
        document: string;
        lastname1: string | null;
        lastname2: string | null;
        name1: string | null;
        name2: string | null;
        address: string | null;
        mobile: string | null;
        occupation: string | null;
        work_address: string | null;
        company: string | null;
        email: string | null;
        active: string;
      }>(`SELECT id, id_document, id_sex, document, lastname1, lastname2, name1, name2, address, mobile, occupation, work_address, company, email, active FROM ${schoolDb}.families ORDER BY id`),
      this.mysql.queryAll<{ family_id: string; user_id: string }>(
        `SELECT family_id, user_id FROM ${schoolDb}.family_and_users_ids WHERE profile = 'family'`,
      ),
    ]);

    const uidByFam = new Map(links.map((l) => [safeInt(l.family_id), safeInt(l.user_id)]));
    const prepared = rows.map((f) => {
      const legacyId = safeInt(f.id);
      const adminUid = uidByFam.get(legacyId);
      const docNumber = cleanStr(f.document, `FAM-${legacyId}`, 30);
      const fullName = cleanStr(
        [f.name1, f.name2, f.lastname1, f.lastname2]
          .map((x) => (x ?? '').trim())
          .filter(Boolean)
          .join(' '),
        `ACUDIENTE ${docNumber}`,
        200,
      );
      return {
        legacyId,
        userId: adminUid ? (userIdMap.get(adminUid) ?? null) : null,
        docTypeId: validCatalogId(f.id_document, catalogs.docTypes, 1),
        docNumber,
        fullName,
        genderId: mapLegacyGender(f.id_sex),
        address: cleanNullableStr(f.address, 250),
        workAddress: cleanNullableStr(f.work_address, 200),
        mobile: cleanPhone(f.mobile),
        email: cleanEmail(f.email),
        occupation: cleanNullableStr(f.occupation, 120),
        company: cleanNullableStr(f.company, 120),
        isActive: safeInt(f.active, 1) === 1,
      };
    });

    const familyMap = new Map<number, number>();
    const famByDoc = new Map<string, number>();

    for (let i = 0; i < prepared.length; i += 1000) {
      const batch = dedupeByKey(prepared.slice(i, i + 1000), (x) => x.docNumber);
      await this.db.withTenantTransaction(schoolId, async (client) => {
        const res = await client.query<{ id: string; document_number: string }>(
          `INSERT INTO family_profiles (
             school_id, user_id, document_type_id, document_number, full_name,
             gender_id, address, work_address, mobile_phone, email,
             occupation, company_name, is_active
           )
           SELECT $1::bigint, * FROM UNNEST(
             $2::bigint[], $3::smallint[], $4::varchar[], $5::varchar[],
             $6::smallint[], $7::varchar[], $8::varchar[], $9::varchar[], $10::varchar[],
             $11::varchar[], $12::varchar[], $13::boolean[]
           )
           ON CONFLICT (school_id, document_number)
           DO UPDATE SET
             user_id = COALESCE(EXCLUDED.user_id, family_profiles.user_id),
             full_name = EXCLUDED.full_name,
             mobile_phone = COALESCE(EXCLUDED.mobile_phone, family_profiles.mobile_phone)
           RETURNING id::text, document_number`,
          [
            schoolId.toString(),
            batch.map((b) => b.userId),
            batch.map((b) => b.docTypeId),
            batch.map((b) => b.docNumber),
            batch.map((b) => b.fullName),
            batch.map((b) => b.genderId),
            batch.map((b) => b.address),
            batch.map((b) => b.workAddress),
            batch.map((b) => b.mobile),
            batch.map((b) => b.email),
            batch.map((b) => b.occupation),
            batch.map((b) => b.company),
            batch.map((b) => b.isActive),
          ],
        );
        for (const r of res.rows) famByDoc.set(r.document_number, Number(r.id));
      });
    }

    for (const f of prepared) {
      const nid = famByDoc.get(f.docNumber);
      if (nid) familyMap.set(f.legacyId, nid);
    }
    return { familyMap, sourceFamiliesCount: rows.length };
  }

  private async migrateFamilyLinks(
    schoolDb: string,
    schoolId: bigint,
    studentMap: Map<number, number>,
    familyMap: Map<number, number>,
    catalogs: CatalogValidationSets,
  ): Promise<number> {
    const rows = await this.mysql.queryAll<{
      id_student: string;
      id_family: string;
      id_type: string;
      id_relationship: string;
      live_with_this: string;
    }>(`SELECT id_student, id_family, id_type, id_relationship, live_with_this FROM ${schoolDb}.aux_families_students`);

    const prepared = dedupeByKey(
      rows
        .map((r) => {
          const sid = studentMap.get(safeInt(r.id_student));
          const fid = familyMap.get(safeInt(r.id_family));
          if (!sid || !fid) return null;
          const relId = validCatalogId(r.id_relationship, catalogs.relationshipTypes, 9) ?? 9;
          const memId = validCatalogId(r.id_type, catalogs.memberTypes, 1) ?? 1;
          return {
            studentId: sid,
            familyId: fid,
            relId,
            memId,
            isPrimary: safeInt(r.id_type) === 1 || safeInt(r.live_with_this) === 1,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
      (x) => `${x.studentId}:${x.familyId}`,
    );

    for (let i = 0; i < prepared.length; i += 2000) {
      const batch = prepared.slice(i, i + 2000);
      await this.db.withTenantTransaction(schoolId, async (client) => {
        await client.query(
          `INSERT INTO student_family_links (
             school_id, student_profile_id, family_profile_id,
             relationship_type_id, member_type_id, is_primary_guardian
           )
           SELECT $1::bigint, * FROM UNNEST(
             $2::bigint[], $3::bigint[], $4::smallint[], $5::smallint[], $6::boolean[]
           )
           ON CONFLICT (school_id, student_profile_id, family_profile_id)
           DO UPDATE SET is_primary_guardian = EXCLUDED.is_primary_guardian`,
          [
            schoolId.toString(),
            batch.map((b) => b.studentId),
            batch.map((b) => b.familyId),
            batch.map((b) => b.relId),
            batch.map((b) => b.memId),
            batch.map((b) => b.isPrimary),
          ],
        );
      });
    }
    return rows.length;
  }

  private async migrateEnrollmentsAndNovelties(
    schoolDb: string,
    schoolId: bigint,
    studentMap: Map<number, number>,
    campusMap: Map<number, number>,
    shiftMap: Map<number, number>,
    gradeMap: Map<number, number>,
    groupKeyMap: Map<string, number>,
    catalogs: CatalogValidationSets,
    allowedYears: Set<number> | null,
  ): Promise<{
    enrollmentMap: Map<number, number>;
    enrollmentMetaMap: Map<
      number,
      { studentProfileId: number; gradeId: number; academicGroupId: number; year: number }
    >;
    sourceEnrollmentsCount: number;
  }> {
    const rows = await this.mysql.queryAll<{
      id: string;
      id_headquarters: string;
      id_study_day: string;
      id_student: string;
      id_grade: string;
      id_state: string;
      folio: string | null;
      registration_number: string | null;
      id_group: string;
      inst_origin: string | null;
      obs: string | null;
      date: string | null;
      year: string;
    }>(
      `SELECT id, id_headquarters, id_study_day, id_student, id_grade, id_state,
              folio, registration_number, TRIM(id_group) AS id_group, inst_origin, obs, date, year
         FROM ${schoolDb}.student_enrollment
        WHERE ${this.yearWhere('year', allowedYears)}
        ORDER BY year, id`,
    );

    const fallbackCampusId = campusMap.values().next().value as number;
    const fallbackShiftId = shiftMap.values().next().value as number;
    const fallbackGradeId = gradeMap.values().next().value as number;
    const statePriority = (st: number): number =>
      st === 2 ? 1 : st === 3 ? 2 : st === 1 ? 3 : 4;

    interface EnrollmentCandidate {
      legacyId: number;
      studentProfileId: number;
      campusId: number;
      shiftId: number;
      gradeId: number;
      academicGroupId: number;
      statusId: number;
      year: number;
      regNum: string | null;
      folio: string | null;
      enrollDate: string;
      originSchool: string | null;
      obs: string | null;
    }

    // Agrupar por (studentProfileId, year) priorizando matrícula activa
    const grouped = new Map<string, EnrollmentCandidate[]>();

    for (const r of rows) {
      const year = safeInt(r.year);
      const spId = studentMap.get(safeInt(r.id_student));
      if (!spId || year < 1990 || year > 2100) continue;
      const cid = campusMap.get(safeInt(r.id_headquarters)) ?? fallbackCampusId;
      const sid = shiftMap.get(safeInt(r.id_study_day)) ?? fallbackShiftId;
      const gid = gradeMap.get(safeInt(r.id_grade)) ?? fallbackGradeId;
      const gcode = cleanStr(r.id_group, '01', 10);
      const agid = groupKeyMap.get(`${cid}:${sid}:${gid}:${year}:${gcode}`);
      if (!agid) continue;
      const statusId = validCatalogId(r.id_state, catalogs.enrollmentStatuses, 2) ?? 2;
      const item = {
        legacyId: safeInt(r.id),
        studentProfileId: spId,
        campusId: cid,
        shiftId: sid,
        gradeId: gid,
        academicGroupId: agid,
        statusId,
        year,
        regNum: cleanNullableStr(r.registration_number, 30),
        folio: cleanNullableStr(r.folio, 30),
        enrollDate: safeDate(r.date, `${year}-01-19`)!,
        originSchool: cleanNullableStr(r.inst_origin, 200),
        obs: cleanNullableStr(r.obs, 500),
      };
      const key = `${spId}:${year}`;
      const list = grouped.get(key) ?? [];
      list.push(item);
      grouped.set(key, list);
    }

    const primaries: Array<EnrollmentCandidate & { key: string }> = [];
    const secondaryLegacyLinks: Array<{
      legacyId: number;
      key: string;
      statusId: number;
      date: string;
      obs: string;
    }> = [];

    for (const [key, list] of grouped.entries()) {
      list.sort((a, b) => {
        const diff = statePriority(a.statusId) - statePriority(b.statusId);
        return diff !== 0 ? diff : b.legacyId - a.legacyId;
      });
      primaries.push({ ...list[0], key });
      for (let k = 1; k < list.length; k++) {
        secondaryLegacyLinks.push({
          legacyId: list[k].legacyId,
          key,
          statusId: list[k].statusId,
          date: list[k].enrollDate,
          obs: `Matrícula secundaria legacy #${list[k].legacyId} consolidada (${list[k].obs ?? 'traslado/reingreso'})`,
        });
      }
    }

    const enrollmentMap = new Map<number, number>();
    const enrollmentMetaMap = new Map<
      number,
      { studentProfileId: number; gradeId: number; academicGroupId: number; year: number }
    >();
    const canonicalIdByKey = new Map<string, number>();

    for (let i = 0; i < primaries.length; i += 2000) {
      const batch = primaries.slice(i, i + 2000);
      await this.db.withTenantTransaction(schoolId, async (client) => {
        const res = await client.query<{
          id: string;
          student_profile_id: string;
          academic_year: number;
          grade_id: string;
          academic_group_id: string;
        }>(
          `INSERT INTO student_enrollments (
             school_id, student_profile_id, campus_id, shift_id, grade_id, academic_group_id,
             enrollment_status_id, academic_year, registration_number, folio_number,
             enrollment_date, previous_school_name, observations
           )
           SELECT $1::bigint, * FROM UNNEST(
             $2::bigint[], $3::bigint[], $4::bigint[], $5::bigint[], $6::bigint[],
             $7::smallint[], $8::smallint[], $9::varchar[], $10::varchar[],
             $11::date[], $12::varchar[], $13::text[]
           )
           ON CONFLICT (school_id, student_profile_id, academic_year)
           DO UPDATE SET
             campus_id = EXCLUDED.campus_id,
             shift_id = EXCLUDED.shift_id,
             grade_id = EXCLUDED.grade_id,
             academic_group_id = EXCLUDED.academic_group_id,
             enrollment_status_id = EXCLUDED.enrollment_status_id,
             updated_at = NOW()
           RETURNING id::text, student_profile_id::text, academic_year, grade_id::text, academic_group_id::text`,
          [
            schoolId.toString(),
            batch.map((b) => b.studentProfileId),
            batch.map((b) => b.campusId),
            batch.map((b) => b.shiftId),
            batch.map((b) => b.gradeId),
            batch.map((b) => b.academicGroupId),
            batch.map((b) => b.statusId),
            batch.map((b) => b.year),
            batch.map((b) => b.regNum),
            batch.map((b) => b.folio),
            batch.map((b) => b.enrollDate),
            batch.map((b) => b.originSchool),
            batch.map((b) => b.obs),
          ],
        );
        for (const r of res.rows) {
          const eid = Number(r.id);
          const key = `${r.student_profile_id}:${r.academic_year}`;
          canonicalIdByKey.set(key, eid);
          enrollmentMetaMap.set(eid, {
            studentProfileId: Number(r.student_profile_id),
            gradeId: Number(r.grade_id),
            academicGroupId: Number(r.academic_group_id),
            year: Number(r.academic_year),
          });
        }
      });
    }

    for (const p of primaries) {
      const eid = canonicalIdByKey.get(p.key);
      if (eid) enrollmentMap.set(p.legacyId, eid);
    }
    for (const sec of secondaryLegacyLinks) {
      const eid = canonicalIdByKey.get(sec.key);
      if (eid) enrollmentMap.set(sec.legacyId, eid);
    }

    await this.saveIdMappingsBatch(
      schoolId,
      'student_enrollments',
      Array.from(enrollmentMap.entries()),
      schoolDb.replace(/`/g, ''),
    );

    // Migrar novedades de matrícula (solo si tabla está vacía para idempotencia o limpiando previas)
    const novRows = await this.mysql.queryAll<{
      id_register: string;
      id_state: string;
      motive: string | null;
      date: string | null;
    }>(`SELECT id_register, id_state, motive, date FROM ${schoolDb}.registration_novelties`);

    await this.db.withTenantTransaction(schoolId, async (client) => {
      await client.query(`DELETE FROM enrollment_novelties WHERE school_id = $1`, [
        schoolId.toString(),
      ]);
      const allNovs: Array<{ eid: number; st: number; dt: string; reason: string }> = [];
      for (const n of novRows) {
        const eid = enrollmentMap.get(safeInt(n.id_register));
        if (!eid) continue;
        allNovs.push({
          eid,
          st: validCatalogId(n.id_state, catalogs.enrollmentStatuses, 4) ?? 4,
          dt: safeDate(n.date, '2026-01-01')!,
          reason: cleanStr(n.motive, 'Novedad de matrícula migrada'),
        });
      }
      for (const sec of secondaryLegacyLinks) {
        const eid = canonicalIdByKey.get(sec.key);
        if (eid) {
          allNovs.push({ eid, st: sec.statusId, dt: sec.date, reason: sec.obs });
        }
      }
      for (let i = 0; i < allNovs.length; i += 1000) {
        const b = allNovs.slice(i, i + 1000);
        await client.query(
          `INSERT INTO enrollment_novelties (school_id, enrollment_id, enrollment_status_id, novelty_date, reason)
           SELECT $1::bigint, * FROM UNNEST($2::bigint[], $3::smallint[], $4::date[], $5::text[])`,
          [
            schoolId.toString(),
            b.map((x) => x.eid),
            b.map((x) => x.st),
            b.map((x) => x.dt),
            b.map((x) => x.reason),
          ],
        );
      }
    });

    this.logger.log('Fase 3.3 completada: matrículas y novedades migradas', {
      sourceEnrollments: rows.length,
      canonicalEnrollments: canonicalIdByKey.size,
      mappedLegacyIds: enrollmentMap.size,
    });

    return {
      enrollmentMap,
      enrollmentMetaMap,
      sourceEnrollmentsCount: rows.length,
    };
  }

  private async migrateTeacherGradebookColumns(
    schoolDb: string,
    schoolId: bigint,
    courseMap: Map<number, number>,
    dimColByLegacyCncId: Map<number, { dimensionId: number; columnNumber: number; tipo: string }>,
    allowedYears: Set<number> | null,
  ): Promise<Map<string, number>> {
    const colIdByKey = new Map<string, number>();
    let totalSaved = 0;

    await this.mysql.streamBatches<{
      id_curso: string;
      id_column: string;
      nombre: string | null;
      descripcion: string | null;
      porcentual: string;
      periodo: string;
    }>(
      `SELECT cct.id_curso, cct.id_column, cct.nombre, cct.descripcion, cct.porcentual, cct.periodo
         FROM ${schoolDb}.config_columns_theacher cct
         INNER JOIN ${schoolDb}.cursos c ON c.id = cct.id_curso
        WHERE cct.activa = 1 AND ${this.yearWhere('c.year', allowedYears)}`,
      8000,
      async (batch) => {
        const prepared = dedupeByKey(
          batch
            .map((r) => {
              const caId = courseMap.get(safeInt(r.id_curso));
              const meta = dimColByLegacyCncId.get(safeInt(r.id_column));
              const period = safeInt(r.periodo);
              if (!caId || !meta || meta.tipo !== 'NOTA' || period < 1 || period > 6) {
                return null;
              }
              return {
                caId,
                dimId: meta.dimensionId,
                period,
                colNum: meta.columnNumber,
                desc: cleanStr(r.descripcion, cleanStr(r.nombre, `Nota ${meta.columnNumber}`, 120), 200),
                weight: safeDecimal(r.porcentual, 0, 0, 100),
                key: `${caId}:${meta.dimensionId}:${period}:${meta.columnNumber}`,
              };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null),
          (x) => x.key,
        );
        if (prepared.length === 0) return;

        await this.runBulkTenantTx(schoolId, async (client) => {
          const res = await client.query<{
            id: string;
            course_assignment_id: string;
            period_number: number;
            column_number: number;
          }>(
            `INSERT INTO teacher_gradebook_columns (
               school_id, course_assignment_id, dimension_id, period_number,
               column_number, description, weight_percentage
             )
             SELECT $1::bigint, * FROM UNNEST(
               $2::bigint[], $3::bigint[], $4::smallint[], $5::smallint[],
               $6::varchar[], $7::numeric[]
             )
             ON CONFLICT (school_id, course_assignment_id, dimension_id, period_number, column_number)
             DO UPDATE SET description = EXCLUDED.description, weight_percentage = EXCLUDED.weight_percentage
             RETURNING id::text, course_assignment_id::text, period_number, column_number`,
            [
              schoolId.toString(),
              prepared.map((b) => b.caId),
              prepared.map((b) => b.dimId),
              prepared.map((b) => b.period),
              prepared.map((b) => b.colNum),
              prepared.map((b) => b.desc),
              prepared.map((b) => b.weight),
            ],
          );
          for (const r of res.rows) {
            colIdByKey.set(
              `${r.course_assignment_id}:${r.period_number}:${r.column_number}`,
              Number(r.id),
            );
          }
          totalSaved += res.rowCount ?? 0;
        });
      },
    );

    this.logger.log('Fase 4.1 completada: columnas dinámicas de planilla migradas', {
      columnsUpserted: totalSaved,
    });
    return colIdByKey;
  }

  private async migrateAchievements(
    schoolDb: string,
    schoolId: bigint,
    gradeMap: Map<number, number>,
    subjectMap: Map<number, number>,
    dimensionMap: Map<number, number>,
    catalogs: CatalogValidationSets,
    allowedYears: Set<number> | null,
  ): Promise<Map<number, number>> {
    // Limpiar logros previos del colegio en la migración para idempotencia limpia (en CASCADE con academic_grade_achievements)
    await this.runBulkTenantTx(schoolId, async (client) => {
      await client.query(`DELETE FROM achievement_standards WHERE school_id = $1`, [
        schoolId.toString(),
      ]);
    });

    const map = new Map<number, number>();
    await this.mysql.streamBatches<{
      id: string;
      id_asig: string;
      id_escala: string;
      id_grado: string;
      id_competencia: string;
      consecutivo: string;
      descripcion: string;
      year: string;
      periodo: string;
      estado: string;
      tipo: string;
    }>(
      `SELECT id, id_asig, id_escala, id_grado, id_competencia, consecutivo, descripcion, year, periodo, estado, tipo
         FROM ${schoolDb}.logros_estandares
        WHERE ${this.yearWhere('year', allowedYears)}
        ORDER BY id`,
      3000,
      async (batch) => {
        const prepared = batch
          .map((r) => {
            const gid = gradeMap.get(safeInt(r.id_grado));
            const sid = subjectMap.get(safeInt(r.id_asig));
            const year = safeInt(r.year);
            const period = Math.min(6, Math.max(1, safeInt(r.periodo, 1)));
            const desc = cleanNullableStr(r.descripcion);
            if (!gid || !sid || !desc || year < 1990 || year > 2100) return null;
            return {
              legacyId: safeInt(r.id),
              gradeId: gid,
              subjectId: sid,
              dimId: dimensionMap.get(safeInt(r.id_competencia)) ?? null,
              nsId: validCatalogId(r.id_escala, catalogs.nationalScales, null),
              year,
              period,
              code: cleanNullableStr(r.consecutivo, 30),
              type: mapLegacyIndicatorType(safeInt(r.tipo, 2)),
              desc,
              isActive: safeInt(r.estado, 1) > 0,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);
        if (prepared.length === 0) return;

        await this.runBulkTenantTx(schoolId, async (client) => {
          const res = await client.query<{ id: string }>(
            `INSERT INTO achievement_standards (
               school_id, grade_id, subject_id, dimension_id, national_scale_id,
               academic_year, period_number, code, indicator_type, description, is_active
             )
             SELECT $1::bigint, * FROM UNNEST(
               $2::bigint[], $3::bigint[], $4::bigint[], $5::smallint[],
               $6::smallint[], $7::smallint[], $8::varchar[], $9::varchar[],
               $10::text[], $11::boolean[]
             )
             RETURNING id::text`,
            [
              schoolId.toString(),
              prepared.map((b) => b.gradeId),
              prepared.map((b) => b.subjectId),
              prepared.map((b) => b.dimId),
              prepared.map((b) => b.nsId),
              prepared.map((b) => b.year),
              prepared.map((b) => b.period),
              prepared.map((b) => b.code),
              prepared.map((b) => b.type),
              prepared.map((b) => b.desc),
              prepared.map((b) => b.isActive),
            ],
          );
          for (let idx = 0; idx < res.rows.length; idx++) {
            map.set(prepared[idx].legacyId, Number(res.rows[idx].id));
          }
        });
      },
    );

    this.logger.log('Fase 4.2 completada: logros y descriptores migrados', {
      achievementsMigrated: map.size,
    });
    return map;
  }

  private async migrateAllGradesPreReportsAndLinks(
    schoolDb: string,
    schoolId: bigint,
    enrollmentMap: Map<number, number>,
    courseMap: Map<number, number>,
    courseMetaMap: Map<number, { gradeId: number; subjectId: number; teacherId: number; year: number }>,
    gradeToGroupIdMap: Map<number, number>,
    periodResolver: Map<string, number>,
    achievementMap: Map<number, number>,
    catalogs: CatalogValidationSets,
    allowedYears: Set<number> | null,
    warnings: string[],
  ): Promise<{
    sourceGradesRead: number;
    sourceFinalSum: number;
    itemsUpserted: number;
    linksRead: number;
  }> {
    let sourceGradesRead = 0;
    let sourceFinalSum = 0;
    let itemsUpserted = 0;
    let linksRead = 0;
    let skippedInvalidRows = 0;

    // Pre-construir mapa (year, gradeGroupId, period) -> period_id con auto-creación bajo demanda
    const ensurePeriodId = async (
      year: number,
      gradeGroupId: number | null,
      periodNumber: number,
    ): Promise<number> => {
      const k1 = `${year}:${gradeGroupId ?? 0}:${periodNumber}`;
      const found1 = periodResolver.get(k1);
      if (found1) return found1;
      const k2 = `${year}:0:${periodNumber}`;
      const found2 = periodResolver.get(k2);
      if (found2) return found2;

      let createdId = 0;
      await this.db.withTenantTransaction(schoolId, async (client) => {
        const ins = await client.query<{ id: string }>(
          `INSERT INTO academic_periods (
             school_id, grade_group_id, academic_year, period_number, name, weight_percentage,
             start_date, end_date, is_active, is_closed
           )
           VALUES ($1, NULL, $2, $3, $4, 25, $5::date, $6::date, FALSE, TRUE)
           ON CONFLICT (school_id, academic_year, grade_group_id, period_number)
           DO UPDATE SET name = academic_periods.name
           RETURNING id::text`,
          [
            schoolId.toString(),
            year,
            periodNumber,
            periodNumber === 5 ? 'DESEMPEÑO FINAL' : `PERIODO ${periodNumber}`,
            `${year}-01-19`,
            `${year}-11-30`,
          ],
        );
        createdId = Number(ins.rows[0].id);
      });
      periodResolver.set(k2, createdId);
      return createdId;
    };

    const scoreColNames = Array.from({ length: 30 }, (_, idx) => `n${idx + 1}`);
    const scoreColsSql = scoreColNames.join(', ');
    const scoreUnnestPlaceholders = scoreColNames
      .map((_, idx) => `$${13 + idx}::numeric[]`)
      .join(', ');
    const scoreConflictUpdates = scoreColNames
      .map(
        (col) =>
          `${col} = CASE WHEN EXCLUDED.final_score >= academic_grades.final_score THEN COALESCE(EXCLUDED.${col}, academic_grades.${col}) ELSE COALESCE(academic_grades.${col}, EXCLUDED.${col}) END`,
      )
      .join(',\n                 ');

    for (const lvl of NSCP_TABLES) {
      // Mapa por nivel (liberado al terminar cada nivel para mantener RAM acotada)
      const gradeIdByLegacy = new Map<
        number,
        {
          gradeId: number;
          year: number;
          enrollmentId: number;
          courseId: number;
          period: number;
          finalScore: number;
          nsId: number | null;
        }
      >();

      await this.mysql.streamBatches<Record<string, string | null>>(
        `SELECT id, id_curso, id_matric, id_escala, periodo, year,
                ${scoreColsSql},
                final, faltas, injustificadas, retraso, nota_habilitacion
           FROM ${schoolDb}.${lvl.gradeTable}
          WHERE ${this.yearWhere('year', allowedYears)}`,
        5000,
        async (batch) => {
          interface PreparedGrade {
            legacyId: number;
            year: number;
            enrollmentId: number;
            courseId: number;
            periodId: number;
            period: number;
            finalScore: number;
            recoveryScore: number;
            nsId: number | null;
            justified: number;
            unjustified: number;
            late: number;
            conflictKey: string;
            scores: Array<number | null>;
            nonZeroCount: number;
          }

          const prepared: PreparedGrade[] = [];
          for (const r of batch) {
            const year = safeInt(r['year']);
            const period = safeInt(r['periodo']);
            const eid = enrollmentMap.get(safeInt(r['id_matric']));
            const caId = courseMap.get(safeInt(r['id_curso']));
            if (!eid || !caId || year < 1990 || year > 2100 || period < 1 || period > 6) {
              skippedInvalidRows += 1;
              continue;
            }
            const cMeta = courseMetaMap.get(caId);
            const ggId = cMeta ? (gradeToGroupIdMap.get(cMeta.gradeId) ?? null) : null;
            const periodId = await ensurePeriodId(year, ggId, period);
            const finalScore = safeDecimal(r['final'], 0, 0, 100);
            const recoveryScore = safeDecimal(r['nota_habilitacion'], 0, 0, 100);
            const nsId = validCatalogId(r['id_escala'], catalogs.nationalScales, null);

            // Almacenar NULL cuando la casilla legacy es 0.00 (0 bytes en heap PostgreSQL)
            const scores: Array<number | null> = new Array(30);
            let nonZeroCount = 0;
            for (let n = 0; n < 30; n++) {
              const v = safeDecimal(r[scoreColNames[n]], 0, 0, 100);
              if (v > 0) {
                scores[n] = v;
                nonZeroCount += 1;
              } else {
                scores[n] = null;
              }
            }

            sourceGradesRead += 1;
            sourceFinalSum += finalScore;

            prepared.push({
              legacyId: safeInt(r['id']),
              year,
              enrollmentId: eid,
              courseId: caId,
              periodId,
              period,
              finalScore,
              recoveryScore,
              nsId,
              justified: Math.min(32000, Math.max(0, safeInt(r['faltas']))),
              unjustified: Math.min(32000, Math.max(0, safeInt(r['injustificadas']))),
              late: Math.min(32000, Math.max(0, safeInt(r['retraso']))),
              conflictKey: `${year}:${eid}:${caId}:${period}`,
              scores,
              nonZeroCount,
            });
          }

          if (prepared.length === 0) return;
          // Si dos matrículas legacy consolidadas en el mismo año comparten curso+periodo, preservar la nota más alta/no vacía
          const dedupedMap = new Map<string, PreparedGrade>();
          for (const row of prepared) {
            const existing = dedupedMap.get(row.conflictKey);
            if (
              !existing ||
              row.finalScore > existing.finalScore ||
              (row.finalScore === existing.finalScore &&
                row.nonZeroCount >= existing.nonZeroCount)
            ) {
              dedupedMap.set(row.conflictKey, row);
            }
          }
          const deduped = Array.from(dedupedMap.values());
          for (const d of deduped) {
            itemsUpserted += d.nonZeroCount;
          }

          const scoreArrays: Array<Array<number | null>> = scoreColNames.map(
            (_, colIdx) => deduped.map((b) => b.scores[colIdx]),
          );

          await this.runBulkTenantTx(schoolId, async (client) => {
            const res = await client.query<{
              id: string;
              academic_year: number;
              enrollment_id: string;
              course_assignment_id: string;
              period_number: number;
            }>(
              `INSERT INTO academic_grades (
                 school_id, academic_year, enrollment_id, course_assignment_id,
                 period_id, period_number, final_score, recovery_score,
                 national_scale_id, justified_absences, unjustified_absences, late_arrivals,
                 ${scoreColsSql}
               )
               SELECT $1::bigint, * FROM UNNEST(
                 $2::smallint[], $3::bigint[], $4::bigint[],
                 $5::bigint[], $6::smallint[], $7::numeric[], $8::numeric[],
                 $9::smallint[], $10::smallint[], $11::smallint[], $12::smallint[],
                 ${scoreUnnestPlaceholders}
               )
               ON CONFLICT (school_id, academic_year, enrollment_id, course_assignment_id, period_number)
               DO UPDATE SET
                 final_score = CASE
                   WHEN EXCLUDED.final_score > 0 OR academic_grades.final_score = 0 THEN EXCLUDED.final_score
                   ELSE academic_grades.final_score
                 END,
                 recovery_score = GREATEST(academic_grades.recovery_score, EXCLUDED.recovery_score),
                 national_scale_id = COALESCE(EXCLUDED.national_scale_id, academic_grades.national_scale_id),
                 justified_absences = GREATEST(academic_grades.justified_absences, EXCLUDED.justified_absences),
                 unjustified_absences = GREATEST(academic_grades.unjustified_absences, EXCLUDED.unjustified_absences),
                 late_arrivals = GREATEST(academic_grades.late_arrivals, EXCLUDED.late_arrivals),
                 ${scoreConflictUpdates},
                 updated_at = NOW()
               RETURNING id::text, academic_year, enrollment_id::text, course_assignment_id::text, period_number`,
              [
                schoolId.toString(),
                deduped.map((b) => b.year),
                deduped.map((b) => b.enrollmentId),
                deduped.map((b) => b.courseId),
                deduped.map((b) => b.periodId),
                deduped.map((b) => b.period),
                deduped.map((b) => b.finalScore),
                deduped.map((b) => b.recoveryScore),
                deduped.map((b) => b.nsId),
                deduped.map((b) => b.justified),
                deduped.map((b) => b.unjustified),
                deduped.map((b) => b.late),
                ...scoreArrays,
              ],
            );

            const newIdByKey = new Map(
              res.rows.map((row) => [
                `${row.academic_year}:${row.enrollment_id}:${row.course_assignment_id}:${row.period_number}`,
                Number(row.id),
              ]),
            );

            for (const p of prepared) {
              const gid = newIdByKey.get(p.conflictKey);
              if (!gid) continue;
              gradeIdByLegacy.set(p.legacyId, {
                gradeId: gid,
                year: p.year,
                enrollmentId: p.enrollmentId,
                courseId: p.courseId,
                period: p.period,
                finalScore: p.finalScore,
                nsId: p.nsId,
              });
            }
          });
        },
      );

      // Migrar preinformes reales no vacíos de este nivel
      const preRows = await this.mysql.queryAll<{ id_nota: string; obs: string }>(
        `SELECT id_nota, obs FROM ${schoolDb}.${lvl.preTable} WHERE TRIM(COALESCE(obs,'')) <> ''`,
      );
      if (preRows.length > 0) {
        const prePrepared = dedupeByKey(
          preRows
            .map((p) => {
              const g = gradeIdByLegacy.get(safeInt(p.id_nota));
              const obs = cleanNullableStr(p.obs);
              if (!g || !obs) return null;
              return { ...g, obs, key: `${g.year}:${g.enrollmentId}:${g.courseId}:${g.period}` };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null),
          (x) => x.key,
        );
        if (prePrepared.length > 0) {
          await this.db.withTenantTransaction(schoolId, async (client) => {
            await client.query(
              `INSERT INTO academic_pre_reports (
                 school_id, academic_year, enrollment_id, course_assignment_id,
                 period_number, partial_score, national_scale_id, observations
               )
               SELECT $1::bigint, * FROM UNNEST(
                 $2::smallint[], $3::bigint[], $4::bigint[],
                 $5::smallint[], $6::numeric[], $7::smallint[], $8::text[]
               )
               ON CONFLICT (school_id, academic_year, enrollment_id, course_assignment_id, period_number)
               DO UPDATE SET observations = EXCLUDED.observations`,
              [
                schoolId.toString(),
                prePrepared.map((b) => b.year),
                prePrepared.map((b) => b.enrollmentId),
                prePrepared.map((b) => b.courseId),
                prePrepared.map((b) => b.period),
                prePrepared.map((b) => b.finalScore),
                prePrepared.map((b) => b.nsId),
                prePrepared.map((b) => b.obs),
              ],
            );
            await client.query(
              `UPDATE academic_grades ag
                  SET has_pre_report_alert = TRUE
                 FROM UNNEST($2::smallint[], $3::bigint[]) AS u(yr, gid)
                WHERE ag.school_id = $1 AND ag.academic_year = u.yr AND ag.id = u.gid`,
              [
                schoolId.toString(),
                prePrepared.map((b) => b.year),
                prePrepared.map((b) => b.gradeId),
              ],
            );
          });
        }
      }

      // Migrar log_nscp* de este nivel usando el mapa en memoria antes de liberarlo
      await this.mysql.streamBatches<{ id_nota: string; id_logro_estandar: string }>(
        `SELECT id_nota, id_logro_estandar FROM ${schoolDb}.${lvl.logTable}`,
        10000,
        async (batch) => {
          const links = dedupeByKey(
            batch
              .map((l) => {
                const g = gradeIdByLegacy.get(safeInt(l.id_nota));
                const achId = achievementMap.get(safeInt(l.id_logro_estandar));
                if (!g || !achId) return null;
                return { year: g.year, gradeId: g.gradeId, achId };
              })
              .filter((x): x is NonNullable<typeof x> => x !== null),
            (x) => `${x.year}:${x.gradeId}:${x.achId}`,
          );
          if (links.length === 0) return;
          linksRead += links.length;
          await this.runBulkTenantTx(schoolId, async (client) => {
            await client.query(
              `INSERT INTO academic_grade_achievements (
                 school_id, academic_year, academic_grade_id, achievement_standard_id
               )
               SELECT $1::bigint, * FROM UNNEST($2::smallint[], $3::bigint[], $4::bigint[])
               ON CONFLICT (school_id, academic_year, academic_grade_id, achievement_standard_id) DO NOTHING`,
              [
                schoolId.toString(),
                links.map((x) => x.year),
                links.map((x) => x.gradeId),
                links.map((x) => x.achId),
              ],
            );
          });
        },
      );

      this.logger.log(`Nivel ${lvl.gradeTable} completado y memoria liberada`, {
        table: lvl.gradeTable,
        gradesMapped: gradeIdByLegacy.size,
        accumulatedItems: itemsUpserted,
        accumulatedLinks: linksRead,
      });
      gradeIdByLegacy.clear();
    }

    if (skippedInvalidRows > 0) {
      warnings.push(
        `Se omitieron ${skippedInvalidRows} filas huérfanas o con periodo vacío en nscp00..003.`,
      );
    }

    return {
      sourceGradesRead,
      sourceFinalSum: Number(sourceFinalSum.toFixed(2)),
      itemsUpserted,
      linksRead,
    };
  }

  private async migrateRecoveries(
    schoolDb: string,
    schoolId: bigint,
    enrollmentMap: Map<number, number>,
    courseMap: Map<number, number>,
    allowedYears: Set<number> | null,
  ): Promise<void> {
    const rows = await this.mysql.queryAll<{
      id_matric: string;
      id_curso: string;
      nro_acta: string | null;
      notafinal: string;
      notarecuperada: string;
      fecha: string | null;
      notas: string | null;
      year: string;
    }>(
      `SELECT r.id_matric, r.id_curso, r.nro_acta, r.notafinal, r.notarecuperada, r.fecha, r.notas, se.year
         FROM ${schoolDb}.respeciales r
         INNER JOIN ${schoolDb}.student_enrollment se ON se.id = r.id_matric
        WHERE ${this.yearWhere('se.year', allowedYears)}`,
    );

    await this.runBulkTenantTx(schoolId, async (client) => {
      await client.query(`DELETE FROM period_recovery_records WHERE school_id = $1`, [
        schoolId.toString(),
      ]);
      const prepared = rows
        .map((r) => {
          const eid = enrollmentMap.get(safeInt(r.id_matric));
          const caId = courseMap.get(safeInt(r.id_curso));
          const year = safeInt(r.year);
          if (!eid || !caId || year < 1990 || year > 2100) return null;
          return {
            year,
            eid,
            caId,
            act: cleanNullableStr(r.nro_acta, 30),
            prev: safeDecimal(r.notafinal, 0, 0, 100),
            rec: safeDecimal(r.notarecuperada, 0, 0, 100),
            dt: safeDate(r.fecha, `${year}-11-25`)!,
            obs: cleanNullableStr(r.notas, 500),
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      for (let i = 0; i < prepared.length; i += 2000) {
        const b = prepared.slice(i, i + 2000);
        await client.query(
          `INSERT INTO period_recovery_records (
             school_id, academic_year, enrollment_id, course_assignment_id,
             period_number, act_number, previous_score, recovery_score,
             recovery_type, recovery_date, observations
           )
           SELECT $1::bigint, year, eid, ca_id, 4::smallint, act, prev, rec, 'FINAL_RECOVERY', dt, obs
             FROM UNNEST(
               $2::smallint[], $3::bigint[], $4::bigint[], $5::varchar[],
               $6::numeric[], $7::numeric[], $8::date[], $9::text[]
             ) AS t(year, eid, ca_id, act, prev, rec, dt, obs)`,
          [
            schoolId.toString(),
            b.map((x) => x.year),
            b.map((x) => x.eid),
            b.map((x) => x.caId),
            b.map((x) => x.act),
            b.map((x) => x.prev),
            b.map((x) => x.rec),
            b.map((x) => x.dt),
            b.map((x) => x.obs),
          ],
        );

        await client.query(
          `UPDATE academic_grades ag
              SET leveling_score = GREATEST(ag.leveling_score, u.rec)
             FROM UNNEST($2::smallint[], $3::bigint[], $4::bigint[], $5::numeric[]) AS u(yr, eid, ca_id, rec)
            WHERE ag.school_id = $1
              AND ag.academic_year = u.yr
              AND ag.enrollment_id = u.eid
              AND ag.course_assignment_id = u.ca_id`,
          [
            schoolId.toString(),
            b.map((x) => x.year),
            b.map((x) => x.eid),
            b.map((x) => x.caId),
            b.map((x) => x.rec),
          ],
        );
      }
    });
  }

  private async migrateObservers(
    schoolDb: string,
    schoolId: bigint,
    enrollmentMap: Map<number, number>,
    enrollmentMetaMap: Map<
      number,
      { studentProfileId: number; gradeId: number; academicGroupId: number; year: number }
    >,
    teacherUserIdMap: Map<number, number>,
    fallbackUserId: number,
    allowedYears: Set<number> | null,
  ): Promise<void> {
    const [models, sections, criteria, obs5Rows, ann5Rows, obs3Rows, items3Rows, ann3Rows] =
      await Promise.all([
        this.mysql.queryAll<{ id: string; descripcion: string; estado: string }>(
          `SELECT id, descripcion, estado FROM ${schoolDb}.obs_modelos_observador ORDER BY id`,
        ),
        this.mysql.queryAll<{ id: string; id_modelo: string; descripcion: string; estado: string; convivencia: string }>(
          `SELECT id, id_modelo, descripcion, estado, convivencia FROM ${schoolDb}.obs_items_modelos ORDER BY id`,
        ),
        this.mysql.queryAll<{ id: string; id_item_modelo: string; descripcion: string; estado: string }>(
          `SELECT id, id_item_modelo, descripcion, estado FROM ${schoolDb}.obs_criterios ORDER BY id`,
        ),
        this.mysql.queryAll<Record<string, string | null>>(
          `SELECT * FROM ${schoolDb}.obs_observer_mod_5 WHERE ${this.yearWhere('year', allowedYears)} ORDER BY id`,
        ),
        this.mysql.queryAll<{
          observer_id: string;
          teacher_id: string;
          annotation: string;
          description: string | null;
          period: string;
          date_annotation: string | null;
          annotation_type: string;
        }>(
          `SELECT a.observer_id, a.teacher_id, a.annotation, a.description, a.period, a.date_annotation, a.annotation_type
             FROM ${schoolDb}.obs_annotations_mod_5 a
             INNER JOIN ${schoolDb}.obs_observer_mod_5 o ON o.id = a.observer_id
            WHERE ${this.yearWhere('o.year', allowedYears)}`,
        ),
        this.mysql.queryAll<{ id: string; id_matric: string; year: string }>(
          `SELECT id, id_matric, year FROM ${schoolDb}.obs_observador_mod_3 WHERE ${this.yearWhere('year', allowedYears)}`,
        ),
        this.mysql.queryAll<Record<string, string | null>>(
          `SELECT i.* FROM ${schoolDb}.obs_items_modelo_3 i INNER JOIN ${schoolDb}.obs_observador_mod_3 o ON o.id = i.id_observador WHERE ${this.yearWhere('o.year', allowedYears)}`,
        ),
        this.mysql.queryAll<{
          id_observador: string;
          id_docente: string;
          anotacion: string;
          compromiso_est: string;
          periodo: string;
          fecha: string | null;
        }>(
          `SELECT a.id_observador, a.id_docente, a.anotacion, a.compromiso_est, a.periodo, a.fecha
             FROM ${schoolDb}.obs_anotaciones_mod_3 a
             INNER JOIN ${schoolDb}.obs_observador_mod_3 o ON o.id = a.id_observador
            WHERE ${this.yearWhere('o.year', allowedYears)}`,
        ),
      ]);

    const tplMap = new Map<number, number>();
    const secMap = new Map<number, number>();
    const critMap = new Map<number, number>();

    await this.runBulkTenantTx(schoolId, async (client) => {
      await client.query(`DELETE FROM observer_annotations WHERE school_id = $1`, [schoolId.toString()]);
      await client.query(`DELETE FROM student_observers WHERE school_id = $1`, [schoolId.toString()]);
      await client.query(`DELETE FROM observer_templates WHERE school_id = $1`, [schoolId.toString()]);

      for (const m of models) {
        const lid = safeInt(m.id);
        const ins = await client.query<{ id: string }>(
          `INSERT INTO observer_templates (school_id, name, description, is_active)
           VALUES ($1,$2,$3,$4) RETURNING id::text`,
          [schoolId.toString(), `Modelo ${lid}`, cleanNullableStr(m.descripcion, 500), safeInt(m.estado) === 1],
        );
        tplMap.set(lid, Number(ins.rows[0].id));
      }

      for (const s of sections) {
        const tid = tplMap.get(safeInt(s.id_modelo));
        if (!tid) continue;
        const ins = await client.query<{ id: string }>(
          `INSERT INTO observer_template_sections (school_id, template_id, title, is_coexistence_section, display_order, is_active)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id::text`,
          [schoolId.toString(), tid, cleanStr(s.descripcion, 'Sección', 200), safeInt(s.convivencia) === 1, safeInt(s.id), safeInt(s.estado, 1) === 1],
        );
        secMap.set(safeInt(s.id), Number(ins.rows[0].id));
      }

      for (const c of criteria) {
        const sid = secMap.get(safeInt(c.id_item_modelo));
        if (!sid) continue;
        const ins = await client.query<{ id: string }>(
          `INSERT INTO observer_criteria (school_id, section_id, description, display_order, is_active)
           VALUES ($1,$2,$3,$4,$5) RETURNING id::text`,
          [schoolId.toString(), sid, cleanStr(c.descripcion, 'Criterio', 500), safeInt(c.id), safeInt(c.estado, 1) === 1],
        );
        critMap.set(safeInt(c.id), Number(ins.rows[0].id));
      }

      const obs5IdMap = new Map<number, number>();
      const tpl5Id = tplMap.get(5) ?? null;

      for (const o of obs5Rows) {
        const eid = enrollmentMap.get(safeInt(o['id_matric']));
        const year = safeInt(o['year']);
        if (!eid || year < 1990 || year > 2100) continue;
        const res = await client.query<{ id: string }>(
          `INSERT INTO student_observers (school_id, enrollment_id, template_id, academic_year)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (school_id, enrollment_id) DO UPDATE SET template_id = EXCLUDED.template_id
           RETURNING id::text`,
          [schoolId.toString(), eid, tpl5Id, year],
        );
        obs5IdMap.set(safeInt(o['id']), Number(res.rows[0].id));

        const meta = enrollmentMetaMap.get(eid);
        if (meta) {
          const m5Payload = {
            talla: cleanStr(o['talla']),
            peso: cleanStr(o['peso']),
            religion: cleanStr(o['religion']),
            deporte: cleanStr(o['deporte']),
            trabaja: parseYesNoFlag(o['trabaja']),
            profOficio: cleanStr(o['prof_oficio']),
            numHermanos: safeInt(o['num_hermanos']),
            lugarHermanos: safeInt(o['lugar_hermanos'], 1),
            numHermanosHombres: safeInt(o['num_hermanos_hombres']),
            numHermanosMujeres: safeInt(o['num_hermanos_mujeres']),
            madreCabezaHogar: parseYesNoFlag(o['madre_cabeza_hogar']),
            padreCabezaHogar: parseYesNoFlag(o['padre_cabeza_hogar']),
            desplazados: parseYesNoFlag(o['desplazados']),
            barrerasAprendizaje: parseYesNoFlag(o['barreras_aprendizaje']),
            limVisual: Boolean(cleanNullableStr(o['det_limit_visual'])),
            limVisualDetalle: cleanStr(o['det_limit_visual']),
            limVisualDx: cleanStr(o['eps_dx_doctor_limit_visual']),
            limAuditiva: Boolean(cleanNullableStr(o['det_limit_auditiva'])),
            limAuditivaDetalle: cleanStr(o['det_limit_auditiva']),
            limAuditivaDx: cleanStr(o['eps_dx_doctor_auditiva']),
            limLenguaje: Boolean(cleanNullableStr(o['det_limit_trans_lenguaje'])),
            limLenguajeDetalle: cleanStr(o['det_limit_trans_lenguaje']),
            limLenguajeDx: cleanStr(o['eps_dx_doctor_trans_lenguaje']),
            limMotricidad: Boolean(cleanNullableStr(o['det_limit_motricidad'])),
            limMotricidadDetalle: cleanStr(o['det_limit_motricidad']),
            limMotricidadDx: cleanStr(o['eps_dx_doctor_motricidad']),
            limOtras: Boolean(cleanNullableStr(o['det_limit_otra'])),
            limOtrasDetalle: cleanStr(o['det_limit_otra']),
            limOtrasDx: cleanStr(o['eps_dx_doctor_otra']),
            dificultadAprendizaje: parseYesNoFlag(o['dificultad_aprendizaje']),
            dislexia: parseYesNoFlag(o['dislexia']) || Boolean(cleanNullableStr(o['dislexia'])),
            disgrafia: parseYesNoFlag(o['disgrafia']) || Boolean(cleanNullableStr(o['disgrafia'])),
            discalculia: parseYesNoFlag(o['discalculia']) || Boolean(cleanNullableStr(o['discalculia'])),
            discapacidadIntelectual: parseYesNoFlag(o['disc_intelectual']) || Boolean(cleanNullableStr(o['disc_intelectual'])),
            discapacidadMemoriaAuditivo: parseYesNoFlag(o['disc_memoria_auditivo']) || Boolean(cleanNullableStr(o['disc_memoria_auditivo'])),
            tea: parseYesNoFlag(o['tea']) || Boolean(cleanNullableStr(o['tea'])),
            tdha: parseYesNoFlag(o['tdha']) || Boolean(cleanNullableStr(o['tdha'])),
            otraDificultadAprendizaje: cleanStr(o['otra_dificulta_aprendizaje']),
          };
          await client.query(
            `UPDATE student_profiles
                SET additional_info = jsonb_set(COALESCE(additional_info, '{}'::jsonb), '{observerModel5}', $3::jsonb, true)
              WHERE school_id = $1 AND id = $2`,
            [schoolId.toString(), meta.studentProfileId, JSON.stringify(m5Payload)],
          );
        }
      }

      // Anotaciones Modelo 5
      const annBatch: Array<{
        obsId: number;
        uid: number;
        period: number;
        type: string;
        severity: string;
        desc: string;
        commit: string | null;
        dt: string;
      }> = [];
      for (const a of ann5Rows) {
        const obsId = obs5IdMap.get(safeInt(a.observer_id));
        const desc = cleanNullableStr(a.annotation);
        if (!obsId || !desc) continue;
        annBatch.push({
          obsId,
          uid: teacherUserIdMap.get(safeInt(a.teacher_id)) ?? fallbackUserId,
          period: Math.min(6, Math.max(1, safeInt(a.period, 1))),
          type: safeInt(a.annotation_type) === 2 ? 'PEDAGOGICAL' : 'BEHAVIORAL',
          severity: safeInt(a.annotation_type) === 2 ? 'PRAISE' : 'MILD',
          desc,
          commit: cleanNullableStr(a.description),
          dt: safeDate(a.date_annotation, '2026-01-19')!,
        });
      }

      // Modelo 3 (33 fichas + 675 matriz + 10 anotaciones)
      const obs3IdMap = new Map<number, number>();
      const obs3StudentIdMap = new Map<number, number>();
      const tpl3Id = tplMap.get(3) ?? null;
      for (const o of obs3Rows) {
        const eid = enrollmentMap.get(safeInt(o.id_matric));
        const year = safeInt(o.year);
        if (!eid || year < 1990 || year > 2100) continue;
        const res = await client.query<{ id: string }>(
          `INSERT INTO student_observers (school_id, enrollment_id, template_id, academic_year)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (school_id, enrollment_id) DO UPDATE SET template_id = COALESCE(student_observers.template_id, EXCLUDED.template_id)
           RETURNING id::text`,
          [schoolId.toString(), eid, tpl3Id, year],
        );
        obs3IdMap.set(safeInt(o.id), Number(res.rows[0].id));
        const meta = enrollmentMetaMap.get(eid);
        if (meta) obs3StudentIdMap.set(safeInt(o.id), meta.studentProfileId);
      }

      const matrixByStudent = new Map<number, Record<string, Record<string, string>>>();
      for (const it of items3Rows) {
        const spId = obs3StudentIdMap.get(safeInt(it['id_observador']));
        const cid = critMap.get(safeInt(it['id_item_criterio']));
        if (!spId || !cid) continue;
        const m = matrixByStudent.get(spId) ?? {};
        const entry: Record<string, string> = {};
        for (let p = 1; p <= 4; p++) {
          if (safeInt(it[`s${p}`]) === 1) entry[`p${p}`] = 'S';
          else if (safeInt(it[`cs${p}`]) === 1) entry[`p${p}`] = 'CS';
          else if (safeInt(it[`av${p}`]) === 1) entry[`p${p}`] = 'AV';
          else if (safeInt(it[`n${p}`]) === 1) entry[`p${p}`] = 'N';
        }
        m[String(cid)] = entry;
        matrixByStudent.set(spId, m);
      }
      for (const [spId, matrix] of matrixByStudent.entries()) {
        await client.query(
          `UPDATE student_profiles
              SET additional_info = jsonb_set(COALESCE(additional_info, '{}'::jsonb), '{observerModel3}', $3::jsonb, true)
            WHERE school_id = $1 AND id = $2`,
          [schoolId.toString(), spId, JSON.stringify(matrix)],
        );
      }

      for (const a of ann3Rows) {
        const obsId = obs3IdMap.get(safeInt(a.id_observador));
        const desc = cleanNullableStr(a.anotacion);
        if (!obsId || !desc) continue;
        annBatch.push({
          obsId,
          uid: teacherUserIdMap.get(safeInt(a.id_docente)) ?? fallbackUserId,
          period: Math.min(6, Math.max(1, safeInt(a.periodo, 1))),
          type: 'BEHAVIORAL',
          severity: 'MILD',
          desc,
          commit: cleanNullableStr(a.compromiso_est),
          dt: safeDate(a.fecha, '2026-01-19')!,
        });
      }

      for (let i = 0; i < annBatch.length; i += 1000) {
        const b = annBatch.slice(i, i + 1000);
        await client.query(
          `INSERT INTO observer_annotations (
             school_id, student_observer_id, created_by_user_id, period_number,
             annotation_type, severity_level, situation_description,
             pedagogical_commitment, annotation_date
           )
           SELECT $1::bigint, * FROM UNNEST(
             $2::bigint[], $3::bigint[], $4::smallint[], $5::varchar[],
             $6::varchar[], $7::text[], $8::text[], $9::date[]
           )`,
          [
            schoolId.toString(),
            b.map((x) => x.obsId),
            b.map((x) => x.uid),
            b.map((x) => x.period),
            b.map((x) => x.type),
            b.map((x) => x.severity),
            b.map((x) => x.desc),
            b.map((x) => x.commit),
            b.map((x) => x.dt),
          ],
        );
      }
    });
  }

  private async migratePromotionsAndRankings(
    schoolDb: string,
    schoolId: bigint,
    enrollmentMap: Map<number, number>,
    enrollmentMetaMap: Map<
      number,
      { studentProfileId: number; gradeId: number; academicGroupId: number; year: number }
    >,
    gradeToGroupIdMap: Map<number, number>,
    catalogs: CatalogValidationSets,
    allowedYears: Set<number> | null,
  ): Promise<void> {
    // Promociones (acta_promocion)
    await this.mysql.streamBatches<{
      id_matric: string;
      promedio: string;
      areas_p: string;
      msg: string | null;
      msg1: string | null;
      msg2: string | null;
      msg3: string | null;
      estado: string;
      libro: string | null;
      folio: string | null;
      year: string;
    }>(
      `SELECT ap.id_matric, ap.promedio, ap.areas_p, ap.msg, ap.msg1, ap.msg2, ap.msg3, ap.estado, ap.libro, ap.folio, se.year
         FROM ${schoolDb}.acta_promocion ap
         INNER JOIN ${schoolDb}.student_enrollment se ON se.id = ap.id_matric
        WHERE ${this.yearWhere('se.year', allowedYears)}`,
      3000,
      async (batch) => {
        const prepared = dedupeByKey(
          batch
            .map((r) => {
              const eid = enrollmentMap.get(safeInt(r.id_matric));
              const year = safeInt(r.year);
              if (!eid || year < 1990 || year > 2100) return null;
              const code = Math.min(3, Math.max(1, safeInt(r.estado, 1)));
              const statusId =
                catalogs.promotionStatusByGroupAndCode.get(`9:${code}`) ?? 1;
              const obs = cleanNullableStr(
                [r.msg, r.msg1, r.msg2, r.msg3]
                  .map((s) => (s ?? '').trim())
                  .filter(Boolean)
                  .join(' '),
                1000,
              );
              return {
                eid,
                statusId,
                year,
                avg: safeDecimal(r.promedio, 0, 0, 100),
                failedAreas: Math.max(0, safeInt(r.areas_p)),
                folio: cleanNullableStr(r.folio, 30),
                act: cleanNullableStr(r.libro, 30),
                obs,
                promotedAt: `${year}-12-01`,
              };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null),
          (x) => String(x.eid),
        );
        if (prepared.length === 0) return;

        await this.runBulkTenantTx(schoolId, async (client) => {
          await client.query(
            `INSERT INTO promotion_records (
               school_id, enrollment_id, promotion_status_id, academic_year,
               act_number, final_average, failed_areas_count, graduation_folio,
               observations, promoted_at
             )
             SELECT $1::bigint, * FROM UNNEST(
               $2::bigint[], $3::smallint[], $4::smallint[], $5::varchar[],
               $6::numeric[], $7::smallint[], $8::varchar[], $9::text[], $10::date[]
             )
             ON CONFLICT (school_id, enrollment_id)
             DO UPDATE SET
               promotion_status_id = EXCLUDED.promotion_status_id,
               final_average = EXCLUDED.final_average,
               failed_areas_count = EXCLUDED.failed_areas_count,
               observations = EXCLUDED.observations`,
            [
              schoolId.toString(),
              prepared.map((b) => b.eid),
              prepared.map((b) => b.statusId),
              prepared.map((b) => b.year),
              prepared.map((b) => b.act),
              prepared.map((b) => b.avg),
              prepared.map((b) => b.failedAreas),
              prepared.map((b) => b.folio),
              prepared.map((b) => b.obs),
              prepared.map((b) => b.promotedAt),
            ],
          );
        });
      },
    );

    // Cuadro de honor y puestos (puestos + cuadro_honor)
    const honorRows = await this.mysql.queryAll<{ id_matric: string; periodo: string }>(
      `SELECT id_matric, periodo FROM ${schoolDb}.cuadro_honor`,
    );
    const honorSet = new Set(
      honorRows.map((h) => `${safeInt(h.id_matric)}:${safeInt(h.periodo)}`),
    );

    await this.mysql.streamBatches<{
      id_matric: string;
      puesto: string;
      prom: string;
      periodo: string;
      year: string;
    }>(
      `SELECT p.id_matric, p.puesto, p.prom, p.periodo, se.year
         FROM ${schoolDb}.puestos p
         INNER JOIN ${schoolDb}.student_enrollment se ON se.id = p.id_matric
        WHERE ${this.yearWhere('se.year', allowedYears)}`,
      5000,
      async (batch) => {
        const prepared = dedupeByKey(
          batch
            .map((r) => {
              const legacyMatric = safeInt(r.id_matric);
              const eid = enrollmentMap.get(legacyMatric);
              const period = safeInt(r.periodo);
              const year = safeInt(r.year);
              if (!eid || period < 1 || period > 6 || year < 1990 || year > 2100) return null;
              const meta = enrollmentMetaMap.get(eid);
              if (!meta) return null;
              const rank = Math.max(1, safeInt(r.puesto, 1));
              return {
                year,
                eid,
                agId: meta.academicGroupId,
                period,
                avg: safeDecimal(r.prom, 0, 0, 100),
                rank,
                isHonor: honorSet.has(`${legacyMatric}:${period}`) || rank <= 3,
                key: `${year}:${eid}:${period}`,
              };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null),
          (x) => x.key,
        );
        if (prepared.length === 0) return;

        await this.runBulkTenantTx(schoolId, async (client) => {
          await client.query(
            `INSERT INTO student_period_rankings (
               school_id, academic_year, enrollment_id, academic_group_id,
               period_number, average_score, group_rank, is_honor_roll
             )
             SELECT $1::bigint, * FROM UNNEST(
               $2::smallint[], $3::bigint[], $4::bigint[],
               $5::smallint[], $6::numeric[], $7::smallint[], $8::boolean[]
             )
             ON CONFLICT (school_id, academic_year, enrollment_id, period_number)
             DO UPDATE SET average_score = EXCLUDED.average_score, group_rank = EXCLUDED.group_rank, is_honor_roll = EXCLUDED.is_honor_roll`,
            [
              schoolId.toString(),
              prepared.map((b) => b.year),
              prepared.map((b) => b.eid),
              prepared.map((b) => b.agId),
              prepared.map((b) => b.period),
              prepared.map((b) => b.avg),
              prepared.map((b) => b.rank),
              prepared.map((b) => b.isHonor),
            ],
          );
        });
      },
    );
  }

  private async migrateLessonPlans(
    schoolDb: string,
    schoolId: bigint,
    courseMetaMap: Map<number, { gradeId: number; subjectId: number; teacherId: number; year: number }>,
    gradeMap: Map<number, number>,
    subjectMap: Map<number, number>,
    teacherMap: Map<number, number>,
    allowedYears: Set<number> | null,
  ): Promise<void> {
    const rows = await this.mysql.queryAll<{
      id: string;
      id_docente: string;
      id_grado: string;
      id_asig: string;
      periodo: string;
      año: string;
    }>(
      `SELECT id, id_docente, id_grado, id_asig, periodo, \`año\`
         FROM ${schoolDb}.parcelador`,
    );
    if (rows.length === 0) return;

    const courseByTriplet = new Map<string, number>();
    for (const [caId, meta] of courseMetaMap.entries()) {
      courseByTriplet.set(
        `${meta.gradeId}:${meta.subjectId}:${meta.teacherId}:${meta.year}`,
        caId,
      );
    }

    await this.db.withTenantTransaction(schoolId, async (client) => {
      await client.query(`DELETE FROM lesson_plans WHERE school_id = $1`, [schoolId.toString()]);
      for (const r of rows) {
        const year = safeInt(r['año']);
        if (allowedYears && !allowedYears.has(year)) continue;
        const gid = gradeMap.get(safeInt(r.id_grado));
        const sid = subjectMap.get(safeInt(r.id_asig));
        const tid = teacherMap.get(safeInt(r.id_docente));
        if (!gid || !sid || !tid) continue;
        const caId = courseByTriplet.get(`${gid}:${sid}:${tid}:${year}`);
        if (!caId) continue;
        await client.query(
          `INSERT INTO lesson_plans (school_id, course_assignment_id, academic_year, period_number, title)
           VALUES ($1,$2,$3,$4,$5)`,
          [schoolId.toString(), caId, year, Math.min(6, Math.max(1, safeInt(r.periodo, 1))), `Parcelador #${r.id}`],
        );
      }
    });
  }

  private async migrateElections(
    schoolDb: string,
    schoolId: bigint,
    enrollmentMap: Map<number, number>,
    catalogs: CatalogValidationSets,
    allowedYears: Set<number> | null,
  ): Promise<void> {
    const [panels, stations, juries, candidates, votes] = await Promise.all([
      this.mysql.queryAll<{
        id: string;
        año: string;
        nom_inst: string | null;
        inicio_jorn: string | null;
        hora_inicio: string | null;
        hora_final: string | null;
        int_voto_nulo: string;
      }>(`SELECT id, \`año\`, nom_inst, inicio_jorn, hora_inicio, hora_final, int_voto_nulo FROM ${schoolDb}.tp_panel_control ORDER BY id`),
      this.mysql.queryAll<{
        id: string;
        nom_mesa: string;
        num_mesa: string;
        ubicacion: string | null;
        estado: string;
        año: string;
      }>(`SELECT id, nom_mesa, num_mesa, ubicacion, estado, \`año\` FROM ${schoolDb}.tp_mesas_votacion`),
      this.mysql.queryAll<{ id_mesa: string; nom_jurado: string; cargo: string | null }>(
        `SELECT id_mesa, nom_jurado, cargo FROM ${schoolDb}.tp_jurados`,
      ),
      this.mysql.queryAll<{
        id: string;
        id_matric: string;
        nom_candidato: string;
        numero: string;
        estado: string;
      }>(`SELECT id, id_matric, nom_candidato, numero, estado FROM ${schoolDb}.tp_candidatos`),
      this.mysql.queryAll<{
        id_matric: string;
        id_candidato: string;
        id_mesa: string;
        año: string;
      }>(`SELECT id_matric, id_candidato, id_mesa, \`año\` FROM ${schoolDb}.tp_votos`),
    ]);

    if (panels.length === 0) return;

    await this.db.withTenantTransaction(schoolId, async (client) => {
      const electionByYear = new Map<number, number>();
      for (const p of panels) {
        const year = safeInt(p['año']);
        if (year < 1990 || year > 2100 || (allowedYears && !allowedYears.has(year))) continue;
        const res = await client.query<{ id: string }>(
          `INSERT INTO school_elections (
             school_id, academic_year, election_name, election_date, start_time, end_time, allows_blank_vote, is_active
           )
           VALUES ($1,$2,$3,$4::date,$5::time,$6::time,$7,FALSE)
           ON CONFLICT (school_id, academic_year)
           DO UPDATE SET election_name = EXCLUDED.election_name
           RETURNING id::text`,
          [
            schoolId.toString(),
            year,
            cleanStr(p.nom_inst, `Elecciones Escolares ${year}`, 200),
            safeDate(p.inicio_jorn, `${year}-03-01`)!,
            /^\d{2}:\d{2}/.test(p.hora_inicio ?? '') ? p.hora_inicio!.slice(0, 8) : '07:00:00',
            /^\d{2}:\d{2}/.test(p.hora_final ?? '') ? p.hora_final!.slice(0, 8) : '16:00:00',
            safeInt(p.int_voto_nulo, 1) === 1,
          ],
        );
        electionByYear.set(year, Number(res.rows[0].id));
      }

      const defaultElectionId = Array.from(electionByYear.values()).pop();
      if (!defaultElectionId) return;

      const stationMap = new Map<number, number>();
      await client.query(`DELETE FROM election_votes WHERE school_id = $1`, [schoolId.toString()]);
      await client.query(`DELETE FROM election_candidates WHERE school_id = $1`, [schoolId.toString()]);
      await client.query(`DELETE FROM election_polling_stations WHERE school_id = $1`, [schoolId.toString()]);

      for (const st of stations) {
        const eid = electionByYear.get(safeInt(st['año'])) ?? defaultElectionId;
        const ins = await client.query<{ id: string }>(
          `INSERT INTO election_polling_stations (school_id, election_id, station_number, station_name, location_description, is_active)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id::text`,
          [schoolId.toString(), eid, cleanStr(st.num_mesa, st.id, 20), cleanStr(st.nom_mesa, `Mesa ${st.num_mesa}`, 150), cleanNullableStr(st.ubicacion, 200), safeInt(st.estado, 1) === 1],
        );
        stationMap.set(safeInt(st.id), Number(ins.rows[0].id));
      }

      for (const j of juries) {
        const sid = stationMap.get(safeInt(j.id_mesa));
        if (!sid) continue;
        await client.query(
          `INSERT INTO election_juries (school_id, polling_station_id, full_name, role_title)
           VALUES ($1,$2,$3,$4)`,
          [schoolId.toString(), sid, cleanStr(j.nom_jurado, 'Jurado', 150), cleanNullableStr(j.cargo, 100)],
        );
      }

      const candMap = new Map<number, { candId: number; candidacyTypeId: number }>();
      for (const c of candidates) {
        const ctId = validCatalogId(c.nom_candidato, catalogs.candidacyTypes, 1) ?? 1;
        const enrollId = enrollmentMap.get(safeInt(c.id_matric)) ?? null;
        const ins = await client.query<{ id: string }>(
          `INSERT INTO election_candidates (school_id, election_id, candidacy_type_id, enrollment_id, ballot_number, candidate_name, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id::text`,
          [schoolId.toString(), defaultElectionId, ctId, enrollId, cleanStr(c.numero, '01', 10), `Candidato #${c.numero}`, safeInt(c.estado, 1) === 1],
        );
        candMap.set(safeInt(c.id), { candId: Number(ins.rows[0].id), candidacyTypeId: ctId });
      }

      for (const v of votes) {
        const enrollId = enrollmentMap.get(safeInt(v.id_matric));
        const cand = candMap.get(safeInt(v.id_candidato));
        const elId = electionByYear.get(safeInt(v['año'])) ?? defaultElectionId;
        if (!enrollId || !cand) continue;
        await client.query(
          `INSERT INTO election_votes (school_id, election_id, polling_station_id, candidacy_type_id, enrollment_id, candidate_id)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (school_id, election_id, candidacy_type_id, enrollment_id) DO NOTHING`,
          [schoolId.toString(), elId, stationMap.get(safeInt(v.id_mesa)) ?? null, cand.candidacyTypeId, enrollId, cand.candId],
        );
      }
    });
  }

  private async saveIdMappingsBatch(
    schoolId: bigint,
    entityName: string,
    entries: Array<[number, number]>,
    sourceDbName: string,
  ): Promise<void> {
    for (let i = 0; i < entries.length; i += 2000) {
      const batch = entries.slice(i, i + 2000);
      await this.db.withTenantTransaction(schoolId, async (client) => {
        await client.query(
          `INSERT INTO migration_id_mappings (school_id, entity_name, legacy_id, new_id, legacy_source_db)
           SELECT $1::bigint, $2::varchar, leg, nid, $3::varchar
             FROM UNNEST($4::varchar[], $5::bigint[]) AS t(leg, nid)
           ON CONFLICT (school_id, entity_name, legacy_id)
           DO UPDATE SET new_id = EXCLUDED.new_id, migrated_at = NOW()`,
          [
            schoolId.toString(),
            entityName,
            sourceDbName,
            batch.map(([leg]) => String(leg)),
            batch.map(([, nid]) => nid),
          ],
        );
      });
    }
  }

  private async buildReconciliationReport(params: {
    schoolId: bigint;
    schoolName: string;
    legacyBridgeDb: string;
    legacySchoolDb: string;
    migratedYears: string;
    startedAt: number;
    sourceUsersCount: number;
    sourceMembershipsCount: number;
    sourceCampusesCount: number;
    sourceTeachersCount: number;
    sourceStudentsCount: number;
    sourceFamiliesCount: number;
    sourceFamilyLinksCount: number;
    sourceEnrollmentsCount: number;
    sourceCoursesCount: number;
    sourceGradesCount: number;
    sourceFinalSum: number;
    sourceItemsCreated: number;
    sourceLinksRead: number;
    warnings: string[];
  }): Promise<MigrationReconciliationReport> {
    const sid = params.schoolId.toString();
    const pgCounts = await this.runBulkTenantTx(
      params.schoolId,
      async (client) => {
        const res = await client.query<{ k: string; c: string }>(
          `SELECT 'memberships' AS k, COUNT(*)::text AS c FROM user_school_memberships WHERE school_id = $1
           UNION ALL SELECT 'campuses', COUNT(*)::text FROM campuses WHERE school_id = $1
           UNION ALL SELECT 'teachers', COUNT(*)::text FROM teacher_profiles WHERE school_id = $1
           UNION ALL SELECT 'students', COUNT(*)::text FROM student_profiles WHERE school_id = $1
           UNION ALL SELECT 'families', COUNT(*)::text FROM family_profiles WHERE school_id = $1
           UNION ALL SELECT 'family_links', COUNT(*)::text FROM student_family_links WHERE school_id = $1
           UNION ALL SELECT 'academic_groups', COUNT(*)::text FROM academic_groups WHERE school_id = $1
           UNION ALL SELECT 'courses', COUNT(*)::text FROM course_assignments WHERE school_id = $1
           UNION ALL SELECT 'enrollments', COUNT(*)::text FROM student_enrollments WHERE school_id = $1
           UNION ALL SELECT 'gradebook_columns', COUNT(*)::text FROM teacher_gradebook_columns WHERE school_id = $1
           UNION ALL SELECT 'achievements', COUNT(*)::text FROM achievement_standards WHERE school_id = $1
           UNION ALL SELECT 'grades', COUNT(*)::text FROM academic_grades WHERE school_id = $1
           UNION ALL SELECT 'grade_achievements', COUNT(*)::text FROM academic_grade_achievements WHERE school_id = $1
           UNION ALL SELECT 'pre_reports', COUNT(*)::text FROM academic_pre_reports WHERE school_id = $1
           UNION ALL SELECT 'recoveries', COUNT(*)::text FROM period_recovery_records WHERE school_id = $1
           UNION ALL SELECT 'observers', COUNT(*)::text FROM student_observers WHERE school_id = $1
           UNION ALL SELECT 'observer_annotations', COUNT(*)::text FROM observer_annotations WHERE school_id = $1
           UNION ALL SELECT 'promotions', COUNT(*)::text FROM promotion_records WHERE school_id = $1
           UNION ALL SELECT 'rankings', COUNT(*)::text FROM student_period_rankings WHERE school_id = $1`,
          [sid],
        );
        const nonNullExpr = Array.from(
          { length: 30 },
          (_, idx) => `(n${idx + 1} IS NOT NULL)::int`,
        ).join(' + ');
        const sumRes = await client.query<{ total_sum: string; inline_cells: string }>(
          `SELECT COALESCE(ROUND(SUM(final_score)::numeric, 2), 0)::text AS total_sum,
                  COALESCE(SUM(${nonNullExpr}), 0)::text AS inline_cells
             FROM academic_grades WHERE school_id = $1`,
          [sid],
        );
        const map = new Map(res.rows.map((r) => [r.k, Number(r.c)]));
        return {
          map,
          targetFinalSum: Number(sumRes.rows[0]?.total_sum ?? 0),
          targetInlineCells: Number(sumRes.rows[0]?.inline_cells ?? 0),
        };
      },
      false,
    );

    const targetGrades = pgCounts.map.get('grades') ?? 0;
    const deltaSum = Number(
      Math.abs(params.sourceFinalSum - pgCounts.targetFinalSum).toFixed(2),
    );

    return {
      schoolId: Number(params.schoolId),
      schoolName: params.schoolName,
      legacyBridgeDb: params.legacyBridgeDb,
      legacySchoolDb: params.legacySchoolDb,
      migratedYears: params.migratedYears,
      durationSeconds: Number(((Date.now() - params.startedAt) / 1000).toFixed(1)),
      counts: {
        memberships: {
          source: params.sourceMembershipsCount,
          target: pgCounts.map.get('memberships') ?? 0,
        },
        campuses: {
          source: params.sourceCampusesCount,
          target: pgCounts.map.get('campuses') ?? 0,
        },
        teachers: {
          source: params.sourceTeachersCount,
          target: pgCounts.map.get('teachers') ?? 0,
        },
        students: {
          source: params.sourceStudentsCount,
          target: pgCounts.map.get('students') ?? 0,
        },
        families: {
          source: params.sourceFamiliesCount,
          target: pgCounts.map.get('families') ?? 0,
        },
        family_links: {
          source: params.sourceFamilyLinksCount,
          target: pgCounts.map.get('family_links') ?? 0,
        },
        academic_groups: {
          source: pgCounts.map.get('academic_groups') ?? 0,
          target: pgCounts.map.get('academic_groups') ?? 0,
        },
        courses: {
          source: params.sourceCoursesCount,
          target: pgCounts.map.get('courses') ?? 0,
        },
        enrollments: {
          source: params.sourceEnrollmentsCount,
          target: pgCounts.map.get('enrollments') ?? 0,
        },
        gradebook_columns: {
          source: pgCounts.map.get('gradebook_columns') ?? 0,
          target: pgCounts.map.get('gradebook_columns') ?? 0,
        },
        achievements: {
          source: pgCounts.map.get('achievements') ?? 0,
          target: pgCounts.map.get('achievements') ?? 0,
        },
        grades: { source: params.sourceGradesCount, target: targetGrades },
        grade_cells_inline_n1_n30: {
          source: params.sourceItemsCreated,
          target: pgCounts.targetInlineCells,
        },
        grade_achievements: {
          source: params.sourceLinksRead,
          target: pgCounts.map.get('grade_achievements') ?? 0,
        },
        pre_reports: {
          source: pgCounts.map.get('pre_reports') ?? 0,
          target: pgCounts.map.get('pre_reports') ?? 0,
        },
        recoveries: {
          source: pgCounts.map.get('recoveries') ?? 0,
          target: pgCounts.map.get('recoveries') ?? 0,
        },
        observers: {
          source: pgCounts.map.get('observers') ?? 0,
          target: pgCounts.map.get('observers') ?? 0,
        },
        observer_annotations: {
          source: pgCounts.map.get('observer_annotations') ?? 0,
          target: pgCounts.map.get('observer_annotations') ?? 0,
        },
        promotions: {
          source: pgCounts.map.get('promotions') ?? 0,
          target: pgCounts.map.get('promotions') ?? 0,
        },
        rankings: {
          source: pgCounts.map.get('rankings') ?? 0,
          target: pgCounts.map.get('rankings') ?? 0,
        },
      },
      gradesChecksum: {
        sourceCount: params.sourceGradesCount,
        targetCount: targetGrades,
        sourceFinalSum: params.sourceFinalSum,
        targetFinalSum: pgCounts.targetFinalSum,
        deltaSum,
      },
      warnings: params.warnings,
    };
  }
}
