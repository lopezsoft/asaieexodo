import { BadRequestException, Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  GradeAchievementAssignedRow,
  ObserverExtendedData,
  StudentTrackingFormatRow,
  TeacherExtendedRepositoryPort,
  TeacherGradebookColumnRow,
  TeacherLevelingCandidateRow,
  TeacherLevelingListView,
  TeacherPeriodSummary,
  TeacherSelfProfile,
} from '../../domain/ports/teacher-extended.repository.port';

/** Lista estática segura (allowlist) de las 30 casillas parciales inline en `academic_grades`. */
const GRADE_SCORE_COLUMNS = [
  'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10',
  'n11', 'n12', 'n13', 'n14', 'n15', 'n16', 'n17', 'n18', 'n19', 'n20',
  'n21', 'n22', 'n23', 'n24', 'n25', 'n26', 'n27', 'n28', 'n29', 'n30',
] as const;

const GRADE_SCORE_SELECT_PREFIXED = GRADE_SCORE_COLUMNS.map((c) => `ag.${c}`).join(', ');
const GRADE_SCORE_RETURNING = GRADE_SCORE_COLUMNS.join(', ');

@Injectable()
export class PostgresTeacherExtendedRepository extends TeacherExtendedRepositoryPort {
  constructor(private readonly db: PostgresRlsService) {
    super();
  }

  async listTeacherPeriods(
    schoolId: bigint,
    academicYear: number,
  ): Promise<TeacherPeriodSummary[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        period_number: number;
        name: string;
        grade_group_id: string | null;
        grade_group_name: string | null;
        academic_year: number;
        weight_percentage: string;
        start_date: string;
        end_date: string;
        grading_open_date: string | null;
        grading_close_date: string | null;
        recovery_open_date: string | null;
        recovery_close_date: string | null;
        is_active: boolean;
        is_closed: boolean;
      }>(
        `SELECT ap.id, ap.period_number, ap.name, ap.grade_group_id, gg.name AS grade_group_name,
                ap.academic_year, ap.weight_percentage, ap.start_date::text, ap.end_date::text,
                ap.grading_open_date::text, ap.grading_close_date::text,
                ap.recovery_open_date::text, ap.recovery_close_date::text,
                ap.is_active, ap.is_closed
           FROM academic_periods ap
           LEFT JOIN grade_groups gg ON gg.school_id = ap.school_id AND gg.id = ap.grade_group_id
          WHERE ap.school_id = $1 AND ap.academic_year = $2
          ORDER BY ap.period_number ASC, ap.grade_group_id NULLS FIRST`,
        [schoolId.toString(), academicYear],
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        periodNumber: Number(r.period_number),
        name: r.name,
        gradeGroupId: r.grade_group_id ? Number(r.grade_group_id) : null,
        gradeGroupName: r.grade_group_name,
        academicYear: Number(r.academic_year),
        weightPercentage: Number(r.weight_percentage),
        startDate: r.start_date,
        endDate: r.end_date,
        gradingOpenDate: r.grading_open_date,
        gradingCloseDate: r.grading_close_date,
        recoveryOpenDate: r.recovery_open_date,
        recoveryCloseDate: r.recovery_close_date,
        isActive: r.is_active,
        isClosed: r.is_closed,
      }));
    });
  }

  async getTeacherSelfProfile(
    schoolId: bigint,
    userId: bigint,
  ): Promise<TeacherSelfProfile | null> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        document_number: string;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        second_last_name: string | null;
        address: string | null;
        phone: string | null;
        email: string | null;
        signature_url: string | null;
      }>(
        `SELECT id, document_number, first_name, middle_name, last_name, second_last_name,
                address, phone, email, signature_url
           FROM teacher_profiles
          WHERE school_id = $1 AND user_id = $2
          LIMIT 1`,
        [schoolId.toString(), userId.toString()],
      );
      if (res.rowCount === 0) return null;
      return this.mapTeacherSelf(res.rows[0]);
    });
  }

  async updateTeacherSelfProfile(
    schoolId: bigint,
    userId: bigint,
    input: {
      firstName?: string;
      middleName?: string | null;
      lastName?: string;
      secondLastName?: string | null;
      address?: string | null;
      phone?: string | null;
      email?: string | null;
      signatureUrl?: string | null;
    },
  ): Promise<TeacherSelfProfile> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        document_number: string;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        second_last_name: string | null;
        address: string | null;
        phone: string | null;
        email: string | null;
        signature_url: string | null;
      }>(
        `UPDATE teacher_profiles
            SET first_name = COALESCE($3, first_name),
                middle_name = COALESCE($4, middle_name),
                last_name = COALESCE($5, last_name),
                second_last_name = COALESCE($6, second_last_name),
                address = COALESCE($7, address),
                phone = COALESCE($8, phone),
                email = COALESCE($9, email),
                signature_url = COALESCE($10, signature_url)
          WHERE school_id = $1 AND user_id = $2
          RETURNING id, document_number, first_name, middle_name, last_name, second_last_name,
                    address, phone, email, signature_url`,
        [
          schoolId.toString(),
          userId.toString(),
          input.firstName?.trim() || null,
          input.middleName !== undefined ? input.middleName : null,
          input.lastName?.trim() || null,
          input.secondLastName !== undefined ? input.secondLastName : null,
          input.address !== undefined ? input.address : null,
          input.phone !== undefined ? input.phone : null,
          input.email !== undefined ? input.email : null,
          input.signatureUrl !== undefined ? input.signatureUrl : null,
        ],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('TeacherProfile', userId.toString());
      }
      return this.mapTeacherSelf(res.rows[0]);
    });
  }

  async listCourseColumns(
    schoolId: bigint,
    courseAssignmentId: bigint,
    periodNumber: number,
  ): Promise<TeacherGradebookColumnRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        course_assignment_id: string;
        dimension_id: string;
        dimension_name: string;
        dimension_weight: string;
        period_number: number;
        column_number: number;
        description: string;
        weight_percentage: string;
        activity_date: string | null;
      }>(
        `SELECT tgc.id, tgc.course_assignment_id, tgc.dimension_id,
                ed.name AS dimension_name, ed.weight_percentage AS dimension_weight,
                tgc.period_number, tgc.column_number, tgc.description,
                tgc.weight_percentage, tgc.activity_date::text
           FROM teacher_gradebook_columns tgc
           INNER JOIN evaluation_dimensions ed
             ON ed.school_id = tgc.school_id AND ed.id = tgc.dimension_id
          WHERE tgc.school_id = $1
            AND tgc.course_assignment_id = $2
            AND tgc.period_number = $3
          ORDER BY ed.dimension_code, tgc.column_number`,
        [schoolId.toString(), courseAssignmentId.toString(), periodNumber],
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        courseAssignmentId: Number(r.course_assignment_id),
        dimensionId: Number(r.dimension_id),
        dimensionName: r.dimension_name,
        dimensionWeight: Number(r.dimension_weight),
        periodNumber: Number(r.period_number),
        columnNumber: Number(r.column_number),
        description: r.description,
        weightPercentage: Number(r.weight_percentage),
        activityDate: r.activity_date,
      }));
    });
  }

  async upsertCourseColumn(
    schoolId: bigint,
    courseAssignmentId: bigint,
    input: {
      dimensionId: number;
      periodNumber: number;
      columnNumber: number;
      description: string;
      weightPercentage: number;
      activityDate?: string | null;
    },
  ): Promise<TeacherGradebookColumnRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{ id: string }>(
        `INSERT INTO teacher_gradebook_columns (
           school_id, course_assignment_id, dimension_id, period_number,
           column_number, description, weight_percentage, activity_date
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (school_id, course_assignment_id, dimension_id, period_number, column_number)
         DO UPDATE SET
           description = EXCLUDED.description,
           weight_percentage = EXCLUDED.weight_percentage,
           activity_date = EXCLUDED.activity_date
         RETURNING id`,
        [
          schoolId.toString(),
          courseAssignmentId.toString(),
          input.dimensionId,
          input.periodNumber,
          input.columnNumber,
          input.description.trim(),
          input.weightPercentage,
          input.activityDate ?? null,
        ],
      );

      const dimRes = await client.query<{ name: string; weight_percentage: string }>(
        `SELECT name, weight_percentage FROM evaluation_dimensions WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), input.dimensionId],
      );

      return {
        id: Number(res.rows[0].id),
        courseAssignmentId: Number(courseAssignmentId),
        dimensionId: input.dimensionId,
        dimensionName: dimRes.rows[0]?.name ?? '',
        dimensionWeight: Number(dimRes.rows[0]?.weight_percentage ?? 0),
        periodNumber: input.periodNumber,
        columnNumber: input.columnNumber,
        description: input.description.trim(),
        weightPercentage: input.weightPercentage,
        activityDate: input.activityDate ?? null,
      };
    });
  }

  async deleteCourseColumn(schoolId: bigint, columnId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM teacher_gradebook_columns WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), columnId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException(
          'TeacherGradebookColumn',
          columnId.toString(),
        );
      }
    });
  }

  async listCourseGradeItems(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<
    Array<{
      readonly enrollmentId: number;
      readonly academicGradeId: number;
      readonly genderCode: string | null;
      readonly nationalScaleId: number | null;
      readonly items: Record<number, number>;
    }>
  > {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const gradesRes = await client.query<
        {
          enrollment_id: string;
          grade_id: string;
          gender_code: string | null;
          national_scale_id: number | null;
        } & Record<(typeof GRADE_SCORE_COLUMNS)[number], string | null>
      >(
        `SELECT ag.enrollment_id, ag.id AS grade_id, gn.code AS gender_code, ag.national_scale_id,
                ${GRADE_SCORE_SELECT_PREFIXED}
           FROM academic_grades ag
           INNER JOIN student_enrollments se
             ON se.school_id = ag.school_id AND se.id = ag.enrollment_id
           INNER JOIN student_profiles sp
             ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           LEFT JOIN genders gn ON gn.id = sp.gender_id
          WHERE ag.school_id = $1
            AND ag.academic_year = $2
            AND ag.course_assignment_id = $3
            AND ag.period_number = $4`,
        [
          schoolId.toString(),
          academicYear,
          courseAssignmentId.toString(),
          periodNumber,
        ],
      );

      return gradesRes.rows.map((g) => {
        const items: Record<number, number> = {};
        for (let idx = 0; idx < GRADE_SCORE_COLUMNS.length; idx++) {
          const raw = g[GRADE_SCORE_COLUMNS[idx]];
          if (raw !== null && raw !== undefined) {
            items[idx + 1] = Number(raw);
          }
        }
        return {
          enrollmentId: Number(g.enrollment_id),
          academicGradeId: Number(g.grade_id),
          genderCode: g.gender_code,
          nationalScaleId: g.national_scale_id ? Number(g.national_scale_id) : null,
          items,
        };
      });
    });
  }

  async saveGradeItemsBatch(
    schoolId: bigint,
    courseAssignmentId: bigint,
    input: {
      academicYear: number;
      periodNumber: number;
      items: Array<{
        enrollmentId: number;
        itemNumber: number;
        score: number;
        dimensionId?: number | null;
        gradebookColumnId?: number | null;
      }>;
    },
  ): Promise<{ savedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const courseMetaRes = await client.query<{
        grade_group_id: string | null;
      }>(
        `SELECT g.grade_group_id
           FROM course_assignments ca
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
          WHERE ca.school_id = $1 AND ca.id = $2`,
        [schoolId.toString(), courseAssignmentId.toString()],
      );
      const gradeGroupId = courseMetaRes.rows[0]?.grade_group_id ?? null;

      const periodRes = await client.query<{ id: string; is_closed: boolean }>(
        `SELECT id, is_closed FROM academic_periods
          WHERE school_id = $1 AND academic_year = $2 AND period_number = $3
            AND (grade_group_id IS NULL OR grade_group_id = $4::bigint)
          ORDER BY (grade_group_id IS NOT NULL AND grade_group_id = $4::bigint) DESC, grade_group_id NULLS LAST
          LIMIT 1`,
        [schoolId.toString(), input.academicYear, input.periodNumber, gradeGroupId],
      );
      if (periodRes.rowCount === 0 || periodRes.rows[0].is_closed) {
        throw new BadRequestException(
          'El periodo no existe o se encuentra cerrado.',
        );
      }
      const periodId = periodRes.rows[0].id;

      // Cargar pesos porcentuales configurados por columna n1..n30 del curso y periodo
      const weightsRes = await client.query<{
        column_number: number;
        weight_percentage: string;
      }>(
        `SELECT column_number, weight_percentage
           FROM teacher_gradebook_columns
          WHERE school_id = $1
            AND course_assignment_id = $2
            AND period_number = $3`,
        [schoolId.toString(), courseAssignmentId.toString(), input.periodNumber],
      );
      const weightByCol = new Map<number, number>();
      for (const w of weightsRes.rows) {
        weightByCol.set(Number(w.column_number), Number(w.weight_percentage));
      }

      // Agrupar por matrícula para ejecutar 1 solo UPSERT por estudiante tocado
      const updatesByEnrollment = new Map<number, Map<number, number>>();
      let savedCount = 0;
      for (const item of input.items) {
        if (
          !Number.isInteger(item.itemNumber) ||
          item.itemNumber < 1 ||
          item.itemNumber > 30
        ) {
          throw new BadRequestException(
            `Número de casilla de calificación inválido (${String(item.itemNumber)}). Debe estar entre 1 y 30.`,
          );
        }
        let colMap = updatesByEnrollment.get(item.enrollmentId);
        if (!colMap) {
          colMap = new Map<number, number>();
          updatesByEnrollment.set(item.enrollmentId, colMap);
        }
        colMap.set(item.itemNumber, item.score);
        savedCount += 1;
      }

      for (const [enrollmentId, colMap] of updatesByEnrollment.entries()) {
        const entries = Array.from(colMap.entries());
        const colNames = entries.map(([num]) => GRADE_SCORE_COLUMNS[num - 1]);
        const colValues = entries.map(([, score]) => (score > 0 ? score : null));
        const baseParams: unknown[] = [
          schoolId.toString(),
          input.academicYear,
          enrollmentId,
          courseAssignmentId.toString(),
          periodId,
          input.periodNumber,
        ];
        const valuePlaceholders = colNames.map(
          (_, idx) => `$${baseParams.length + idx + 1}::numeric`,
        );
        const conflictUpdates = colNames
          .map((col) => `${col} = EXCLUDED.${col}`)
          .join(', ');

        const gradeRes = await client.query<
          { id: string } & Record<(typeof GRADE_SCORE_COLUMNS)[number], string | null>
        >(
          `INSERT INTO academic_grades (
             school_id, academic_year, enrollment_id, course_assignment_id,
             period_id, period_number, final_score, ${colNames.join(', ')}
           )
           VALUES ($1,$2,$3,$4,$5,$6,0,${valuePlaceholders.join(', ')})
           ON CONFLICT (school_id, academic_year, enrollment_id, course_assignment_id, period_number)
           DO UPDATE SET ${conflictUpdates}, updated_at = NOW()
           RETURNING id, ${GRADE_SCORE_RETURNING}`,
          [...baseParams, ...colValues],
        );

        const row = gradeRes.rows[0];
        let weightedSum = 0;
        let totalWeight = 0;
        let simpleSum = 0;
        let simpleCount = 0;
        for (let idx = 0; idx < GRADE_SCORE_COLUMNS.length; idx++) {
          const raw = row[GRADE_SCORE_COLUMNS[idx]];
          if (raw === null || raw === undefined) continue;
          const val = Number(raw);
          if (!Number.isFinite(val)) continue;
          const w = weightByCol.get(idx + 1) ?? 0;
          if (w > 0) {
            weightedSum += val * w;
            totalWeight += w;
          }
          simpleSum += val;
          simpleCount += 1;
        }

        const finalScore =
          totalWeight > 0
            ? Number((weightedSum / totalWeight).toFixed(2))
            : simpleCount > 0
              ? Number((simpleSum / simpleCount).toFixed(2))
              : 0;

        await client.query(
          `UPDATE academic_grades ag
              SET final_score = $4::numeric,
                  national_scale_id = (
                    SELECT gs.national_scale_id
                      FROM grading_scales gs
                     WHERE gs.school_id = ag.school_id
                       AND gs.academic_year = ag.academic_year
                       AND GREATEST($4::numeric, ag.recovery_score, ag.leveling_score)
                           BETWEEN gs.min_score AND gs.max_score
                       AND (gs.grade_group_id IS NULL OR gs.grade_group_id = $5::bigint)
                     ORDER BY (gs.grade_group_id IS NOT NULL AND gs.grade_group_id = $5::bigint) DESC, gs.grade_group_id NULLS LAST
                     LIMIT 1
                  ),
                  updated_at = NOW()
            WHERE ag.school_id = $1 AND ag.academic_year = $2 AND ag.id = $3`,
          [
            schoolId.toString(),
            input.academicYear,
            row.id,
            finalScore,
            gradeGroupId,
          ],
        );
      }

      return { savedCount };
    });
  }

  async createAchievementsMultiScale(
    schoolId: bigint,
    input: {
      gradeId: number;
      subjectId: number;
      dimensionId?: number | null;
      academicYear: number;
      periodNumber: number;
      indicatorType: string;
      variants: Array<{
        nationalScaleId?: number | null;
        code?: string | null;
        description: string;
      }>;
    },
  ): Promise<{ createdCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      let createdCount = 0;
      for (const v of input.variants) {
        if (!v.description.trim()) continue;
        await client.query(
          `INSERT INTO achievement_standards (
             school_id, grade_id, subject_id, dimension_id, national_scale_id,
             academic_year, period_number, code, indicator_type, description
           )
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            schoolId.toString(),
            input.gradeId,
            input.subjectId,
            input.dimensionId ?? null,
            v.nationalScaleId ?? null,
            input.academicYear,
            input.periodNumber,
            v.code ?? null,
            input.indicatorType,
            v.description.trim(),
          ],
        );
        createdCount += 1;
      }
      return { createdCount };
    });
  }

  async listCourseAssignedAchievements(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<GradeAchievementAssignedRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        academic_grade_id: string;
        enrollment_id: string;
        full_name: string;
        achievement_standard_id: string;
        code: string | null;
        indicator_type: string;
        description: string;
        scale_name: string | null;
      }>(
        `SELECT aga.id, aga.academic_grade_id, ag.enrollment_id,
                TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                aga.achievement_standard_id, ast.code, ast.indicator_type, ast.description,
                ngs.name AS scale_name
           FROM academic_grade_achievements aga
           INNER JOIN academic_grades ag
             ON ag.school_id = aga.school_id
            AND ag.academic_year = aga.academic_year
            AND ag.id = aga.academic_grade_id
           INNER JOIN student_enrollments se
             ON se.school_id = ag.school_id AND se.id = ag.enrollment_id
           INNER JOIN student_profiles sp
             ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           INNER JOIN achievement_standards ast
             ON ast.school_id = aga.school_id AND ast.id = aga.achievement_standard_id
           LEFT JOIN national_grading_scales ngs ON ngs.id = ast.national_scale_id
          WHERE ag.school_id = $1
            AND ag.academic_year = $2
            AND ag.course_assignment_id = $3
            AND ag.period_number = $4
          ORDER BY full_name, ast.indicator_type, ast.id`,
        [
          schoolId.toString(),
          academicYear,
          courseAssignmentId.toString(),
          periodNumber,
        ],
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        academicGradeId: Number(r.academic_grade_id),
        enrollmentId: Number(r.enrollment_id),
        studentFullName: r.full_name,
        achievementStandardId: Number(r.achievement_standard_id),
        code: r.code,
        indicatorType: r.indicator_type,
        description: r.description,
        nationalScaleName: r.scale_name,
      }));
    });
  }

  async assignAchievementsBatch(
    schoolId: bigint,
    input: {
      academicYear: number;
      academicGradeIds: number[];
      achievementStandardIds: number[];
    },
  ): Promise<{ assignedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      let assignedCount = 0;
      for (const gradeId of input.academicGradeIds) {
        for (const standardId of input.achievementStandardIds) {
          const ins = await client.query(
            `INSERT INTO academic_grade_achievements (
               school_id, academic_year, academic_grade_id, achievement_standard_id
             )
             VALUES ($1,$2,$3,$4)
             ON CONFLICT (school_id, academic_year, academic_grade_id, achievement_standard_id) DO NOTHING`,
            [schoolId.toString(), input.academicYear, gradeId, standardId],
          );
          assignedCount += ins.rowCount ?? 0;
        }
      }
      return { assignedCount };
    });
  }

  async unassignAchievement(
    schoolId: bigint,
    academicYear: number,
    linkId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM academic_grade_achievements
          WHERE school_id = $1 AND academic_year = $2 AND id = $3`,
        [schoolId.toString(), academicYear, linkId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException(
          'AcademicGradeAchievement',
          linkId.toString(),
        );
      }
    });
  }

  async syncCourseAchievements(
    schoolId: bigint,
    courseAssignmentId: bigint,
    input: { academicYear: number; periodNumber: number },
  ): Promise<{ syncedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const courseRes = await client.query<{
        grade_id: string;
        subject_id: string;
        grade_group_id: string | null;
      }>(
        `SELECT ca.grade_id, ca.subject_id, g.grade_group_id
           FROM course_assignments ca
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
          WHERE ca.school_id = $1 AND ca.id = $2`,
        [schoolId.toString(), courseAssignmentId.toString()],
      );
      if (courseRes.rowCount === 0) {
        throw new ResourceNotFoundException(
          'CourseAssignment',
          courseAssignmentId.toString(),
        );
      }
      const {
        grade_id: gradeId,
        subject_id: subjectId,
        grade_group_id: gradeGroupId,
      } = courseRes.rows[0];

      // Sincronizar primero national_scale_id según grading_scales institucional y grade_group_id del curso
      await client.query(
        `UPDATE academic_grades ag
            SET national_scale_id = (
              SELECT gs.national_scale_id
                FROM grading_scales gs
               WHERE gs.school_id = ag.school_id
                 AND gs.academic_year = ag.academic_year
                 AND ag.effective_score BETWEEN gs.min_score AND gs.max_score
                 AND (gs.grade_group_id IS NULL OR gs.grade_group_id = $5::bigint)
               ORDER BY (gs.grade_group_id IS NOT NULL AND gs.grade_group_id = $5::bigint) DESC, gs.grade_group_id NULLS LAST
               LIMIT 1
            )
          WHERE ag.school_id = $1
            AND ag.academic_year = $2
            AND ag.course_assignment_id = $3
            AND ag.period_number = $4`,
        [
          schoolId.toString(),
          input.academicYear,
          courseAssignmentId.toString(),
          input.periodNumber,
          gradeGroupId,
        ],
      );

      // Asociar logros activos que coincidan con la escala o sean generales (national_scale_id IS NULL)
      const insRes = await client.query(
        `INSERT INTO academic_grade_achievements (
           school_id, academic_year, academic_grade_id, achievement_standard_id
         )
         SELECT ag.school_id, ag.academic_year, ag.id, ast.id
           FROM academic_grades ag
           INNER JOIN achievement_standards ast
             ON ast.school_id = ag.school_id
            AND ast.academic_year = ag.academic_year
            AND ast.period_number = ag.period_number
            AND ast.grade_id = $5
            AND ast.subject_id = $6
            AND ast.is_active = TRUE
            AND (ast.national_scale_id IS NULL OR ast.national_scale_id = ag.national_scale_id)
          WHERE ag.school_id = $1
            AND ag.academic_year = $2
            AND ag.course_assignment_id = $3
            AND ag.period_number = $4
            AND ag.effective_score > 0
         ON CONFLICT (school_id, academic_year, academic_grade_id, achievement_standard_id) DO NOTHING`,
        [
          schoolId.toString(),
          input.academicYear,
          courseAssignmentId.toString(),
          input.periodNumber,
          gradeId,
          subjectId,
        ],
      );

      return { syncedCount: insRes.rowCount ?? 0 };
    });
  }

  async listPeriodicLevelings(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<TeacherLevelingListView> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const courseGroupRes = await client.query<{
        grade_group_id: string | null;
      }>(
        `SELECT g.grade_group_id
           FROM course_assignments ca
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
          WHERE ca.school_id = $1 AND ca.id = $2`,
        [schoolId.toString(), courseAssignmentId.toString()],
      );
      const rules = await this.getGradingRuleThresholds(
        client,
        schoolId,
        academicYear,
        courseGroupRes.rows[0]?.grade_group_id ?? null,
      );

      const res = await client.query<{
        enrollment_id: string;
        course_assignment_id: string;
        document_number: string;
        full_name: string;
        grade_name: string;
        group_code: string;
        subject_name: string;
        area_name: string;
        campus_name: string;
        period_number: number;
        final_score: string;
        recovery_score: string;
        recovery_date: string | null;
        act_number: string | null;
        observations: string | null;
      }>(
        `SELECT gr.enrollment_id, gr.course_assignment_id, sp.document_number,
                TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                g.name AS grade_name, ag.group_code, s.name AS subject_name,
                aa.name AS area_name, c.name AS campus_name, gr.period_number,
                gr.final_score, gr.recovery_score,
                prr.recovery_date::text, prr.act_number, prr.observations
           FROM academic_grades gr
           INNER JOIN student_enrollments se ON se.school_id = gr.school_id AND se.id = gr.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           INNER JOIN course_assignments ca ON ca.school_id = gr.school_id AND ca.id = gr.course_assignment_id
           INNER JOIN campuses c ON c.school_id = ca.school_id AND c.id = ca.campus_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN academic_areas aa ON aa.school_id = s.school_id AND aa.id = s.academic_area_id
           LEFT JOIN LATERAL (
             SELECT recovery_date, act_number, observations
               FROM period_recovery_records r
              WHERE r.school_id = gr.school_id
                AND r.academic_year = gr.academic_year
                AND r.enrollment_id = gr.enrollment_id
                AND r.course_assignment_id = gr.course_assignment_id
                AND r.period_number = gr.period_number
              ORDER BY r.id DESC
              LIMIT 1
           ) prr ON TRUE
          WHERE gr.school_id = $1
            AND gr.academic_year = $2
            AND gr.course_assignment_id = $3
            AND gr.period_number = $4
            AND gr.final_score < $5
          ORDER BY full_name`,
        [
          schoolId.toString(),
          academicYear,
          courseAssignmentId.toString(),
          periodNumber,
          rules.minPassingScore,
        ],
      );

      return {
        ...rules,
        rows: res.rows.map((r) => this.mapLevelingCandidate(r)),
      };
    });
  }

  async listFinalLevelings(
    schoolId: bigint,
    userId: bigint,
    role: string,
    academicYear: number,
  ): Promise<TeacherLevelingListView> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const rules = await this.getGradingRuleThresholds(
        client,
        schoolId,
        academicYear,
      );

      const params: unknown[] = [
        schoolId.toString(),
        academicYear,
        rules.minPassingScore,
      ];
      let teacherClause = '';
      if (role === 'TEACHER') {
        params.push(userId.toString());
        teacherClause = `AND tp.user_id = $${params.length}`;
      }

      const res = await client.query<{
        enrollment_id: string;
        course_assignment_id: string;
        document_number: string;
        full_name: string;
        grade_name: string;
        group_code: string;
        subject_name: string;
        area_name: string;
        campus_name: string;
        period_number: number;
        final_score: string;
        recovery_score: string;
        recovery_date: string | null;
        act_number: string | null;
        observations: string | null;
      }>(
        `SELECT gr.enrollment_id,
                gr.course_assignment_id,
                sp.document_number,
                TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                g.name AS grade_name,
                ag.group_code,
                s.name AS subject_name,
                aa.name AS area_name,
                c.name AS campus_name,
                MAX(gr.period_number) AS period_number,
                ROUND(AVG(gr.effective_score)::numeric, 2)::text AS final_score,
                COALESCE(MAX(prr.recovery_score), 0)::text AS recovery_score,
                MAX(prr.recovery_date::text) AS recovery_date,
                MAX(prr.act_number) AS act_number,
                MAX(prr.observations) AS observations
           FROM academic_grades gr
           INNER JOIN student_enrollments se ON se.school_id = gr.school_id AND se.id = gr.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           INNER JOIN course_assignments ca ON ca.school_id = gr.school_id AND ca.id = gr.course_assignment_id
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
           INNER JOIN campuses c ON c.school_id = ca.school_id AND c.id = ca.campus_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN academic_areas aa ON aa.school_id = s.school_id AND aa.id = s.academic_area_id
           LEFT JOIN period_recovery_records prr
             ON prr.school_id = gr.school_id
            AND prr.academic_year = gr.academic_year
            AND prr.enrollment_id = gr.enrollment_id
            AND prr.course_assignment_id = gr.course_assignment_id
            AND prr.recovery_type = 'FINAL_RECOVERY'
          WHERE gr.school_id = $1
            AND gr.academic_year = $2
            ${teacherClause}
          GROUP BY gr.enrollment_id, gr.course_assignment_id, sp.document_number,
                   sp.last_name, sp.second_last_name, sp.first_name,
                   g.name, ag.group_code, s.name, aa.name, c.name
          HAVING AVG(gr.effective_score) < $3
          ORDER BY g.name, ag.group_code, full_name`,
        params,
      );

      return {
        ...rules,
        rows: res.rows.map((r) => this.mapLevelingCandidate(r)),
      };
    });
  }

  async saveLevelingsBatch(
    schoolId: bigint,
    input: {
      academicYear: number;
      recoveryType: 'PERIOD_RECOVERY' | 'FINAL_RECOVERY';
      rows: Array<{
        enrollmentId: number;
        courseAssignmentId: number;
        periodNumber: number;
        previousScore: number;
        recoveryScore: number;
        recoveryDate?: string | null;
        actNumber?: string | null;
        observations?: string | null;
      }>;
    },
  ): Promise<{ savedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      let savedCount = 0;
      for (const row of input.rows) {
        const groupRes = await client.query<{ grade_group_id: string | null }>(
          `SELECT g.grade_group_id
             FROM course_assignments ca
             INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
            WHERE ca.school_id = $1 AND ca.id = $2`,
          [schoolId.toString(), row.courseAssignmentId],
        );
        const rules = await this.getGradingRuleThresholds(
          client,
          schoolId,
          input.academicYear,
          groupRes.rows[0]?.grade_group_id ?? null,
        );

        if (row.recoveryScore > 0) {
          if (row.recoveryScore < row.previousScore) {
            throw new BadRequestException(
              `La nota recuperada (${row.recoveryScore}) no puede ser menor a la nota perdida (${row.previousScore}).`,
            );
          }
          if (
            rules.maxRecoveryScore > 0 &&
            row.recoveryScore > rules.maxRecoveryScore
          ) {
            throw new BadRequestException(
              `La nota de nivelación (${row.recoveryScore}) excede el máximo institucional (${rules.maxRecoveryScore}).`,
            );
          }
        }

        // Actualizar registro previo si existe para evitar duplicación al editar nivelaciones
        const existingRec = await client.query<{ id: string }>(
          `SELECT id FROM period_recovery_records
            WHERE school_id = $1
              AND academic_year = $2
              AND enrollment_id = $3
              AND course_assignment_id = $4
              AND period_number = $5
              AND recovery_type = $6
            ORDER BY id DESC
            LIMIT 1`,
          [
            schoolId.toString(),
            input.academicYear,
            row.enrollmentId,
            row.courseAssignmentId,
            row.periodNumber,
            input.recoveryType,
          ],
        );

        if (existingRec.rowCount && existingRec.rowCount > 0) {
          await client.query(
            `UPDATE period_recovery_records
                SET act_number = $3,
                    previous_score = $4,
                    recovery_score = $5,
                    recovery_date = COALESCE($6::date, recovery_date),
                    observations = $7
              WHERE school_id = $1 AND id = $2`,
            [
              schoolId.toString(),
              existingRec.rows[0].id,
              row.actNumber ?? null,
              row.previousScore,
              row.recoveryScore,
              row.recoveryDate ?? null,
              row.observations ?? null,
            ],
          );
        } else {
          await client.query(
            `INSERT INTO period_recovery_records (
               school_id, academic_year, enrollment_id, course_assignment_id,
               period_number, act_number, previous_score, recovery_score,
               recovery_type, recovery_date, observations
             )
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, COALESCE($10::date, CURRENT_DATE), $11)`,
            [
              schoolId.toString(),
              input.academicYear,
              row.enrollmentId,
              row.courseAssignmentId,
              row.periodNumber,
              row.actNumber ?? null,
              row.previousScore,
              row.recoveryScore,
              input.recoveryType,
              row.recoveryDate ?? null,
              row.observations ?? null,
            ],
          );
        }

        if (input.recoveryType === 'PERIOD_RECOVERY') {
          await client.query(
            `UPDATE academic_grades
                SET recovery_score = $6, updated_at = NOW()
              WHERE school_id = $1
                AND academic_year = $2
                AND enrollment_id = $3
                AND course_assignment_id = $4
                AND period_number = $5`,
            [
              schoolId.toString(),
              input.academicYear,
              row.enrollmentId,
              row.courseAssignmentId,
              row.periodNumber,
              row.recoveryScore,
            ],
          );
        } else {
          await client.query(
            `UPDATE academic_grades
                SET leveling_score = $5, updated_at = NOW()
              WHERE school_id = $1
                AND academic_year = $2
                AND enrollment_id = $3
                AND course_assignment_id = $4`,
            [
              schoolId.toString(),
              input.academicYear,
              row.enrollmentId,
              row.courseAssignmentId,
              row.recoveryScore,
            ],
          );
        }
        savedCount += 1;
      }

      return { savedCount };
    });
  }

  async getObserverExtendedData(
    schoolId: bigint,
    enrollmentId: bigint,
  ): Promise<ObserverExtendedData> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        student_profile_id: string;
        additional_info: Record<string, unknown> | null;
      }>(
        `SELECT se.student_profile_id, sp.additional_info
           FROM student_enrollments se
           INNER JOIN student_profiles sp
             ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
          WHERE se.school_id = $1 AND se.id = $2`,
        [schoolId.toString(), enrollmentId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException(
          'StudentEnrollment',
          enrollmentId.toString(),
        );
      }
      const info = res.rows[0].additional_info ?? {};
      return {
        studentProfileId: Number(res.rows[0].student_profile_id),
        enrollmentId: Number(enrollmentId),
        observerModel5:
          (info['observerModel5'] as Record<string, unknown> | undefined) ?? {},
        observerModel3:
          (info['observerModel3'] as
            | Record<string, { p1?: string; p2?: string; p3?: string; p4?: string }>
            | undefined) ?? {},
      };
    });
  }

  async saveObserverExtendedData(
    schoolId: bigint,
    enrollmentId: bigint,
    input: {
      observerModel5?: Record<string, unknown>;
      observerModel3?: Record<
        string,
        { p1?: string; p2?: string; p3?: string; p4?: string }
      >;
    },
  ): Promise<ObserverExtendedData> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const enrRes = await client.query<{
        student_profile_id: string;
        additional_info: Record<string, unknown> | null;
      }>(
        `SELECT se.student_profile_id, sp.additional_info
           FROM student_enrollments se
           INNER JOIN student_profiles sp
             ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
          WHERE se.school_id = $1 AND se.id = $2`,
        [schoolId.toString(), enrollmentId.toString()],
      );
      if (enrRes.rowCount === 0) {
        throw new ResourceNotFoundException(
          'StudentEnrollment',
          enrollmentId.toString(),
        );
      }
      const current = enrRes.rows[0].additional_info ?? {};
      const merged: Record<string, unknown> = {
        ...current,
        ...(input.observerModel5 !== undefined
          ? { observerModel5: input.observerModel5 }
          : {}),
        ...(input.observerModel3 !== undefined
          ? { observerModel3: input.observerModel3 }
          : {}),
      };

      await client.query(
        `UPDATE student_profiles
            SET additional_info = $3::jsonb, updated_at = NOW()
          WHERE school_id = $1 AND id = $2`,
        [
          schoolId.toString(),
          enrRes.rows[0].student_profile_id,
          JSON.stringify(merged),
        ],
      );

      return {
        studentProfileId: Number(enrRes.rows[0].student_profile_id),
        enrollmentId: Number(enrollmentId),
        observerModel5:
          (merged['observerModel5'] as Record<string, unknown> | undefined) ?? {},
        observerModel3:
          (merged['observerModel3'] as
            | Record<string, { p1?: string; p2?: string; p3?: string; p4?: string }>
            | undefined) ?? {},
      };
    });
  }

  async listTrackingFormat(
    schoolId: bigint,
    academicGroupId: bigint,
    academicYear: number,
  ): Promise<StudentTrackingFormatRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        student_profile_id: string;
        enrollment_id: string;
        full_name: string;
        document_number: string;
        grade_name: string;
        group_code: string;
        shift_name: string;
        additional_info: Record<string, unknown> | null;
      }>(
        `SELECT se.student_profile_id,
                se.id AS enrollment_id,
                TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                sp.document_number,
                g.name AS grade_name,
                ag.group_code,
                ss.name AS shift_name,
                sp.additional_info
           FROM student_enrollments se
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
           INNER JOIN school_shifts ss ON ss.school_id = se.school_id AND ss.id = se.shift_id
          WHERE se.school_id = $1
            AND se.academic_group_id = $2
            AND se.academic_year = $3
          ORDER BY sp.last_name, sp.second_last_name, sp.first_name`,
        [schoolId.toString(), academicGroupId.toString(), academicYear],
      );

      const yearKey = String(academicYear);
      return res.rows.map((r) => {
        const tfByYear =
          (r.additional_info?.['trackingFormat'] as
            | Record<string, Record<string, unknown>>
            | undefined) ?? {};
        const tf = tfByYear[yearKey] ?? {};
        return {
          studentProfileId: Number(r.student_profile_id),
          enrollmentId: Number(r.enrollment_id),
          studentFullName: r.full_name,
          studentDocumentNumber: r.document_number,
          gradeName: r.grade_name,
          groupCode: r.group_code,
          shiftName: r.shift_name,
          observations: String(tf['observations'] ?? ''),
          pv: Boolean(tf['pv']),
          tv: Boolean(tf['tv']),
          gw: Boolean(tf['gw']),
          gf: Boolean(tf['gf']),
          otherAccess: Boolean(tf['otherAccess']),
          ee: Boolean(tf['ee']),
          internet: Boolean(tf['internet']),
          tvService: Boolean(tf['tvService']),
          mobileData: Boolean(tf['mobileData']),
        };
      });
    });
  }

  async saveTrackingFormatBatch(
    schoolId: bigint,
    academicYear: number,
    rows: Array<{
      studentProfileId: number;
      observations: string;
      pv: boolean;
      tv: boolean;
      gw: boolean;
      gf: boolean;
      otherAccess: boolean;
      ee: boolean;
      internet: boolean;
      tvService: boolean;
      mobileData: boolean;
    }>,
  ): Promise<{ savedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const yearKey = String(academicYear);
      let savedCount = 0;
      for (const row of rows) {
        const payload = {
          observations: row.observations,
          pv: row.pv,
          tv: row.tv,
          gw: row.gw,
          gf: row.gf,
          otherAccess: row.otherAccess,
          ee: row.ee,
          internet: row.internet,
          tvService: row.tvService,
          mobileData: row.mobileData,
        };
        const upd = await client.query(
          `UPDATE student_profiles
              SET additional_info = jsonb_set(
                    jsonb_set(COALESCE(additional_info, '{}'::jsonb), '{trackingFormat}', COALESCE(additional_info->'trackingFormat', '{}'::jsonb), true),
                    ARRAY['trackingFormat', $3],
                    $4::jsonb,
                    true
                  ),
                  updated_at = NOW()
            WHERE school_id = $1 AND id = $2`,
          [
            schoolId.toString(),
            row.studentProfileId,
            yearKey,
            JSON.stringify(payload),
          ],
        );
        savedCount += upd.rowCount ?? 0;
      }
      return { savedCount };
    });
  }

  private async getGradingRuleThresholds(
    client: import('pg').PoolClient,
    schoolId: bigint,
    academicYear: number,
    gradeGroupId: string | null = null,
  ): Promise<{ minPassingScore: number; maxRecoveryScore: number }> {
    const res = await client.query<{
      min_passing_score: string;
      max_recovery_score: string;
    }>(
      `SELECT min_passing_score, max_recovery_score
         FROM academic_grading_rules
        WHERE school_id = $1 AND academic_year = $2
        ORDER BY (grade_group_id IS NOT NULL AND grade_group_id = $3::bigint) DESC, id
        LIMIT 1`,
      [schoolId.toString(), academicYear, gradeGroupId],
    );
    return {
      minPassingScore: res.rows[0] ? Number(res.rows[0].min_passing_score) : 3.0,
      maxRecoveryScore: res.rows[0]
        ? Number(res.rows[0].max_recovery_score)
        : 3.0,
    };
  }

  private mapTeacherSelf(r: {
    id: string;
    document_number: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    second_last_name: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    signature_url: string | null;
  }): TeacherSelfProfile {
    return {
      id: Number(r.id),
      documentNumber: r.document_number,
      firstName: r.first_name,
      middleName: r.middle_name,
      lastName: r.last_name,
      secondLastName: r.second_last_name,
      fullName: [r.first_name, r.middle_name, r.last_name, r.second_last_name]
        .filter(Boolean)
        .join(' '),
      address: r.address,
      phone: r.phone,
      email: r.email,
      signatureUrl: r.signature_url,
    };
  }

  private mapLevelingCandidate(r: {
    enrollment_id: string;
    course_assignment_id: string;
    document_number: string;
    full_name: string;
    grade_name: string;
    group_code: string;
    subject_name: string;
    area_name: string;
    campus_name: string;
    period_number: number;
    final_score: string;
    recovery_score: string;
    recovery_date: string | null;
    act_number: string | null;
    observations: string | null;
  }): TeacherLevelingCandidateRow {
    return {
      enrollmentId: Number(r.enrollment_id),
      courseAssignmentId: Number(r.course_assignment_id),
      studentDocumentNumber: r.document_number,
      studentFullName: r.full_name,
      gradeName: r.grade_name,
      groupCode: r.group_code,
      subjectName: r.subject_name,
      academicAreaName: r.area_name,
      campusName: r.campus_name,
      periodNumber: Number(r.period_number),
      previousScore: Number(r.final_score),
      recoveryScore: Number(r.recovery_score),
      recoveryDate: r.recovery_date,
      actNumber: r.act_number,
      observations: r.observations,
    };
  }
}
