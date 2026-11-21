import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  AcademicPeriodRecord,
  AcademicYearRecord,
  DimensionColumnRecord,
  EducationLevelRecord,
  EvaluationDimensionRecord,
  GradeGroupRecord,
  GradeRecord,
  GradingRuleRecord,
  GradingScaleRecord,
  NationalGradingScaleItem,
  ObserverCriteriaRecord,
  ObserverSectionRecord,
  ObserverTemplateRecord,
  SchoolBrandingSettings,
  SchoolModuleRecord,
  SchoolShiftRecord,
  SettingsRepositoryPort,
} from '../../domain/ports/settings.repository.port';

@Injectable()
export class PostgresSettingsRepository implements SettingsRepositoryPort {
  constructor(private readonly db: PostgresRlsService) {}

  async listAcademicYears(schoolId: bigint): Promise<AcademicYearRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT * FROM academic_years ORDER BY year DESC`,
      );
      return res.rows.map((r) => this.mapAcademicYear(r));
    });
  }

  async upsertAcademicYear(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['upsertAcademicYear']>[1],
  ): Promise<AcademicYearRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `INSERT INTO academic_years (
           school_id, year, start_date, end_date, online_enrollment_closed_at,
           is_online_enrollment_open, is_closed,
           report_card_settings, certificate_settings, graduation_act_settings
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb)
         ON CONFLICT (school_id, year)
         DO UPDATE SET
           start_date = COALESCE(EXCLUDED.start_date, academic_years.start_date),
           end_date = COALESCE(EXCLUDED.end_date, academic_years.end_date),
           online_enrollment_closed_at = COALESCE(EXCLUDED.online_enrollment_closed_at, academic_years.online_enrollment_closed_at),
           is_online_enrollment_open = EXCLUDED.is_online_enrollment_open,
           is_closed = EXCLUDED.is_closed,
           report_card_settings = CASE WHEN $11::boolean THEN EXCLUDED.report_card_settings ELSE academic_years.report_card_settings END,
           certificate_settings = CASE WHEN $12::boolean THEN EXCLUDED.certificate_settings ELSE academic_years.certificate_settings END,
           graduation_act_settings = CASE WHEN $13::boolean THEN EXCLUDED.graduation_act_settings ELSE academic_years.graduation_act_settings END,
           updated_at = NOW()
         RETURNING *`,
        [
          String(schoolId),
          input.year,
          input.startDate ?? null,
          input.endDate ?? null,
          input.onlineEnrollmentClosedAt ?? null,
          input.isOnlineEnrollmentOpen ?? false,
          input.isClosed ?? false,
          JSON.stringify(input.reportCardSettings ?? {}),
          JSON.stringify(input.certificateSettings ?? {}),
          JSON.stringify(input.graduationActSettings ?? {}),
          input.reportCardSettings !== undefined,
          input.certificateSettings !== undefined,
          input.graduationActSettings !== undefined,
        ],
      );
      return this.mapAcademicYear(res.rows[0]);
    });
  }

  async listGradingRules(
    schoolId: bigint,
    academicYear: number,
  ): Promise<GradingRuleRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT r.*, gg.name AS grade_group_name
         FROM academic_grading_rules r
         INNER JOIN grade_groups gg ON gg.school_id = r.school_id AND gg.id = r.grade_group_id
         WHERE r.academic_year = $1
         ORDER BY gg.id ASC`,
        [academicYear],
      );
      return res.rows.map((r) => this.mapGradingRule(r));
    });
  }

  async upsertGradingRule(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['upsertGradingRule']>[1],
  ): Promise<GradingRuleRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const saved = await client.query<{ id: string }>(
        `INSERT INTO academic_grading_rules (
           school_id, academic_year, grade_group_id, decimals_count,
           min_passing_score, max_recovery_score, failed_areas_limit,
           fails_after_recovery, promotion_mode, uses_weighted_areas,
           absence_fail_percentage, rounds_period_score, rounds_final_score, promotion_date
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (school_id, academic_year, grade_group_id)
         DO UPDATE SET
           decimals_count = EXCLUDED.decimals_count,
           min_passing_score = EXCLUDED.min_passing_score,
           max_recovery_score = EXCLUDED.max_recovery_score,
           failed_areas_limit = EXCLUDED.failed_areas_limit,
           fails_after_recovery = EXCLUDED.fails_after_recovery,
           promotion_mode = EXCLUDED.promotion_mode,
           uses_weighted_areas = EXCLUDED.uses_weighted_areas,
           absence_fail_percentage = EXCLUDED.absence_fail_percentage,
           rounds_period_score = EXCLUDED.rounds_period_score,
           rounds_final_score = EXCLUDED.rounds_final_score,
           promotion_date = EXCLUDED.promotion_date
         RETURNING id`,
        [
          String(schoolId),
          input.academicYear,
          String(input.gradeGroupId),
          input.decimalsCount ?? 2,
          input.minPassingScore ?? 3.0,
          input.maxRecoveryScore ?? 3.0,
          input.failedAreasLimit ?? 3,
          input.failsAfterRecovery ?? true,
          input.promotionMode ?? 1,
          input.usesWeightedAreas ?? true,
          input.absenceFailPercentage ?? 25.0,
          input.roundsPeriodScore ?? false,
          input.roundsFinalScore ?? false,
          input.promotionDate ?? null,
        ],
      );

      const res = await client.query<Record<string, unknown>>(
        `SELECT r.*, gg.name AS grade_group_name
         FROM academic_grading_rules r
         INNER JOIN grade_groups gg ON gg.school_id = r.school_id AND gg.id = r.grade_group_id
         WHERE r.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapGradingRule(res.rows[0]);
    });
  }

  async deleteGradingRule(schoolId: bigint, ruleId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM academic_grading_rules WHERE id = $1`,
        [String(ruleId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('AcademicGradingRule', ruleId);
      }
    });
  }

  async listShifts(schoolId: bigint): Promise<SchoolShiftRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT * FROM school_shifts ORDER BY shift_code ASC`,
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        catalogShiftId:
          r.catalog_shift_id != null ? Number(r.catalog_shift_id) : null,
        shiftCode: Number(r.shift_code),
        name: String(r.name),
        isActive: Boolean(r.is_active),
      }));
    });
  }

  async saveShift(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveShift']>[1],
  ): Promise<SchoolShiftRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = input.id
        ? await client.query<Record<string, unknown>>(
            `UPDATE school_shifts
             SET shift_code = $2, name = $3, is_active = COALESCE($4, is_active)
             WHERE id = $1
             RETURNING *`,
            [
              String(input.id),
              input.shiftCode,
              input.name.trim(),
              input.isActive ?? null,
            ],
          )
        : await client.query<Record<string, unknown>>(
            `INSERT INTO school_shifts (school_id, shift_code, name, is_active)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
              String(schoolId),
              input.shiftCode,
              input.name.trim(),
              input.isActive ?? true,
            ],
          );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('SchoolShift', input.id ?? 0n);
      }
      const r = res.rows[0];
      return {
        id: Number(r.id),
        catalogShiftId:
          r.catalog_shift_id != null ? Number(r.catalog_shift_id) : null,
        shiftCode: Number(r.shift_code),
        name: String(r.name),
        isActive: Boolean(r.is_active),
      };
    });
  }

  async deleteShift(schoolId: bigint, shiftId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(`DELETE FROM school_shifts WHERE id = $1`, [
        String(shiftId),
      ]);
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('SchoolShift', shiftId);
      }
    });
  }

  async listEducationLevels(schoolId: bigint): Promise<EducationLevelRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT * FROM education_levels ORDER BY display_order ASC, id ASC`,
      );
      return res.rows.map((r) => this.mapEducationLevel(r));
    });
  }

  async saveEducationLevel(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveEducationLevel']>[1],
  ): Promise<EducationLevelRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = input.id
        ? await client.query<Record<string, unknown>>(
            `UPDATE education_levels
             SET level_code = $2, name = $3, abbreviation = $4,
                 display_order = COALESCE($5, display_order),
                 is_active = COALESCE($6, is_active)
             WHERE id = $1
             RETURNING *`,
            [
              String(input.id),
              input.levelCode.trim().toUpperCase(),
              input.name.trim(),
              input.abbreviation?.trim() || null,
              input.displayOrder ?? null,
              input.isActive ?? null,
            ],
          )
        : await client.query<Record<string, unknown>>(
            `INSERT INTO education_levels (school_id, level_code, name, abbreviation, display_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
              String(schoolId),
              input.levelCode.trim().toUpperCase(),
              input.name.trim(),
              input.abbreviation?.trim() || null,
              input.displayOrder ?? 1,
              input.isActive ?? true,
            ],
          );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('EducationLevel', input.id ?? 0n);
      }
      return this.mapEducationLevel(res.rows[0]);
    });
  }

  async deleteEducationLevel(schoolId: bigint, levelId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM education_levels WHERE id = $1`,
        [String(levelId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('EducationLevel', levelId);
      }
    });
  }

  async listGradeGroups(schoolId: bigint): Promise<GradeGroupRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT * FROM grade_groups ORDER BY id ASC`,
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        catalogGradeGroupId:
          r.catalog_grade_group_id != null
            ? Number(r.catalog_grade_group_id)
            : null,
        name: String(r.name),
        isCycleEnd: Boolean(r.is_cycle_end),
      }));
    });
  }

  async saveGradeGroup(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveGradeGroup']>[1],
  ): Promise<GradeGroupRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = input.id
        ? await client.query<Record<string, unknown>>(
            `UPDATE grade_groups
             SET name = $2, is_cycle_end = COALESCE($3, is_cycle_end)
             WHERE id = $1
             RETURNING *`,
            [String(input.id), input.name.trim(), input.isCycleEnd ?? null],
          )
        : await client.query<Record<string, unknown>>(
            `INSERT INTO grade_groups (school_id, name, is_cycle_end)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [String(schoolId), input.name.trim(), input.isCycleEnd ?? false],
          );

      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('GradeGroup', input.id ?? 0n);
      }
      const r = res.rows[0];
      return {
        id: Number(r.id),
        catalogGradeGroupId:
          r.catalog_grade_group_id != null
            ? Number(r.catalog_grade_group_id)
            : null,
        name: String(r.name),
        isCycleEnd: Boolean(r.is_cycle_end),
      };
    });
  }

  async deleteGradeGroup(schoolId: bigint, groupId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(`DELETE FROM grade_groups WHERE id = $1`, [
        String(groupId),
      ]);
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('GradeGroup', groupId);
      }
    });
  }

  async listGrades(schoolId: bigint): Promise<GradeRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT g.*, el.name AS education_level_name, gg.name AS grade_group_name
         FROM grades g
         INNER JOIN education_levels el ON el.school_id = g.school_id AND el.id = g.education_level_id
         LEFT JOIN grade_groups gg ON gg.school_id = g.school_id AND gg.id = g.grade_group_id
         ORDER BY g.display_order ASC, g.grade_code ASC`,
      );
      return res.rows.map((r) => this.mapGrade(r));
    });
  }

  async saveGrade(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveGrade']>[1],
  ): Promise<GradeRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const saved = input.id
        ? await client.query<{ id: string }>(
            `UPDATE grades
             SET education_level_id = $2, grade_group_id = $3, grade_code = $4,
                 name = $5, display_order = COALESCE($6, display_order),
                 next_grade_code = $7, is_active = COALESCE($8, is_active)
             WHERE id = $1
             RETURNING id`,
            [
              String(input.id),
              String(input.educationLevelId),
              input.gradeGroupId ? String(input.gradeGroupId) : null,
              input.gradeCode.trim(),
              input.name.trim(),
              input.displayOrder ?? null,
              input.nextGradeCode?.trim() || null,
              input.isActive ?? null,
            ],
          )
        : await client.query<{ id: string }>(
            `INSERT INTO grades (
               school_id, education_level_id, grade_group_id, grade_code,
               name, display_order, next_grade_code, is_active
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
              String(schoolId),
              String(input.educationLevelId),
              input.gradeGroupId ? String(input.gradeGroupId) : null,
              input.gradeCode.trim(),
              input.name.trim(),
              input.displayOrder ?? 1,
              input.nextGradeCode?.trim() || null,
              input.isActive ?? true,
            ],
          );

      if (saved.rowCount === 0) {
        throw new ResourceNotFoundException('Grade', input.id ?? 0n);
      }

      const res = await client.query<Record<string, unknown>>(
        `SELECT g.*, el.name AS education_level_name, gg.name AS grade_group_name
         FROM grades g
         INNER JOIN education_levels el ON el.school_id = g.school_id AND el.id = g.education_level_id
         LEFT JOIN grade_groups gg ON gg.school_id = g.school_id AND gg.id = g.grade_group_id
         WHERE g.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapGrade(res.rows[0]);
    });
  }

  async deleteGrade(schoolId: bigint, gradeId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(`DELETE FROM grades WHERE id = $1`, [
        String(gradeId),
      ]);
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('Grade', gradeId);
      }
    });
  }

  async listPeriods(
    schoolId: bigint,
    academicYear: number,
  ): Promise<AcademicPeriodRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT p.*, gg.name AS grade_group_name
         FROM academic_periods p
         LEFT JOIN grade_groups gg ON gg.school_id = p.school_id AND gg.id = p.grade_group_id
         WHERE p.academic_year = $1
         ORDER BY p.grade_group_id ASC NULLS FIRST, p.period_number ASC`,
        [academicYear],
      );
      return res.rows.map((r) => this.mapPeriod(r));
    });
  }

  async savePeriod(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['savePeriod']>[1],
  ): Promise<AcademicPeriodRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const saved = input.id
        ? await client.query<{ id: string }>(
            `UPDATE academic_periods
             SET grade_group_id = $2, period_number = $3, name = $4,
                 weight_percentage = $5, start_date = $6, end_date = $7,
                 grading_open_date = $8, grading_close_date = $9,
                 recovery_open_date = $10, recovery_close_date = $11,
                 is_active = COALESCE($12, is_active),
                 is_closed = COALESCE($13, is_closed)
             WHERE id = $1
             RETURNING id`,
            [
              String(input.id),
              input.gradeGroupId ? String(input.gradeGroupId) : null,
              input.periodNumber,
              input.name.trim(),
              input.weightPercentage,
              input.startDate,
              input.endDate,
              input.gradingOpenDate ?? null,
              input.gradingCloseDate ?? null,
              input.recoveryOpenDate ?? null,
              input.recoveryCloseDate ?? null,
              input.isActive ?? null,
              input.isClosed ?? null,
            ],
          )
        : await client.query<{ id: string }>(
            `INSERT INTO academic_periods (
               school_id, grade_group_id, academic_year, period_number, name,
               weight_percentage, start_date, end_date,
               grading_open_date, grading_close_date, recovery_open_date, recovery_close_date,
               is_active, is_closed
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING id`,
            [
              String(schoolId),
              input.gradeGroupId ? String(input.gradeGroupId) : null,
              input.academicYear,
              input.periodNumber,
              input.name.trim(),
              input.weightPercentage,
              input.startDate,
              input.endDate,
              input.gradingOpenDate ?? null,
              input.gradingCloseDate ?? null,
              input.recoveryOpenDate ?? null,
              input.recoveryCloseDate ?? null,
              input.isActive ?? true,
              input.isClosed ?? false,
            ],
          );

      if (saved.rowCount === 0) {
        throw new ResourceNotFoundException('AcademicPeriod', input.id ?? 0n);
      }

      const res = await client.query<Record<string, unknown>>(
        `SELECT p.*, gg.name AS grade_group_name
         FROM academic_periods p
         LEFT JOIN grade_groups gg ON gg.school_id = p.school_id AND gg.id = p.grade_group_id
         WHERE p.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapPeriod(res.rows[0]);
    });
  }

  async deletePeriod(schoolId: bigint, periodId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM academic_periods WHERE id = $1`,
        [String(periodId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('AcademicPeriod', periodId);
      }
    });
  }

  async listNationalScales(
    schoolId: bigint,
  ): Promise<NationalGradingScaleItem[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT id, name, abbreviation, description, report_message, hex_color
         FROM national_grading_scales
         WHERE is_active = TRUE
         ORDER BY id ASC`,
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        name: String(r.name),
        abbreviation: (r.abbreviation as string | null) ?? null,
        description: (r.description as string | null) ?? null,
        reportMessage: (r.report_message as string | null) ?? null,
        hexColor: String(r.hex_color ?? '#000000'),
      }));
    });
  }

  async listGradingScales(
    schoolId: bigint,
    academicYear: number,
  ): Promise<GradingScaleRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT gs.*,
                gg.name AS grade_group_name,
                ns.name AS national_scale_name,
                ns.abbreviation AS national_scale_abbreviation
         FROM grading_scales gs
         INNER JOIN national_grading_scales ns ON ns.id = gs.national_scale_id
         LEFT JOIN grade_groups gg ON gg.school_id = gs.school_id AND gg.id = gs.grade_group_id
         WHERE gs.academic_year = $1
         ORDER BY gs.grade_group_id ASC NULLS FIRST, gs.min_score ASC`,
        [academicYear],
      );
      return res.rows.map((r) => this.mapGradingScale(r));
    });
  }

  async saveGradingScale(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveGradingScale']>[1],
  ): Promise<GradingScaleRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const saved = input.id
        ? await client.query<{ id: string }>(
            `UPDATE grading_scales
             SET grade_group_id = $2, national_scale_id = $3,
                 min_score = $4, max_score = $5, rank_order = $6
             WHERE id = $1
             RETURNING id`,
            [
              String(input.id),
              input.gradeGroupId ? String(input.gradeGroupId) : null,
              input.nationalScaleId,
              input.minScore,
              input.maxScore,
              input.rankOrder?.trim() || null,
            ],
          )
        : await client.query<{ id: string }>(
            `INSERT INTO grading_scales (
               school_id, grade_group_id, national_scale_id, academic_year,
               min_score, max_score, rank_order
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
              String(schoolId),
              input.gradeGroupId ? String(input.gradeGroupId) : null,
              input.nationalScaleId,
              input.academicYear,
              input.minScore,
              input.maxScore,
              input.rankOrder?.trim() || null,
            ],
          );

      if (saved.rowCount === 0) {
        throw new ResourceNotFoundException('GradingScale', input.id ?? 0n);
      }

      const res = await client.query<Record<string, unknown>>(
        `SELECT gs.*,
                gg.name AS grade_group_name,
                ns.name AS national_scale_name,
                ns.abbreviation AS national_scale_abbreviation
         FROM grading_scales gs
         INNER JOIN national_grading_scales ns ON ns.id = gs.national_scale_id
         LEFT JOIN grade_groups gg ON gg.school_id = gs.school_id AND gg.id = gs.grade_group_id
         WHERE gs.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapGradingScale(res.rows[0]);
    });
  }

  async deleteGradingScale(schoolId: bigint, scaleId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM grading_scales WHERE id = $1`,
        [String(scaleId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('GradingScale', scaleId);
      }
    });
  }

  async listEvaluationDimensions(
    schoolId: bigint,
    academicYear: number,
  ): Promise<EvaluationDimensionRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT d.*,
                gg.name AS grade_group_name,
                COALESCE(
                  (SELECT json_agg(
                     json_build_object(
                       'id', c.id,
                       'dimensionId', c.dimension_id,
                       'columnNumber', c.column_number,
                       'label', c.label,
                       'weightPercentage', c.weight_percentage::float8
                     ) ORDER BY c.column_number ASC
                   )
                   FROM evaluation_dimension_columns c
                   WHERE c.dimension_id = d.id),
                  '[]'::json
                ) AS columns
         FROM evaluation_dimensions d
         LEFT JOIN grade_groups gg ON gg.school_id = d.school_id AND gg.id = d.grade_group_id
         WHERE d.academic_year = $1
         ORDER BY d.grade_group_id ASC NULLS FIRST, d.dimension_code ASC`,
        [academicYear],
      );
      return res.rows.map((r) => this.mapDimension(r));
    });
  }

  async saveEvaluationDimension(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveEvaluationDimension']>[1],
  ): Promise<EvaluationDimensionRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const saved = input.id
        ? await client.query<{ id: string }>(
            `UPDATE evaluation_dimensions
             SET grade_group_id = $2, dimension_code = $3, name = $4,
                 abbreviation = $5, weight_percentage = $6, is_editable = COALESCE($7, is_editable)
             WHERE id = $1
             RETURNING id`,
            [
              String(input.id),
              input.gradeGroupId ? String(input.gradeGroupId) : null,
              input.dimensionCode,
              input.name.trim(),
              input.abbreviation?.trim() || null,
              input.weightPercentage,
              input.isEditable ?? null,
            ],
          )
        : await client.query<{ id: string }>(
            `INSERT INTO evaluation_dimensions (
               school_id, grade_group_id, academic_year, dimension_code,
               name, abbreviation, weight_percentage, is_editable
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
              String(schoolId),
              input.gradeGroupId ? String(input.gradeGroupId) : null,
              input.academicYear,
              input.dimensionCode,
              input.name.trim(),
              input.abbreviation?.trim() || null,
              input.weightPercentage,
              input.isEditable ?? true,
            ],
          );

      if (saved.rowCount === 0) {
        throw new ResourceNotFoundException(
          'EvaluationDimension',
          input.id ?? 0n,
        );
      }

      const res = await client.query<Record<string, unknown>>(
        `SELECT d.*,
                gg.name AS grade_group_name,
                COALESCE(
                  (SELECT json_agg(
                     json_build_object(
                       'id', c.id,
                       'dimensionId', c.dimension_id,
                       'columnNumber', c.column_number,
                       'label', c.label,
                       'weightPercentage', c.weight_percentage::float8
                     ) ORDER BY c.column_number ASC
                   )
                   FROM evaluation_dimension_columns c
                   WHERE c.dimension_id = d.id),
                  '[]'::json
                ) AS columns
         FROM evaluation_dimensions d
         LEFT JOIN grade_groups gg ON gg.school_id = d.school_id AND gg.id = d.grade_group_id
         WHERE d.id = $1`,
        [saved.rows[0].id],
      );
      return this.mapDimension(res.rows[0]);
    });
  }

  async deleteEvaluationDimension(
    schoolId: bigint,
    dimensionId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM evaluation_dimensions WHERE id = $1`,
        [String(dimensionId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('EvaluationDimension', dimensionId);
      }
    });
  }

  async saveDimensionColumn(
    schoolId: bigint,
    dimensionId: bigint,
    input: { columnNumber: number; label: string; weightPercentage: number },
  ): Promise<DimensionColumnRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `INSERT INTO evaluation_dimension_columns (
           school_id, dimension_id, column_number, label, weight_percentage
         )
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (school_id, dimension_id, column_number)
         DO UPDATE SET label = EXCLUDED.label, weight_percentage = EXCLUDED.weight_percentage
         RETURNING *`,
        [
          String(schoolId),
          String(dimensionId),
          input.columnNumber,
          input.label.trim(),
          input.weightPercentage,
        ],
      );
      const r = res.rows[0];
      return {
        id: Number(r.id),
        dimensionId: Number(r.dimension_id),
        columnNumber: Number(r.column_number),
        label: String(r.label),
        weightPercentage: Number(r.weight_percentage),
      };
    });
  }

  async deleteDimensionColumn(
    schoolId: bigint,
    dimensionId: bigint,
    columnId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM evaluation_dimension_columns WHERE dimension_id = $1 AND id = $2`,
        [String(dimensionId), String(columnId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('DimensionColumn', columnId);
      }
    });
  }

  async listObserverTemplates(
    schoolId: bigint,
  ): Promise<ObserverTemplateRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT t.*,
                COALESCE(
                  (SELECT json_agg(
                     json_build_object(
                       'id', s.id,
                       'templateId', s.template_id,
                       'title', s.title,
                       'isCoexistenceSection', s.is_coexistence_section,
                       'displayOrder', s.display_order,
                       'isActive', s.is_active,
                       'criteria', COALESCE(
                         (SELECT json_agg(
                            json_build_object(
                              'id', cr.id,
                              'sectionId', cr.section_id,
                              'description', cr.description,
                              'displayOrder', cr.display_order,
                              'isActive', cr.is_active
                            ) ORDER BY cr.display_order ASC, cr.id ASC
                          )
                          FROM observer_criteria cr
                          WHERE cr.section_id = s.id),
                         '[]'::json
                       )
                     ) ORDER BY s.display_order ASC, s.id ASC
                   )
                   FROM observer_template_sections s
                   WHERE s.template_id = t.id),
                  '[]'::json
                ) AS sections
         FROM observer_templates t
         ORDER BY t.id ASC`,
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        name: String(r.name),
        description: (r.description as string | null) ?? null,
        headerConfig: (r.header_config as Record<string, unknown>) ?? {},
        isActive: Boolean(r.is_active),
        sections: (r.sections as ObserverSectionRecord[]) ?? [],
      }));
    });
  }

  async saveObserverTemplate(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveObserverTemplate']>[1],
  ): Promise<ObserverTemplateRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = input.id
        ? await client.query<Record<string, unknown>>(
            `UPDATE observer_templates
             SET name = $2, description = $3,
                 header_config = COALESCE($4::jsonb, header_config),
                 is_active = COALESCE($5, is_active)
             WHERE id = $1
             RETURNING *`,
            [
              String(input.id),
              input.name.trim(),
              input.description?.trim() || null,
              input.headerConfig ? JSON.stringify(input.headerConfig) : null,
              input.isActive ?? null,
            ],
          )
        : await client.query<Record<string, unknown>>(
            `INSERT INTO observer_templates (school_id, name, description, header_config, is_active)
             VALUES ($1, $2, $3, $4::jsonb, $5)
             RETURNING *`,
            [
              String(schoolId),
              input.name.trim(),
              input.description?.trim() || null,
              JSON.stringify(input.headerConfig ?? {}),
              input.isActive ?? true,
            ],
          );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('ObserverTemplate', input.id ?? 0n);
      }
      const r = res.rows[0];
      return {
        id: Number(r.id),
        name: String(r.name),
        description: (r.description as string | null) ?? null,
        headerConfig: (r.header_config as Record<string, unknown>) ?? {},
        isActive: Boolean(r.is_active),
        sections: [],
      };
    });
  }

  async deleteObserverTemplate(
    schoolId: bigint,
    templateId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM observer_templates WHERE id = $1`,
        [String(templateId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('ObserverTemplate', templateId);
      }
    });
  }

  async saveObserverSection(
    schoolId: bigint,
    templateId: bigint,
    input: {
      title: string;
      isCoexistenceSection?: boolean;
      displayOrder?: number;
      isActive?: boolean;
    },
  ): Promise<ObserverSectionRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `INSERT INTO observer_template_sections (
           school_id, template_id, title, is_coexistence_section, display_order, is_active
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          String(schoolId),
          String(templateId),
          input.title.trim(),
          input.isCoexistenceSection ?? false,
          input.displayOrder ?? 1,
          input.isActive ?? true,
        ],
      );
      const r = res.rows[0];
      return {
        id: Number(r.id),
        templateId: Number(r.template_id),
        title: String(r.title),
        isCoexistenceSection: Boolean(r.is_coexistence_section),
        displayOrder: Number(r.display_order),
        isActive: Boolean(r.is_active),
        criteria: [],
      };
    });
  }

  async deleteObserverSection(
    schoolId: bigint,
    sectionId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM observer_template_sections WHERE id = $1`,
        [String(sectionId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('ObserverSection', sectionId);
      }
    });
  }

  async saveObserverCriteria(
    schoolId: bigint,
    sectionId: bigint,
    input: { description: string; displayOrder?: number; isActive?: boolean },
  ): Promise<ObserverCriteriaRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `INSERT INTO observer_criteria (school_id, section_id, description, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          String(schoolId),
          String(sectionId),
          input.description.trim(),
          input.displayOrder ?? 1,
          input.isActive ?? true,
        ],
      );
      const r = res.rows[0];
      return {
        id: Number(r.id),
        sectionId: Number(r.section_id),
        description: String(r.description),
        displayOrder: Number(r.display_order),
        isActive: Boolean(r.is_active),
      };
    });
  }

  async deleteObserverCriteria(
    schoolId: bigint,
    criteriaId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM observer_criteria WHERE id = $1`,
        [String(criteriaId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('ObserverCriteria', criteriaId);
      }
    });
  }

  async getBrandingSettings(schoolId: bigint): Promise<SchoolBrandingSettings> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `SELECT header_line_1, header_line_2, footer_text,
                director_name, director_document, director_signature_url,
                secretary_name, secretary_document, secretary_signature_url,
                logo_url, shield_url, settings
         FROM schools
         WHERE id = $1`,
        [String(schoolId)],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('School', schoolId);
      }
      return this.mapBranding(res.rows[0]);
    });
  }

  async updateBrandingSettings(
    schoolId: bigint,
    input: Partial<SchoolBrandingSettings>,
  ): Promise<SchoolBrandingSettings> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<Record<string, unknown>>(
        `UPDATE schools
         SET header_line_1 = CASE WHEN $2::boolean THEN $3 ELSE header_line_1 END,
             header_line_2 = CASE WHEN $4::boolean THEN $5 ELSE header_line_2 END,
             footer_text = CASE WHEN $6::boolean THEN $7 ELSE footer_text END,
             director_name = CASE WHEN $8::boolean THEN $9 ELSE director_name END,
             director_document = CASE WHEN $10::boolean THEN $11 ELSE director_document END,
             director_signature_url = CASE WHEN $12::boolean THEN $13 ELSE director_signature_url END,
             secretary_name = CASE WHEN $14::boolean THEN $15 ELSE secretary_name END,
             secretary_document = CASE WHEN $16::boolean THEN $17 ELSE secretary_document END,
             secretary_signature_url = CASE WHEN $18::boolean THEN $19 ELSE secretary_signature_url END,
             logo_url = CASE WHEN $20::boolean THEN $21 ELSE logo_url END,
             shield_url = CASE WHEN $22::boolean THEN $23 ELSE shield_url END,
             settings = CASE WHEN $24::boolean THEN settings || $25::jsonb ELSE settings END,
             updated_at = NOW()
         WHERE id = $1
         RETURNING header_line_1, header_line_2, footer_text,
                   director_name, director_document, director_signature_url,
                   secretary_name, secretary_document, secretary_signature_url,
                   logo_url, shield_url, settings`,
        [
          String(schoolId),
          input.headerLine1 !== undefined,
          input.headerLine1 ?? null,
          input.headerLine2 !== undefined,
          input.headerLine2 ?? null,
          input.footerText !== undefined,
          input.footerText ?? null,
          input.directorName !== undefined,
          input.directorName ?? null,
          input.directorDocument !== undefined,
          input.directorDocument ?? null,
          input.directorSignatureUrl !== undefined,
          input.directorSignatureUrl ?? null,
          input.secretaryName !== undefined,
          input.secretaryName ?? null,
          input.secretaryDocument !== undefined,
          input.secretaryDocument ?? null,
          input.secretarySignatureUrl !== undefined,
          input.secretarySignatureUrl ?? null,
          input.logoUrl !== undefined,
          input.logoUrl ?? null,
          input.shieldUrl !== undefined,
          input.shieldUrl ?? null,
          input.settings !== undefined,
          JSON.stringify(input.settings ?? {}),
        ],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('School', schoolId);
      }
      return this.mapBranding(res.rows[0]);
    });
  }

  async listSchoolModules(schoolId: bigint): Promise<SchoolModuleRecord[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        system_module_id: number;
        tag: string;
        module_name: string;
        is_active: boolean;
        status: number;
      }>(
        `SELECT sm.id AS system_module_id,
                sm.tag,
                sm.module_name,
                COALESCE(scm.is_active, sm.is_active) AS is_active,
                COALESCE(scm.status, 1) AS status
         FROM system_modules sm
         LEFT JOIN school_modules scm ON scm.system_module_id = sm.id
         ORDER BY sm.id ASC`,
      );
      return res.rows.map((r) => ({
        systemModuleId: Number(r.system_module_id),
        tag: r.tag,
        moduleName: r.module_name,
        isActive: Boolean(r.is_active),
        status: Number(r.status),
      }));
    });
  }

  async toggleSchoolModule(
    schoolId: bigint,
    systemModuleId: number,
    isActive: boolean,
  ): Promise<SchoolModuleRecord> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      await client.query(
        `INSERT INTO school_modules (school_id, system_module_id, is_active, status)
         VALUES ($1, $2, $3, 1)
         ON CONFLICT (school_id, system_module_id)
         DO UPDATE SET is_active = EXCLUDED.is_active, updated_at = NOW()`,
        [String(schoolId), systemModuleId, isActive],
      );

      const res = await client.query<{
        system_module_id: number;
        tag: string;
        module_name: string;
        is_active: boolean;
        status: number;
      }>(
        `SELECT sm.id AS system_module_id, sm.tag, sm.module_name,
                scm.is_active, scm.status
         FROM system_modules sm
         INNER JOIN school_modules scm ON scm.system_module_id = sm.id
         WHERE sm.id = $1`,
        [systemModuleId],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('SystemModule', systemModuleId);
      }
      const r = res.rows[0];
      return {
        systemModuleId: Number(r.system_module_id),
        tag: r.tag,
        moduleName: r.module_name,
        isActive: Boolean(r.is_active),
        status: Number(r.status),
      };
    });
  }

  async cleanupZeroGrades(
    schoolId: bigint,
    academicYear: number,
  ): Promise<{ deletedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM academic_grades
         WHERE academic_year = $1
           AND is_locked = FALSE
           AND final_score = 0
           AND COALESCE(recovery_score, 0) = 0
           AND COALESCE(leveling_score, 0) = 0`,
        [academicYear],
      );
      return { deletedCount: res.rowCount ?? 0 };
    });
  }

  private mapAcademicYear(r: Record<string, unknown>): AcademicYearRecord {
    return {
      id: Number(r.id),
      year: Number(r.year),
      startDate: this.toIsoDate(r.start_date),
      endDate: this.toIsoDate(r.end_date),
      onlineEnrollmentClosedAt: this.toIsoDate(r.online_enrollment_closed_at),
      isOnlineEnrollmentOpen: Boolean(r.is_online_enrollment_open),
      isClosed: Boolean(r.is_closed),
      reportCardSettings: (r.report_card_settings as Record<string, unknown>) ?? {},
      certificateSettings: (r.certificate_settings as Record<string, unknown>) ?? {},
      graduationActSettings:
        (r.graduation_act_settings as Record<string, unknown>) ?? {},
    };
  }

  private mapGradingRule(r: Record<string, unknown>): GradingRuleRecord {
    return {
      id: Number(r.id),
      academicYear: Number(r.academic_year),
      gradeGroupId: Number(r.grade_group_id),
      gradeGroupName: String(r.grade_group_name),
      decimalsCount: Number(r.decimals_count),
      minPassingScore: Number(r.min_passing_score),
      maxRecoveryScore: Number(r.max_recovery_score),
      failedAreasLimit: Number(r.failed_areas_limit),
      failsAfterRecovery: Boolean(r.fails_after_recovery),
      promotionMode: Number(r.promotion_mode),
      usesWeightedAreas: Boolean(r.uses_weighted_areas),
      absenceFailPercentage: Number(r.absence_fail_percentage),
      roundsPeriodScore: Boolean(r.rounds_period_score),
      roundsFinalScore: Boolean(r.rounds_final_score),
      promotionDate: this.toIsoDate(r.promotion_date),
    };
  }

  private mapEducationLevel(r: Record<string, unknown>): EducationLevelRecord {
    return {
      id: Number(r.id),
      catalogLevelId:
        r.catalog_level_id != null ? Number(r.catalog_level_id) : null,
      levelCode: String(r.level_code),
      name: String(r.name),
      abbreviation: (r.abbreviation as string | null) ?? null,
      displayOrder: Number(r.display_order),
      isActive: Boolean(r.is_active),
    };
  }

  private mapGrade(r: Record<string, unknown>): GradeRecord {
    return {
      id: Number(r.id),
      educationLevelId: Number(r.education_level_id),
      educationLevelName: String(r.education_level_name),
      gradeGroupId:
        r.grade_group_id != null ? Number(r.grade_group_id) : null,
      gradeGroupName: (r.grade_group_name as string | null) ?? null,
      gradeCode: String(r.grade_code),
      name: String(r.name),
      displayOrder: Number(r.display_order),
      nextGradeCode: (r.next_grade_code as string | null) ?? null,
      isActive: Boolean(r.is_active),
    };
  }

  private mapPeriod(r: Record<string, unknown>): AcademicPeriodRecord {
    return {
      id: Number(r.id),
      gradeGroupId:
        r.grade_group_id != null ? Number(r.grade_group_id) : null,
      gradeGroupName: (r.grade_group_name as string | null) ?? null,
      academicYear: Number(r.academic_year),
      periodNumber: Number(r.period_number),
      name: String(r.name),
      weightPercentage: Number(r.weight_percentage),
      startDate: this.toIsoDate(r.start_date) ?? '',
      endDate: this.toIsoDate(r.end_date) ?? '',
      gradingOpenDate: this.toIsoDate(r.grading_open_date),
      gradingCloseDate: this.toIsoDate(r.grading_close_date),
      recoveryOpenDate: this.toIsoDate(r.recovery_open_date),
      recoveryCloseDate: this.toIsoDate(r.recovery_close_date),
      isActive: Boolean(r.is_active),
      isClosed: Boolean(r.is_closed),
    };
  }

  private mapGradingScale(r: Record<string, unknown>): GradingScaleRecord {
    return {
      id: Number(r.id),
      gradeGroupId:
        r.grade_group_id != null ? Number(r.grade_group_id) : null,
      gradeGroupName: (r.grade_group_name as string | null) ?? null,
      nationalScaleId: Number(r.national_scale_id),
      nationalScaleName: String(r.national_scale_name),
      nationalScaleAbbreviation:
        (r.national_scale_abbreviation as string | null) ?? null,
      academicYear: Number(r.academic_year),
      minScore: Number(r.min_score),
      maxScore: Number(r.max_score),
      rankOrder: (r.rank_order as string | null) ?? null,
    };
  }

  private mapDimension(r: Record<string, unknown>): EvaluationDimensionRecord {
    return {
      id: Number(r.id),
      gradeGroupId:
        r.grade_group_id != null ? Number(r.grade_group_id) : null,
      gradeGroupName: (r.grade_group_name as string | null) ?? null,
      academicYear: Number(r.academic_year),
      dimensionCode: Number(r.dimension_code),
      name: String(r.name),
      abbreviation: (r.abbreviation as string | null) ?? null,
      weightPercentage: Number(r.weight_percentage),
      isEditable: Boolean(r.is_editable),
      columns: (r.columns as DimensionColumnRecord[]) ?? [],
    };
  }

  private mapBranding(r: Record<string, unknown>): SchoolBrandingSettings {
    return {
      headerLine1: (r.header_line_1 as string | null) ?? null,
      headerLine2: (r.header_line_2 as string | null) ?? null,
      footerText: (r.footer_text as string | null) ?? null,
      directorName: (r.director_name as string | null) ?? null,
      directorDocument: (r.director_document as string | null) ?? null,
      directorSignatureUrl: (r.director_signature_url as string | null) ?? null,
      secretaryName: (r.secretary_name as string | null) ?? null,
      secretaryDocument: (r.secretary_document as string | null) ?? null,
      secretarySignatureUrl:
        (r.secretary_signature_url as string | null) ?? null,
      logoUrl: (r.logo_url as string | null) ?? null,
      shieldUrl: (r.shield_url as string | null) ?? null,
      settings: (r.settings as Record<string, unknown>) ?? {},
    };
  }

  private toIsoDate(value: unknown): string | null {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
  }
}
