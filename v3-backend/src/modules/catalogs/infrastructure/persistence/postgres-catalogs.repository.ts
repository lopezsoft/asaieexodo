import { Injectable } from '@nestjs/common';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  CatalogsRepositoryPort,
  CityCatalogItem,
  CountryCatalogItem,
  DepartmentCatalogItem,
  GlobalCatalogsBundle,
  SchoolAcademicContextCatalogs,
} from '../../domain/ports/catalogs.repository.port';

@Injectable()
export class PostgresCatalogsRepository implements CatalogsRepositoryPort {
  constructor(private readonly db: PostgresRlsService) {}

  async getGlobalBundle(schoolId: bigint): Promise<GlobalCatalogsBundle> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{ bundle: GlobalCatalogsBundle }>(`
        SELECT json_build_object(
          'documentTypes', COALESCE((SELECT json_agg(json_build_object('id', id, 'code', code, 'name', name) ORDER BY id ASC) FROM document_types WHERE is_active = TRUE), '[]'::json),
          'genders', COALESCE((SELECT json_agg(json_build_object('id', id, 'code', code, 'name', name) ORDER BY id ASC) FROM genders), '[]'::json),
          'geographicalZones', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM geographical_zones), '[]'::json),
          'academicCalendars', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM academic_calendars), '[]'::json),
          'schoolSectors', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM school_sectors), '[]'::json),
          'institutionTypes', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM institution_types), '[]'::json),
          'legalOwnershipTypes', COALESCE((SELECT json_agg(json_build_object('id', id, 'code', code, 'name', name) ORDER BY id ASC) FROM legal_ownership_types), '[]'::json),
          'academicDegrees', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM academic_degrees_catalog), '[]'::json),
          'teacherPayScales', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM teacher_pay_scales), '[]'::json),
          'teachingAreas', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY name ASC) FROM teaching_areas), '[]'::json),
          'technicalAreas', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY name ASC) FROM technical_areas), '[]'::json),
          'staffPositions', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY name ASC) FROM staff_positions), '[]'::json),
          'hierarchyLevels', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM hierarchy_levels), '[]'::json),
          'staffAppointmentTypes', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM staff_appointment_types), '[]'::json),
          'administrativeCareerTypes', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM administrative_career_types), '[]'::json),
          'workplaceLocations', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM workplace_locations), '[]'::json),
          'fundingSources', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM funding_sources), '[]'::json),
          'enrollmentStatuses', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM enrollment_statuses), '[]'::json),
          'studyMethodologies', COALESCE((SELECT json_agg(json_build_object('id', id, 'name', name) ORDER BY id ASC) FROM study_methodologies), '[]'::json)
        ) AS bundle
      `);
      return res.rows[0].bundle;
    });
  }

  async listCountries(
    schoolId: bigint,
    search?: string,
  ): Promise<CountryCatalogItem[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const hasSearch = Boolean(search && search.length > 0);
      const res = await client.query<{
        id: number;
        iso_code: string;
        iso_alpha3: string | null;
        name: string;
        phone_prefix: string | null;
      }>(
        hasSearch
          ? `SELECT id, iso_code, iso_alpha3, name, phone_prefix
             FROM countries
             WHERE is_active = TRUE
               AND (name ILIKE $1 OR iso_code ILIKE $1)
             ORDER BY CASE WHEN id = 45 THEN 0 ELSE 1 END, name ASC`
          : `SELECT id, iso_code, iso_alpha3, name, phone_prefix
             FROM countries
             WHERE is_active = TRUE
             ORDER BY CASE WHEN id = 45 THEN 0 ELSE 1 END, name ASC`,
        hasSearch ? [`%${search}%`] : [],
      );

      return res.rows.map((row) => ({
        id: Number(row.id),
        isoCode: row.iso_code,
        isoAlpha3: row.iso_alpha3,
        name: row.name,
        phonePrefix: row.phone_prefix,
      }));
    });
  }

  async listDepartments(
    schoolId: bigint,
    countryId?: number,
    search?: string,
  ): Promise<DepartmentCatalogItem[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const clauses: string[] = [];
      const params: unknown[] = [];

      if (countryId) {
        params.push(countryId);
        clauses.push(`country_id = $${params.length}`);
      }
      if (search && search.length > 0) {
        params.push(`%${search}%`);
        clauses.push(`(name ILIKE $${params.length} OR dane_code ILIKE $${params.length})`);
      }

      const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
      const res = await client.query<{
        id: number;
        country_id: number;
        dane_code: string;
        name: string;
        abbreviation: string | null;
      }>(
        `SELECT id, country_id, dane_code, name, abbreviation
         FROM departments
         ${whereSql}
         ORDER BY name ASC`,
        params,
      );

      return res.rows.map((row) => ({
        id: Number(row.id),
        countryId: Number(row.country_id),
        daneCode: row.dane_code,
        name: row.name,
        abbreviation: row.abbreviation,
      }));
    });
  }

  async listCities(
    schoolId: bigint,
    departmentId?: number,
    search?: string,
    limit = 200,
  ): Promise<CityCatalogItem[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const clauses: string[] = [];
      const params: unknown[] = [];

      if (departmentId) {
        params.push(departmentId);
        clauses.push(`c.department_id = $${params.length}`);
      }
      if (search && search.length > 0) {
        params.push(`%${search}%`);
        clauses.push(
          `(c.name ILIKE $${params.length} OR d.name ILIKE $${params.length} OR c.dane_code ILIKE $${params.length})`,
        );
      }

      params.push(limit);
      const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
      const res = await client.query<{
        id: number;
        department_id: number;
        department_name: string;
        country_id: number;
        dane_code: string;
        name: string;
      }>(
        `SELECT c.id, c.department_id, d.name AS department_name, d.country_id, c.dane_code, c.name
         FROM cities c
         INNER JOIN departments d ON d.id = c.department_id
         ${whereSql}
         ORDER BY c.name ASC
         LIMIT $${params.length}`,
        params,
      );

      return res.rows.map((row) => ({
        id: Number(row.id),
        departmentId: Number(row.department_id),
        departmentName: row.department_name,
        countryId: Number(row.country_id),
        daneCode: row.dane_code,
        name: row.name,
      }));
    });
  }

  async getSchoolAcademicContext(
    schoolId: bigint,
  ): Promise<SchoolAcademicContextCatalogs> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const campuses = await client.query<{
        id: string;
        name: string;
        is_main_campus: boolean;
        is_active: boolean;
      }>(
        `SELECT id, name, is_main_campus, is_active
         FROM campuses
         ORDER BY is_main_campus DESC, name ASC`,
      );
      const shifts = await client.query<{
        id: string;
        shift_code: number;
        name: string;
        is_active: boolean;
      }>(
        `SELECT id, shift_code, name, is_active
         FROM school_shifts
         ORDER BY shift_code ASC, name ASC`,
      );
      const levels = await client.query<{
        id: string;
        level_code: string;
        name: string;
        abbreviation: string | null;
        is_active: boolean;
      }>(
        `SELECT id, level_code, name, abbreviation, is_active
         FROM education_levels
         ORDER BY display_order ASC, id ASC`,
      );
      const grades = await client.query<{
        id: string;
        education_level_id: string;
        grade_code: string;
        name: string;
        display_order: number;
        is_active: boolean;
      }>(
        `SELECT id, education_level_id, grade_code, name, display_order, is_active
         FROM grades
         ORDER BY display_order ASC, grade_code ASC`,
      );
      const years = await client.query<{
        id: string;
        year: number;
        is_closed: boolean;
      }>(
        `SELECT id, year, is_closed
         FROM academic_years
         ORDER BY year DESC`,
      );

      return {
        campuses: campuses.rows.map((r) => ({
          id: Number(r.id),
          name: r.name,
          isMainCampus: r.is_main_campus,
          isActive: r.is_active,
        })),
        shifts: shifts.rows.map((r) => ({
          id: Number(r.id),
          shiftCode: Number(r.shift_code),
          name: r.name,
          isActive: r.is_active,
        })),
        educationLevels: levels.rows.map((r) => ({
          id: Number(r.id),
          levelCode: r.level_code,
          name: r.name,
          abbreviation: r.abbreviation,
          isActive: r.is_active,
        })),
        grades: grades.rows.map((r) => ({
          id: Number(r.id),
          educationLevelId: Number(r.education_level_id),
          gradeCode: r.grade_code,
          name: r.name,
          displayOrder: Number(r.display_order),
          isActive: r.is_active,
        })),
        academicYears: years.rows.map((r) => ({
          id: Number(r.id),
          year: Number(r.year),
          isClosed: r.is_closed,
        })),
      };
    });
  }
}
