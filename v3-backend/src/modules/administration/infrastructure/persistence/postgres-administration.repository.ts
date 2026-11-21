import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { IamCommunityProvisioningService } from '../../../iam/application/services/iam-community-provisioning.service';
import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';
import {
  AdministrationRepositoryPort,
  AdministrativeStaffRecord,
  CampusEducationLevelRecord,
  CampusRecord,
  CampusShiftRecord,
  DashboardStatisticsResponse,
  GroupManagerRecord,
  PaginatedRecords,
  SaveAdministrativeStaffInput,
  SaveCampusInput,
  SaveTeacherInput,
  SchoolProfileRecord,
  TeacherProfileRecord,
  UpdateGroupManagerInput,
  UpdateSchoolProfileInput,
  UpsertGroupManagerInput,
} from '../../domain/ports/administration.repository.port';

@Injectable()
export class PostgresAdministrationRepository
  implements AdministrationRepositoryPort
{
  constructor(
    private readonly db: PostgresRlsService,
    private readonly iamProvisioning: IamCommunityProvisioningService,
  ) {}

  async getDashboardStatistics(
    schoolId: bigint,
    academicYear: number,
  ): Promise<DashboardStatisticsResponse> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const schoolRes = await client.query<{
        id: string;
        name: string;
        short_name: string | null;
        dane_code: string | null;
        is_active: boolean;
        subscription_lock_date: Date | string;
        logo_url: string | null;
      }>(
        `SELECT id, name, short_name, dane_code, is_active, subscription_lock_date, logo_url
         FROM schools
         WHERE id = $1
         LIMIT 1`,
        [String(schoolId)],
      );

      if (schoolRes.rowCount === 0) {
        throw new ResourceNotFoundException('School', schoolId);
      }

      const kpiRes = await client.query<{
        registered_students: string;
        retired_students: string;
        active_teachers: string;
        total_campuses: string;
        total_groups: string;
        active_staff: string;
      }>(
        `SELECT
           (SELECT COUNT(*)::text FROM student_enrollments
            WHERE academic_year = $1
              AND enrollment_status_id IN (2, 3)
              AND withdrawal_date IS NULL) AS registered_students,
           (SELECT COUNT(*)::text FROM student_enrollments
            WHERE academic_year = $1
              AND (enrollment_status_id IN (4, 7) OR withdrawal_date IS NOT NULL)) AS retired_students,
           (SELECT COUNT(*)::text FROM teacher_profiles
            WHERE is_active = TRUE) AS active_teachers,
           (SELECT COUNT(*)::text FROM campuses
            WHERE is_active = TRUE) AS total_campuses,
           (SELECT COUNT(*)::text FROM academic_groups
            WHERE academic_year = $1 AND is_active = TRUE) AS total_groups,
           (SELECT COUNT(*)::text FROM administrative_staff
            WHERE is_active = TRUE) AS active_staff`,
        [academicYear],
      );

      const registeredSeriesRes = await client.query<{ year: number; total: string }>(
        `SELECT academic_year AS year, COUNT(*)::text AS total
         FROM student_enrollments
         WHERE enrollment_status_id IN (2, 3)
           AND withdrawal_date IS NULL
         GROUP BY academic_year
         ORDER BY academic_year ASC`,
      );

      const retiredSeriesRes = await client.query<{ year: number; total: string }>(
        `SELECT academic_year AS year, COUNT(*)::text AS total
         FROM student_enrollments
         WHERE enrollment_status_id IN (4, 7)
            OR withdrawal_date IS NOT NULL
         GROUP BY academic_year
         ORDER BY academic_year ASC`,
      );

      const teachersSeriesRes = await client.query<{ year: number; total: string }>(
        `SELECT academic_year AS year, COUNT(DISTINCT teacher_profile_id)::text AS total
         FROM course_assignments
         WHERE is_active = TRUE
         GROUP BY academic_year
         ORDER BY academic_year ASC`,
      );

      const school = schoolRes.rows[0];
      const kpis = kpiRes.rows[0];

      const registeredByYear = registeredSeriesRes.rows.map((r) => ({
        year: Number(r.year),
        total: Number(r.total),
      }));
      const retiredByYear = retiredSeriesRes.rows.map((r) => ({
        year: Number(r.year),
        total: Number(r.total),
      }));
      const teachersByYear =
        teachersSeriesRes.rows.length > 0
          ? teachersSeriesRes.rows.map((r) => ({
              year: Number(r.year),
              total: Number(r.total),
            }))
          : [{ year: academicYear, total: Number(kpis.active_teachers) }];

      return {
        academicYear,
        schoolSummary: {
          id: Number(school.id),
          name: school.name,
          shortName: school.short_name,
          daneCode: school.dane_code,
          isActive: school.is_active,
          subscriptionLockDate: this.formatIsoDate(school.subscription_lock_date),
          logoUrl: school.logo_url,
        },
        kpis: {
          registeredStudents: Number(kpis.registered_students),
          retiredStudents: Number(kpis.retired_students),
          activeTeachers: Number(kpis.active_teachers),
          totalCampuses: Number(kpis.total_campuses),
          totalGroups: Number(kpis.total_groups),
          activeStaff: Number(kpis.active_staff),
        },
        series: {
          registeredByYear:
            registeredByYear.length > 0
              ? registeredByYear
              : [{ year: academicYear, total: Number(kpis.registered_students) }],
          retiredByYear:
            retiredByYear.length > 0
              ? retiredByYear
              : [{ year: academicYear, total: Number(kpis.retired_students) }],
          teachersByYear,
        },
      };
    });
  }

  async getSchoolProfile(schoolId: bigint): Promise<SchoolProfileRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT s.*, c.name AS city_name, c.department_id
         FROM schools s
         LEFT JOIN cities c ON c.id = s.city_id
         WHERE s.id = $1
         LIMIT 1`,
        [String(schoolId)],
      );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('School', schoolId);
      }

      return this.mapSchoolProfileRow(res.rows[0]);
    });
  }

  async updateSchoolProfile(
    schoolId: bigint,
    input: UpdateSchoolProfileInput,
  ): Promise<SchoolProfileRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `UPDATE schools
         SET country_id = COALESCE($2, country_id),
             city_id = $3,
             calendar_id = $4,
             sector_id = $5,
             institution_type_id = $6,
             dane_code = $7,
             tax_id = $8,
             name = $9,
             short_name = $10,
             resolution_text = $11,
             header_line_1 = $12,
             header_line_2 = $13,
             footer_text = $14,
             director_name = $15,
             director_document = $16,
             secretary_name = $17,
             secretary_document = $18,
             address = $19,
             suburb = $20,
             phones = $21,
             email = $22,
             website = $23,
             logo_url = COALESCE($24, logo_url),
             shield_url = COALESCE($25, shield_url),
             updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [
          String(schoolId),
          input.countryId ?? null,
          input.cityId ?? null,
          input.calendarId ?? null,
          input.sectorId ?? null,
          input.institutionTypeId ?? null,
          input.daneCode?.trim() || null,
          input.taxId?.trim() || null,
          input.name.trim(),
          input.shortName?.trim() || null,
          input.resolutionText?.trim() || null,
          input.headerLine1?.trim() || null,
          input.headerLine2?.trim() || null,
          input.footerText?.trim() || null,
          input.directorName?.trim() || null,
          input.directorDocument?.trim() || null,
          input.secretaryName?.trim() || null,
          input.secretaryDocument?.trim() || null,
          input.address?.trim() || null,
          input.suburb?.trim() || null,
          input.phones?.trim() || null,
          input.email?.trim() || null,
          input.website?.trim() || null,
          input.logoUrl !== undefined ? input.logoUrl?.trim() || null : null,
          input.shieldUrl !== undefined ? input.shieldUrl?.trim() || null : null,
        ],
      );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('School', schoolId);
      }

      const full = await client.query<Record<string, unknown>>(
        `SELECT s.*, c.name AS city_name, c.department_id
         FROM schools s
         LEFT JOIN cities c ON c.id = s.city_id
         WHERE s.id = $1
         LIMIT 1`,
        [String(schoolId)],
      );
      return this.mapSchoolProfileRow(full.rows[0]);
    });
  }

  async listCampuses(schoolId: bigint): Promise<CampusRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT cp.*,
                c.name AS city_name,
                c.department_id,
                d.country_id,
                z.name AS zone_name,
                (SELECT COUNT(*)::int FROM campus_shifts cs WHERE cs.campus_id = cp.id) AS shifts_count,
                (SELECT COUNT(*)::int FROM campus_education_levels cel WHERE cel.campus_id = cp.id) AS levels_count
         FROM campuses cp
         LEFT JOIN cities c ON c.id = cp.city_id
         LEFT JOIN departments d ON d.id = c.department_id
         LEFT JOIN geographical_zones z ON z.id = cp.zone_id
         ORDER BY cp.is_main_campus DESC, cp.name ASC`,
      );

      return res.rows.map((r) => this.mapCampusRow(r));
    });
  }

  async createCampus(
    schoolId: bigint,
    input: SaveCampusInput,
  ): Promise<CampusRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      if (input.isMainCampus) {
        await client.query(
          `UPDATE campuses SET is_main_campus = FALSE WHERE is_main_campus = TRUE`,
        );
      }

      const inserted = await client.query<{ id: string }>(
        `INSERT INTO campuses (
           school_id, city_id, zone_id, dane_code, consecutive_code,
           name, address, phones, email, is_main_campus, is_active
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          String(schoolId),
          input.cityId ?? null,
          input.zoneId ?? 1,
          input.daneCode?.trim() || null,
          input.consecutiveCode?.trim() || null,
          input.name.trim(),
          input.address?.trim() || null,
          input.phones?.trim() || null,
          input.email?.trim() || null,
          input.isMainCampus ?? false,
          input.isActive ?? true,
        ],
      );

      return this.fetchCampusById(client, inserted.rows[0].id);
    });
  }

  async updateCampus(
    schoolId: bigint,
    campusId: bigint,
    input: SaveCampusInput,
  ): Promise<CampusRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      if (input.isMainCampus) {
        await client.query(
          `UPDATE campuses SET is_main_campus = FALSE WHERE is_main_campus = TRUE AND id <> $1`,
          [String(campusId)],
        );
      }

      const res = await client.query<{ id: string }>(
        `UPDATE campuses
         SET city_id = $2,
             zone_id = COALESCE($3, zone_id),
             dane_code = $4,
             consecutive_code = $5,
             name = $6,
             address = $7,
             phones = $8,
             email = $9,
             is_main_campus = COALESCE($10, is_main_campus),
             is_active = COALESCE($11, is_active)
         WHERE id = $1
         RETURNING id`,
        [
          String(campusId),
          input.cityId ?? null,
          input.zoneId ?? null,
          input.daneCode?.trim() || null,
          input.consecutiveCode?.trim() || null,
          input.name.trim(),
          input.address?.trim() || null,
          input.phones?.trim() || null,
          input.email?.trim() || null,
          input.isMainCampus ?? null,
          input.isActive ?? null,
        ],
      );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('Campus', campusId);
      }

      return this.fetchCampusById(client, String(campusId));
    });
  }

  async deleteCampus(schoolId: bigint, campusId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM campuses WHERE id = $1`,
        [String(campusId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('Campus', campusId);
      }
    });
  }

  async listCampusShifts(
    schoolId: bigint,
    campusId: bigint,
  ): Promise<CampusShiftRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        campus_id: string;
        shift_id: string;
        shift_code: number;
        shift_name: string;
        is_active: boolean;
      }>(
        `SELECT cs.id, cs.campus_id, cs.shift_id, ss.shift_code, ss.name AS shift_name, cs.is_active
         FROM campus_shifts cs
         INNER JOIN school_shifts ss ON ss.school_id = cs.school_id AND ss.id = cs.shift_id
         WHERE cs.campus_id = $1
         ORDER BY ss.shift_code ASC`,
        [String(campusId)],
      );

      return res.rows.map((r) => ({
        id: Number(r.id),
        campusId: Number(r.campus_id),
        shiftId: Number(r.shift_id),
        shiftCode: Number(r.shift_code),
        shiftName: r.shift_name,
        isActive: r.is_active,
      }));
    });
  }

  async assignCampusShift(
    schoolId: bigint,
    campusId: bigint,
    shiftId: bigint,
  ): Promise<CampusShiftRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO campus_shifts (school_id, campus_id, shift_id, is_active)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT (school_id, campus_id, shift_id)
         DO UPDATE SET is_active = TRUE
         RETURNING id`,
        [String(schoolId), String(campusId), String(shiftId)],
      );

      const res = await client.query<{
        id: string;
        campus_id: string;
        shift_id: string;
        shift_code: number;
        shift_name: string;
        is_active: boolean;
      }>(
        `SELECT cs.id, cs.campus_id, cs.shift_id, ss.shift_code, ss.name AS shift_name, cs.is_active
         FROM campus_shifts cs
         INNER JOIN school_shifts ss ON ss.school_id = cs.school_id AND ss.id = cs.shift_id
         WHERE cs.id = $1`,
        [inserted.rows[0].id],
      );

      const row = res.rows[0];
      return {
        id: Number(row.id),
        campusId: Number(row.campus_id),
        shiftId: Number(row.shift_id),
        shiftCode: Number(row.shift_code),
        shiftName: row.shift_name,
        isActive: row.is_active,
      };
    });
  }

  async removeCampusShift(
    schoolId: bigint,
    campusId: bigint,
    assignmentId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM campus_shifts WHERE campus_id = $1 AND id = $2`,
        [String(campusId), String(assignmentId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('CampusShift', assignmentId);
      }
    });
  }

  async listCampusEducationLevels(
    schoolId: bigint,
    campusId: bigint,
  ): Promise<CampusEducationLevelRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        campus_id: string;
        education_level_id: string;
        level_code: string;
        level_name: string;
        is_active: boolean;
      }>(
        `SELECT cel.id, cel.campus_id, cel.education_level_id, el.level_code, el.name AS level_name, cel.is_active
         FROM campus_education_levels cel
         INNER JOIN education_levels el ON el.school_id = cel.school_id AND el.id = cel.education_level_id
         WHERE cel.campus_id = $1
         ORDER BY el.display_order ASC, el.id ASC`,
        [String(campusId)],
      );

      return res.rows.map((r) => ({
        id: Number(r.id),
        campusId: Number(r.campus_id),
        educationLevelId: Number(r.education_level_id),
        levelCode: r.level_code,
        levelName: r.level_name,
        isActive: r.is_active,
      }));
    });
  }

  async assignCampusEducationLevel(
    schoolId: bigint,
    campusId: bigint,
    educationLevelId: bigint,
  ): Promise<CampusEducationLevelRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO campus_education_levels (school_id, campus_id, education_level_id, is_active)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT (school_id, campus_id, education_level_id)
         DO UPDATE SET is_active = TRUE
         RETURNING id`,
        [String(schoolId), String(campusId), String(educationLevelId)],
      );

      const res = await client.query<{
        id: string;
        campus_id: string;
        education_level_id: string;
        level_code: string;
        level_name: string;
        is_active: boolean;
      }>(
        `SELECT cel.id, cel.campus_id, cel.education_level_id, el.level_code, el.name AS level_name, cel.is_active
         FROM campus_education_levels cel
         INNER JOIN education_levels el ON el.school_id = cel.school_id AND el.id = cel.education_level_id
         WHERE cel.id = $1`,
        [inserted.rows[0].id],
      );

      const row = res.rows[0];
      return {
        id: Number(row.id),
        campusId: Number(row.campus_id),
        educationLevelId: Number(row.education_level_id),
        levelCode: row.level_code,
        levelName: row.level_name,
        isActive: row.is_active,
      };
    });
  }

  async removeCampusEducationLevel(
    schoolId: bigint,
    campusId: bigint,
    assignmentId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM campus_education_levels WHERE campus_id = $1 AND id = $2`,
        [String(campusId), String(assignmentId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException(
          'CampusEducationLevel',
          assignmentId,
        );
      }
    });
  }

  async listTeachers(
    schoolId: bigint,
    options: { search?: string; onlyActive?: boolean; limit: number; offset: number },
  ): Promise<PaginatedRecords<TeacherProfileRecord>> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const clauses: string[] = [];
      const params: unknown[] = [];

      if (options.onlyActive) {
        clauses.push(`tp.is_active = TRUE`);
      }
      if (options.search && options.search.length > 0) {
        params.push(`%${options.search}%`);
        clauses.push(
          `(tp.document_number ILIKE $${params.length}
            OR tp.first_name ILIKE $${params.length}
            OR tp.last_name ILIKE $${params.length}
            OR COALESCE(tp.email, '') ILIKE $${params.length})`,
        );
      }

      const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
      const countRes = await client.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total FROM teacher_profiles tp ${whereSql}`,
        params,
      );

      const dataParams = [...params, options.limit, options.offset];
      const rowsRes = await client.query<Record<string, unknown>>(
        `SELECT tp.*,
                dt.code AS document_type_code,
                ad.name AS academic_degree_name,
                ps.name AS pay_scale_name,
                ta.name AS teaching_area_name
         FROM teacher_profiles tp
         LEFT JOIN document_types dt ON dt.id = tp.document_type_id
         LEFT JOIN academic_degrees_catalog ad ON ad.id = tp.academic_degree_id
         LEFT JOIN teacher_pay_scales ps ON ps.id = tp.pay_scale_id
         LEFT JOIN teaching_areas ta ON ta.id = tp.teaching_area_id
         ${whereSql}
         ORDER BY tp.last_name ASC, tp.first_name ASC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      );

      return {
        items: rowsRes.rows.map((r) => this.mapTeacherRow(r)),
        total: Number(countRes.rows[0].total),
      };
    });
  }

  async createTeacher(
    schoolId: bigint,
    input: SaveTeacherInput,
  ): Promise<TeacherProfileRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      // Aprovisionamiento automático IAM (`users` con scrypt + membresía TEACHER)
      // Paridad segura del trigger legacy `docentes_after_insert`
      const userId = await this.iamProvisioning.provisionCommunityUser(client, {
        schoolId,
        role: CommunityRole.TEACHER,
        documentTypeId: input.documentTypeId ?? 1,
        documentNumber: input.documentNumber,
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        secondLastName: input.secondLastName,
        email: input.email,
        phone: input.phone,
        genderId: input.genderId,
        birthDate: input.birthDate,
      });

      const res = await client.query<{ id: string }>(
        `INSERT INTO teacher_profiles (
           school_id, user_id, document_type_id, document_number,
           first_name, middle_name, last_name, second_last_name,
           gender_id, birth_date, address, phone, email,
           academic_degree_id, pay_scale_id, teaching_area_id, technical_area_id,
           appointment_type_id, position_id, workplace_location_id, signature_url, is_active
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
         RETURNING id`,
        [
          String(schoolId),
          String(userId),
          input.documentTypeId ?? 1,
          input.documentNumber.trim(),
          input.firstName.trim().toUpperCase(),
          input.middleName?.trim().toUpperCase() || null,
          input.lastName.trim().toUpperCase(),
          input.secondLastName?.trim().toUpperCase() || null,
          input.genderId ?? null,
          input.birthDate || null,
          input.address?.trim() || null,
          input.phone?.trim() || null,
          input.email?.trim() || null,
          input.academicDegreeId ?? null,
          input.payScaleId ?? null,
          input.teachingAreaId ?? null,
          input.technicalAreaId ?? null,
          input.appointmentTypeId ?? null,
          input.positionId ?? null,
          input.workplaceLocationId ?? null,
          input.signatureUrl?.trim() || null,
          input.isActive ?? true,
        ],
      );

      // Registrar en planta docente activa (`teacher_academic_years`, paridad `aux_docentes`)
      const yearRes = await client.query<{ active_year: number }>(
        `SELECT COALESCE(MAX(year), EXTRACT(YEAR FROM CURRENT_DATE)::smallint) AS active_year
           FROM academic_years
          WHERE school_id = $1 AND is_closed = FALSE`,
        [String(schoolId)],
      );
      const activeYear =
        yearRes.rows[0]?.active_year ?? new Date().getFullYear();
      await client.query(
        `INSERT INTO teacher_academic_years (school_id, academic_year, teacher_profile_id, is_active)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT (school_id, academic_year, teacher_profile_id) DO NOTHING`,
        [String(schoolId), activeYear, res.rows[0].id],
      );

      return this.fetchTeacherById(client, res.rows[0].id);
    });
  }

  async updateTeacher(
    schoolId: bigint,
    teacherId: bigint,
    input: SaveTeacherInput,
  ): Promise<TeacherProfileRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{ id: string }>(
        `UPDATE teacher_profiles
         SET document_type_id = COALESCE($2, document_type_id),
             document_number = $3,
             first_name = $4,
             middle_name = $5,
             last_name = $6,
             second_last_name = $7,
             gender_id = $8,
             birth_date = $9,
             address = $10,
             phone = $11,
             email = $12,
             academic_degree_id = $13,
             pay_scale_id = $14,
             teaching_area_id = $15,
             technical_area_id = $16,
             appointment_type_id = $17,
             position_id = $18,
             workplace_location_id = $19,
             signature_url = COALESCE($20, signature_url),
             is_active = COALESCE($21, is_active)
         WHERE id = $1
         RETURNING id`,
        [
          String(teacherId),
          input.documentTypeId ?? null,
          input.documentNumber.trim(),
          input.firstName.trim(),
          input.middleName?.trim() || null,
          input.lastName.trim(),
          input.secondLastName?.trim() || null,
          input.genderId ?? null,
          input.birthDate || null,
          input.address?.trim() || null,
          input.phone?.trim() || null,
          input.email?.trim() || null,
          input.academicDegreeId ?? null,
          input.payScaleId ?? null,
          input.teachingAreaId ?? null,
          input.technicalAreaId ?? null,
          input.appointmentTypeId ?? null,
          input.positionId ?? null,
          input.workplaceLocationId ?? null,
          input.signatureUrl !== undefined ? input.signatureUrl?.trim() || null : null,
          input.isActive ?? null,
        ],
      );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('TeacherProfile', teacherId);
      }

      return this.fetchTeacherById(client, String(teacherId));
    });
  }

  async deleteTeacher(schoolId: bigint, teacherId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM teacher_profiles WHERE id = $1`,
        [String(teacherId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('TeacherProfile', teacherId);
      }
    });
  }

  async listAdministrativeStaff(
    schoolId: bigint,
    options: { search?: string; onlyActive?: boolean; limit: number; offset: number },
  ): Promise<PaginatedRecords<AdministrativeStaffRecord>> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const clauses: string[] = [];
      const params: unknown[] = [];

      if (options.onlyActive) {
        clauses.push(`s.is_active = TRUE`);
      }
      if (options.search && options.search.length > 0) {
        params.push(`%${options.search}%`);
        clauses.push(
          `(s.document_number ILIKE $${params.length}
            OR s.first_name ILIKE $${params.length}
            OR s.last_name ILIKE $${params.length}
            OR COALESCE(s.email, '') ILIKE $${params.length})`,
        );
      }

      const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
      const countRes = await client.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total FROM administrative_staff s ${whereSql}`,
        params,
      );

      const dataParams = [...params, options.limit, options.offset];
      const rowsRes = await client.query<Record<string, unknown>>(
        `SELECT s.*,
                dt.code AS document_type_code,
                hl.name AS hierarchy_level_name,
                ct.name AS career_type_name,
                atp.name AS appointment_type_name
         FROM administrative_staff s
         LEFT JOIN document_types dt ON dt.id = s.document_type_id
         LEFT JOIN hierarchy_levels hl ON hl.id = s.hierarchy_level_id
         LEFT JOIN administrative_career_types ct ON ct.id = s.career_type_id
         LEFT JOIN staff_appointment_types atp ON atp.id = s.appointment_type_id
         ${whereSql}
         ORDER BY s.last_name ASC, s.first_name ASC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      );

      return {
        items: rowsRes.rows.map((r) => this.mapStaffRow(r)),
        total: Number(countRes.rows[0].total),
      };
    });
  }

  async createAdministrativeStaff(
    schoolId: bigint,
    input: SaveAdministrativeStaffInput,
  ): Promise<AdministrativeStaffRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      // Aprovisionamiento automático IAM (`users` con scrypt + membresía SECRETARY)
      // Paridad segura del trigger legacy `administrativos_after_insert`
      const userId = await this.iamProvisioning.provisionCommunityUser(client, {
        schoolId,
        role: CommunityRole.SECRETARY,
        documentTypeId: input.documentTypeId ?? 1,
        documentNumber: input.documentNumber,
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        secondLastName: input.secondLastName,
        email: input.email,
        phone: input.phone,
        genderId: input.genderId,
        birthDate: input.birthDate,
      });

      const res = await client.query<{ id: string }>(
        `INSERT INTO administrative_staff (
           school_id, user_id, document_type_id, document_number,
           first_name, middle_name, last_name, second_last_name,
           gender_id, birth_date, phone, email,
           hierarchy_level_id, career_type_id, appointment_type_id, workplace_location_id, is_active
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         RETURNING id`,
        [
          String(schoolId),
          String(userId),
          input.documentTypeId ?? 1,
          input.documentNumber.trim(),
          input.firstName.trim().toUpperCase(),
          input.middleName?.trim().toUpperCase() || null,
          input.lastName.trim().toUpperCase(),
          input.secondLastName?.trim().toUpperCase() || null,
          input.genderId ?? null,
          input.birthDate || null,
          input.phone?.trim() || null,
          input.email?.trim() || null,
          input.hierarchyLevelId ?? null,
          input.careerTypeId ?? null,
          input.appointmentTypeId ?? null,
          input.workplaceLocationId ?? null,
          input.isActive ?? true,
        ],
      );

      return this.fetchStaffById(client, res.rows[0].id);
    });
  }

  async updateAdministrativeStaff(
    schoolId: bigint,
    staffId: bigint,
    input: SaveAdministrativeStaffInput,
  ): Promise<AdministrativeStaffRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{ id: string }>(
        `UPDATE administrative_staff
         SET document_type_id = COALESCE($2, document_type_id),
             document_number = $3,
             first_name = $4,
             middle_name = $5,
             last_name = $6,
             second_last_name = $7,
             gender_id = $8,
             birth_date = $9,
             phone = $10,
             email = $11,
             hierarchy_level_id = $12,
             career_type_id = $13,
             appointment_type_id = $14,
             workplace_location_id = $15,
             is_active = COALESCE($16, is_active)
         WHERE id = $1
         RETURNING id`,
        [
          String(staffId),
          input.documentTypeId ?? null,
          input.documentNumber.trim(),
          input.firstName.trim(),
          input.middleName?.trim() || null,
          input.lastName.trim(),
          input.secondLastName?.trim() || null,
          input.genderId ?? null,
          input.birthDate || null,
          input.phone?.trim() || null,
          input.email?.trim() || null,
          input.hierarchyLevelId ?? null,
          input.careerTypeId ?? null,
          input.appointmentTypeId ?? null,
          input.workplaceLocationId ?? null,
          input.isActive ?? null,
        ],
      );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('AdministrativeStaff', staffId);
      }

      return this.fetchStaffById(client, String(staffId));
    });
  }

  async deleteAdministrativeStaff(
    schoolId: bigint,
    staffId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM administrative_staff WHERE id = $1`,
        [String(staffId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('AdministrativeStaff', staffId);
      }
    });
  }

  async listGroupManagers(
    schoolId: bigint,
    academicYear: number,
  ): Promise<GroupManagerRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT ag.*,
                cp.name AS campus_name,
                ss.name AS shift_name,
                g.grade_code,
                g.name AS grade_name,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.middle_name, tp.last_name, tp.second_last_name)) AS homeroom_teacher_name
         FROM academic_groups ag
         INNER JOIN campuses cp ON cp.school_id = ag.school_id AND cp.id = ag.campus_id
         INNER JOIN school_shifts ss ON ss.school_id = ag.school_id AND ss.id = ag.shift_id
         INNER JOIN grades g ON g.school_id = ag.school_id AND g.id = ag.grade_id
         LEFT JOIN teacher_profiles tp ON tp.school_id = ag.school_id AND tp.id = ag.homeroom_teacher_id
         WHERE ag.academic_year = $1
         ORDER BY cp.name ASC, ss.shift_code ASC, g.display_order ASC, ag.group_code ASC`,
        [academicYear],
      );

      return res.rows.map((r) => this.mapGroupManagerRow(r));
    });
  }

  async upsertGroupManager(
    schoolId: bigint,
    input: UpsertGroupManagerInput,
  ): Promise<GroupManagerRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const groupCode = input.groupCode.trim().toUpperCase();
      const groupName = input.name?.trim() || `Grupo ${groupCode}`;

      const res = await client.query<{ id: string }>(
        `INSERT INTO academic_groups (
           school_id, campus_id, shift_id, grade_id, homeroom_teacher_id,
           study_methodology_id, academic_year, group_code, name, max_capacity, is_active
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (school_id, campus_id, shift_id, grade_id, academic_year, group_code)
         DO UPDATE SET
           homeroom_teacher_id = EXCLUDED.homeroom_teacher_id,
           name = EXCLUDED.name,
           max_capacity = EXCLUDED.max_capacity,
           is_active = EXCLUDED.is_active
         RETURNING id`,
        [
          String(schoolId),
          String(input.campusId),
          String(input.shiftId),
          String(input.gradeId),
          input.homeroomTeacherId ? String(input.homeroomTeacherId) : null,
          input.studyMethodologyId ?? 1,
          input.academicYear,
          groupCode,
          groupName,
          input.maxCapacity ?? 40,
          input.isActive ?? true,
        ],
      );

      return this.fetchGroupById(client, res.rows[0].id);
    });
  }

  async updateGroupManager(
    schoolId: bigint,
    groupId: bigint,
    input: UpdateGroupManagerInput,
  ): Promise<GroupManagerRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{ id: string }>(
        `UPDATE academic_groups
         SET homeroom_teacher_id = CASE WHEN $2::boolean THEN $3::bigint ELSE homeroom_teacher_id END,
             name = COALESCE($4, name),
             max_capacity = COALESCE($5, max_capacity),
             is_active = COALESCE($6, is_active)
         WHERE id = $1
         RETURNING id`,
        [
          String(groupId),
          input.homeroomTeacherId !== undefined,
          input.homeroomTeacherId ? String(input.homeroomTeacherId) : null,
          input.name?.trim() || null,
          input.maxCapacity ?? null,
          input.isActive ?? null,
        ],
      );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('AcademicGroup', groupId);
      }

      return this.fetchGroupById(client, String(groupId));
    });
  }

  async deleteGroupManager(schoolId: bigint, groupId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const enrollments = await client.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total FROM student_enrollments WHERE academic_group_id = $1`,
        [String(groupId)],
      );

      if (Number(enrollments.rows[0].total) > 0) {
        // Si ya tiene matriculas historicas, desvincula director y marca inactivo sin romper integridad
        const updated = await client.query(
          `UPDATE academic_groups
           SET homeroom_teacher_id = NULL, is_active = FALSE
           WHERE id = $1`,
          [String(groupId)],
        );
        if (updated.rowCount === 0) {
          throw new ResourceNotFoundException('AcademicGroup', groupId);
        }
        return;
      }

      const deleted = await client.query(
        `DELETE FROM academic_groups WHERE id = $1`,
        [String(groupId)],
      );
      if (deleted.rowCount === 0) {
        throw new ResourceNotFoundException('AcademicGroup', groupId);
      }
    });
  }

  private async fetchCampusById(
    client: { query: <T>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }> },
    campusId: string,
  ): Promise<CampusRecord> {
    const res = await client.query<Record<string, unknown>>(
      `SELECT cp.*,
              c.name AS city_name,
              c.department_id,
              d.country_id,
              z.name AS zone_name,
              (SELECT COUNT(*)::int FROM campus_shifts cs WHERE cs.campus_id = cp.id) AS shifts_count,
              (SELECT COUNT(*)::int FROM campus_education_levels cel WHERE cel.campus_id = cp.id) AS levels_count
       FROM campuses cp
       LEFT JOIN cities c ON c.id = cp.city_id
       LEFT JOIN departments d ON d.id = c.department_id
       LEFT JOIN geographical_zones z ON z.id = cp.zone_id
       WHERE cp.id = $1`,
      [campusId],
    );
    return this.mapCampusRow(res.rows[0]);
  }

  private async fetchTeacherById(
    client: { query: <T>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }> },
    teacherId: string,
  ): Promise<TeacherProfileRecord> {
    const res = await client.query<Record<string, unknown>>(
      `SELECT tp.*,
              dt.code AS document_type_code,
              ad.name AS academic_degree_name,
              ps.name AS pay_scale_name,
              ta.name AS teaching_area_name
       FROM teacher_profiles tp
       LEFT JOIN document_types dt ON dt.id = tp.document_type_id
       LEFT JOIN academic_degrees_catalog ad ON ad.id = tp.academic_degree_id
       LEFT JOIN teacher_pay_scales ps ON ps.id = tp.pay_scale_id
       LEFT JOIN teaching_areas ta ON ta.id = tp.teaching_area_id
       WHERE tp.id = $1`,
      [teacherId],
    );
    return this.mapTeacherRow(res.rows[0]);
  }

  private async fetchStaffById(
    client: { query: <T>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }> },
    staffId: string,
  ): Promise<AdministrativeStaffRecord> {
    const res = await client.query<Record<string, unknown>>(
      `SELECT s.*,
              dt.code AS document_type_code,
              hl.name AS hierarchy_level_name,
              ct.name AS career_type_name,
              atp.name AS appointment_type_name
       FROM administrative_staff s
       LEFT JOIN document_types dt ON dt.id = s.document_type_id
       LEFT JOIN hierarchy_levels hl ON hl.id = s.hierarchy_level_id
       LEFT JOIN administrative_career_types ct ON ct.id = s.career_type_id
       LEFT JOIN staff_appointment_types atp ON atp.id = s.appointment_type_id
       WHERE s.id = $1`,
      [staffId],
    );
    return this.mapStaffRow(res.rows[0]);
  }

  private async fetchGroupById(
    client: { query: <T>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }> },
    groupId: string,
  ): Promise<GroupManagerRecord> {
    const res = await client.query<Record<string, unknown>>(
      `SELECT ag.*,
              cp.name AS campus_name,
              ss.name AS shift_name,
              g.grade_code,
              g.name AS grade_name,
              TRIM(CONCAT_WS(' ', tp.first_name, tp.middle_name, tp.last_name, tp.second_last_name)) AS homeroom_teacher_name
       FROM academic_groups ag
       INNER JOIN campuses cp ON cp.school_id = ag.school_id AND cp.id = ag.campus_id
       INNER JOIN school_shifts ss ON ss.school_id = ag.school_id AND ss.id = ag.shift_id
       INNER JOIN grades g ON g.school_id = ag.school_id AND g.id = ag.grade_id
       LEFT JOIN teacher_profiles tp ON tp.school_id = ag.school_id AND tp.id = ag.homeroom_teacher_id
       WHERE ag.id = $1`,
      [groupId],
    );
    return this.mapGroupManagerRow(res.rows[0]);
  }

  private mapSchoolProfileRow(row: Record<string, unknown>): SchoolProfileRecord {
    return {
      id: Number(row.id),
      publicUuid: String(row.public_uuid),
      countryId: Number(row.country_id ?? 45),
      departmentId: row.department_id != null ? Number(row.department_id) : null,
      cityId: row.city_id != null ? Number(row.city_id) : null,
      cityName: (row.city_name as string | null) ?? null,
      calendarId: row.calendar_id != null ? Number(row.calendar_id) : null,
      sectorId: row.sector_id != null ? Number(row.sector_id) : null,
      institutionTypeId:
        row.institution_type_id != null ? Number(row.institution_type_id) : null,
      daneCode: (row.dane_code as string | null) ?? null,
      taxId: (row.tax_id as string | null) ?? null,
      name: String(row.name),
      shortName: (row.short_name as string | null) ?? null,
      resolutionText: (row.resolution_text as string | null) ?? null,
      headerLine1: (row.header_line_1 as string | null) ?? null,
      headerLine2: (row.header_line_2 as string | null) ?? null,
      footerText: (row.footer_text as string | null) ?? null,
      directorName: (row.director_name as string | null) ?? null,
      directorDocument: (row.director_document as string | null) ?? null,
      directorSignatureUrl: (row.director_signature_url as string | null) ?? null,
      secretaryName: (row.secretary_name as string | null) ?? null,
      secretaryDocument: (row.secretary_document as string | null) ?? null,
      secretarySignatureUrl: (row.secretary_signature_url as string | null) ?? null,
      address: (row.address as string | null) ?? null,
      suburb: (row.suburb as string | null) ?? null,
      phones: (row.phones as string | null) ?? null,
      email: (row.email as string | null) ?? null,
      website: (row.website as string | null) ?? null,
      logoUrl: (row.logo_url as string | null) ?? null,
      shieldUrl: (row.shield_url as string | null) ?? null,
      subscriptionLockDate: this.formatIsoDate(
        row.subscription_lock_date as Date | string,
      ),
      isActive: Boolean(row.is_active),
      updatedAt: new Date(row.updated_at as string | Date).toISOString(),
    };
  }

  private mapCampusRow(row: Record<string, unknown>): CampusRecord {
    return {
      id: Number(row.id),
      schoolId: Number(row.school_id),
      cityId: row.city_id != null ? Number(row.city_id) : null,
      cityName: (row.city_name as string | null) ?? null,
      departmentId: row.department_id != null ? Number(row.department_id) : null,
      countryId: row.country_id != null ? Number(row.country_id) : null,
      zoneId: row.zone_id != null ? Number(row.zone_id) : null,
      zoneName: (row.zone_name as string | null) ?? null,
      daneCode: (row.dane_code as string | null) ?? null,
      consecutiveCode: (row.consecutive_code as string | null) ?? null,
      name: String(row.name),
      address: (row.address as string | null) ?? null,
      phones: (row.phones as string | null) ?? null,
      email: (row.email as string | null) ?? null,
      isMainCampus: Boolean(row.is_main_campus),
      isActive: Boolean(row.is_active),
      shiftsCount: Number(row.shifts_count ?? 0),
      levelsCount: Number(row.levels_count ?? 0),
      createdAt: new Date(row.created_at as string | Date).toISOString(),
    };
  }

  private mapTeacherRow(row: Record<string, unknown>): TeacherProfileRecord {
    const firstName = String(row.first_name);
    const middleName = (row.middle_name as string | null) ?? null;
    const lastName = String(row.last_name);
    const secondLastName = (row.second_last_name as string | null) ?? null;
    const fullName = [firstName, middleName, lastName, secondLastName]
      .filter((p): p is string => Boolean(p && p.trim().length > 0))
      .join(' ');

    return {
      id: Number(row.id),
      schoolId: Number(row.school_id),
      userId: row.user_id != null ? Number(row.user_id) : null,
      documentTypeId:
        row.document_type_id != null ? Number(row.document_type_id) : null,
      documentTypeCode: (row.document_type_code as string | null) ?? null,
      documentNumber: String(row.document_number),
      firstName,
      middleName,
      lastName,
      secondLastName,
      fullName,
      genderId: row.gender_id != null ? Number(row.gender_id) : null,
      birthDate: row.birth_date
        ? this.formatIsoDate(row.birth_date as Date | string)
        : null,
      address: (row.address as string | null) ?? null,
      phone: (row.phone as string | null) ?? null,
      email: (row.email as string | null) ?? null,
      academicDegreeId:
        row.academic_degree_id != null ? Number(row.academic_degree_id) : null,
      academicDegreeName: (row.academic_degree_name as string | null) ?? null,
      payScaleId: row.pay_scale_id != null ? Number(row.pay_scale_id) : null,
      payScaleName: (row.pay_scale_name as string | null) ?? null,
      teachingAreaId:
        row.teaching_area_id != null ? Number(row.teaching_area_id) : null,
      teachingAreaName: (row.teaching_area_name as string | null) ?? null,
      technicalAreaId:
        row.technical_area_id != null ? Number(row.technical_area_id) : null,
      appointmentTypeId:
        row.appointment_type_id != null ? Number(row.appointment_type_id) : null,
      positionId: row.position_id != null ? Number(row.position_id) : null,
      workplaceLocationId:
        row.workplace_location_id != null
          ? Number(row.workplace_location_id)
          : null,
      signatureUrl: (row.signature_url as string | null) ?? null,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at as string | Date).toISOString(),
    };
  }

  private mapStaffRow(row: Record<string, unknown>): AdministrativeStaffRecord {
    const firstName = String(row.first_name);
    const middleName = (row.middle_name as string | null) ?? null;
    const lastName = String(row.last_name);
    const secondLastName = (row.second_last_name as string | null) ?? null;
    const fullName = [firstName, middleName, lastName, secondLastName]
      .filter((p): p is string => Boolean(p && p.trim().length > 0))
      .join(' ');

    return {
      id: Number(row.id),
      schoolId: Number(row.school_id),
      userId: row.user_id != null ? Number(row.user_id) : null,
      documentTypeId:
        row.document_type_id != null ? Number(row.document_type_id) : null,
      documentTypeCode: (row.document_type_code as string | null) ?? null,
      documentNumber: String(row.document_number),
      firstName,
      middleName,
      lastName,
      secondLastName,
      fullName,
      genderId: row.gender_id != null ? Number(row.gender_id) : null,
      birthDate: row.birth_date
        ? this.formatIsoDate(row.birth_date as Date | string)
        : null,
      phone: (row.phone as string | null) ?? null,
      email: (row.email as string | null) ?? null,
      hierarchyLevelId:
        row.hierarchy_level_id != null ? Number(row.hierarchy_level_id) : null,
      hierarchyLevelName: (row.hierarchy_level_name as string | null) ?? null,
      careerTypeId:
        row.career_type_id != null ? Number(row.career_type_id) : null,
      careerTypeName: (row.career_type_name as string | null) ?? null,
      appointmentTypeId:
        row.appointment_type_id != null ? Number(row.appointment_type_id) : null,
      appointmentTypeName: (row.appointment_type_name as string | null) ?? null,
      workplaceLocationId:
        row.workplace_location_id != null
          ? Number(row.workplace_location_id)
          : null,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at as string | Date).toISOString(),
    };
  }

  private mapGroupManagerRow(row: Record<string, unknown>): GroupManagerRecord {
    const teacherName = (row.homeroom_teacher_name as string | null)?.trim();
    return {
      id: Number(row.id),
      schoolId: Number(row.school_id),
      campusId: Number(row.campus_id),
      campusName: String(row.campus_name),
      shiftId: Number(row.shift_id),
      shiftName: String(row.shift_name),
      gradeId: Number(row.grade_id),
      gradeCode: String(row.grade_code),
      gradeName: String(row.grade_name),
      homeroomTeacherId:
        row.homeroom_teacher_id != null ? Number(row.homeroom_teacher_id) : null,
      homeroomTeacherName:
        teacherName && teacherName.length > 0 ? teacherName : null,
      studyMethodologyId:
        row.study_methodology_id != null
          ? Number(row.study_methodology_id)
          : null,
      academicYear: Number(row.academic_year),
      groupCode: String(row.group_code),
      name: String(row.name),
      maxCapacity: Number(row.max_capacity),
      isActive: Boolean(row.is_active),
    };
  }

  private formatIsoDate(value: Date | string): string {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
  }
}
