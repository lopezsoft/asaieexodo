import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  PromotionRecordView,
  PromotionRepositoryPort,
  PromotionStatusOption,
  StudentAcademicHistoryYear,
  YearCertificateHeadersRecord,
} from '../../domain/ports/promotion.repository.port';

@Injectable()
export class PostgresPromotionRepository extends PromotionRepositoryPort {
  constructor(private readonly postgres: PostgresRlsService) {
    super();
  }

  async listPromotionStatuses(): Promise<PromotionStatusOption[]> {
    return this.postgres.withTenantTransaction(1n, async (client) => {
      const result = await client.query<{
        id: string;
        status_code: number;
        grade_group_id: string | null;
        description: string;
        is_manual_promotion: boolean;
      }>(
        `SELECT id, status_code, grade_group_id, description, is_manual_promotion
           FROM promotion_statuses_catalog
          ORDER BY id`,
      );
      return result.rows.map((r) => ({
        id: Number(r.id),
        statusCode: Number(r.status_code),
        gradeGroupId: r.grade_group_id ? Number(r.grade_group_id) : null,
        description: r.description,
        isManualPromotion: r.is_manual_promotion,
      }));
    });
  }

  async listPromotionRecords(
    schoolId: bigint,
    academicYear: number,
    academicGroupId?: number,
  ): Promise<PromotionRecordView[]> {
    return this.postgres.withTenantTransaction(schoolId, async (client) =>
      this.queryPromotionRecords(client, schoolId, academicYear, academicGroupId),
    );
  }

  async generateFinalBook(
    schoolId: bigint,
    input: {
      academicYear: number;
      academicGroupId?: number;
      actNumber?: string | null;
    },
  ): Promise<{ processedCount: number; records: PromotionRecordView[] }> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      // Leer umbral mínimo de aprobación y límite de áreas reprobadas de la institución
      const ruleRes = await client.query<{
        min_passing_score: string;
        failed_areas_limit: number;
      }>(
        `SELECT min_passing_score, failed_areas_limit
           FROM academic_grading_rules
          WHERE school_id = $1 AND academic_year = $2
          ORDER BY id
          LIMIT 1`,
        [schoolId.toString(), input.academicYear],
      );
      const minPassingScore = ruleRes.rows[0]
        ? Number(ruleRes.rows[0].min_passing_score)
        : 3.0;
      const failedAreasLimit = ruleRes.rows[0]
        ? Number(ruleRes.rows[0].failed_areas_limit)
        : 3;

      const params: unknown[] = [schoolId.toString(), input.academicYear];
      let groupClause = '';
      if (input.academicGroupId) {
        params.push(input.academicGroupId);
        groupClause = `AND se.academic_group_id = $${params.length}`;
      }

      const enrollmentsRes = await client.query<{
        enrollment_id: string;
        academic_group_id: string;
        next_grade_code: string | null;
      }>(
        `SELECT se.id AS enrollment_id, se.academic_group_id, g.next_grade_code
           FROM student_enrollments se
           INNER JOIN grades g
             ON g.school_id = se.school_id AND g.id = se.grade_id
          WHERE se.school_id = $1
            AND se.academic_year = $2
            ${groupClause}
          ORDER BY se.academic_group_id, se.id`,
        params,
      );

      // Calcular promedios, reprobadas y faltas de cada matrícula secuencialmente (compatible pg@9)
      const computedRows: Array<{
        enrollmentId: number;
        academicGroupId: number;
        finalAverage: number;
        failedSubjectsCount: number;
        failedAreasCount: number;
        totalAbsences: number;
        isGraduated: boolean;
        promotionStatusId: number;
      }> = [];

      for (const enr of enrollmentsRes.rows) {
        const enrollmentId = Number(enr.enrollment_id);
        const subjRes = await client.query<{
          subject_id: string;
          academic_area_id: string;
          fails_school_year: boolean;
          avg_score: string;
          total_abs: string;
        }>(
          `SELECT ca.subject_id,
                  COALESCE(saa.academic_area_id, s.academic_area_id, 0) AS academic_area_id,
                  COALESCE(aa.fails_school_year, FALSE) AS fails_school_year,
                  ROUND(AVG(COALESCE(NULLIF(sc.recovery_score, 0), sc.final_score))::numeric, 2) AS avg_score,
                  COALESCE(SUM(sc.justified_absences + sc.unjustified_absences), 0) AS total_abs
             FROM academic_scores sc
             INNER JOIN course_assignments ca
               ON ca.school_id = sc.school_id AND ca.id = sc.course_assignment_id
             INNER JOIN subjects s
               ON s.school_id = ca.school_id AND s.id = ca.subject_id
              AND s.is_excluded_from_average = FALSE
             LEFT JOIN subject_area_assignments saa
               ON saa.school_id = sc.school_id
              AND saa.academic_year = sc.academic_year
              AND saa.subject_id = s.id
             LEFT JOIN academic_areas aa
               ON aa.school_id = s.school_id
              AND aa.id = COALESCE(saa.academic_area_id, s.academic_area_id)
            WHERE sc.school_id = $1
              AND sc.academic_year = $2
              AND sc.enrollment_id = $3
            GROUP BY ca.subject_id, COALESCE(saa.academic_area_id, s.academic_area_id, 0), COALESCE(aa.fails_school_year, FALSE)`,
          [schoolId.toString(), input.academicYear, enrollmentId],
        );

        let sumAvg = 0;
        let failedSubjects = 0;
        let totalAbsences = 0;
        const areaScores = new Map<
          number,
          { sum: number; count: number; failsYear: boolean }
        >();

        for (const sr of subjRes.rows) {
          const avg = Number(sr.avg_score);
          sumAvg += avg;
          totalAbsences += Number(sr.total_abs);
          if (avg < minPassingScore) {
            failedSubjects += 1;
          }
          const areaId = Number(sr.academic_area_id);
          const acc = areaScores.get(areaId) ?? {
            sum: 0,
            count: 0,
            failsYear: sr.fails_school_year,
          };
          acc.sum += avg;
          acc.count += 1;
          areaScores.set(areaId, acc);
        }

        const finalAverage =
          subjRes.rows.length > 0
            ? Number((sumAvg / subjRes.rows.length).toFixed(2))
            : 0;

        let failedAreas = 0;
        for (const areaInfo of areaScores.values()) {
          const areaAvg = areaInfo.sum / areaInfo.count;
          if (areaInfo.failsYear && areaAvg < minPassingScore) {
            failedAreas += 1;
          }
        }

        const isLastGrade = !enr.next_grade_code;
        let promotionStatusId = 1; // FUE PROMOVIDO(A) AL GRADO
        let isGraduated = false;

        if (failedAreas >= failedAreasLimit) {
          promotionStatusId = isLastGrade ? 6 : 3; // NO FUE GRADUADO / NO FUE PROMOVIDO
        } else if (failedAreas > 0) {
          promotionStatusId = isLastGrade ? 5 : 2; // PENDIENTE / PROMOVIDO CON DIFICULTAD
        } else if (isLastGrade) {
          promotionStatusId = 4; // FUE GRADUADO(A)
          isGraduated = true;
        }

        computedRows.push({
          enrollmentId,
          academicGroupId: Number(enr.academic_group_id),
          finalAverage,
          failedSubjectsCount: failedSubjects,
          failedAreasCount: failedAreas,
          totalAbsences,
          isGraduated,
          promotionStatusId,
        });
      }

      // Calcular puesto final dentro de cada grupo
      const byGroup = new Map<number, typeof computedRows>();
      for (const item of computedRows) {
        const list = byGroup.get(item.academicGroupId) ?? [];
        list.push(item);
        byGroup.set(item.academicGroupId, list);
      }

      for (const list of byGroup.values()) {
        list.sort((a, b) => b.finalAverage - a.finalAverage);
        for (let idx = 0; idx < list.length; idx += 1) {
          const row = list[idx];
          await client.query(
            `INSERT INTO promotion_records (
               school_id, enrollment_id, promotion_status_id, academic_year,
               act_number, final_average, failed_areas_count, failed_subjects_count,
               total_absences, group_rank, is_graduated
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (school_id, enrollment_id) DO UPDATE SET
               promotion_status_id = EXCLUDED.promotion_status_id,
               act_number = COALESCE(EXCLUDED.act_number, promotion_records.act_number),
               final_average = EXCLUDED.final_average,
               failed_areas_count = EXCLUDED.failed_areas_count,
               failed_subjects_count = EXCLUDED.failed_subjects_count,
               total_absences = EXCLUDED.total_absences,
               group_rank = EXCLUDED.group_rank,
               is_graduated = EXCLUDED.is_graduated,
               promoted_at = CURRENT_DATE`,
            [
              schoolId.toString(),
              row.enrollmentId,
              row.promotionStatusId,
              input.academicYear,
              input.actNumber ?? null,
              row.finalAverage,
              row.failedAreasCount,
              row.failedSubjectsCount,
              row.totalAbsences,
              idx + 1,
              row.isGraduated,
            ],
          );

          await client.query(
            `UPDATE student_enrollments
                SET promotion_status_id = $3, updated_at = NOW()
              WHERE school_id = $1 AND id = $2`,
            [schoolId.toString(), row.enrollmentId, row.promotionStatusId],
          );
        }
      }

      const records = await this.queryPromotionRecords(
        client,
        schoolId,
        input.academicYear,
        input.academicGroupId,
      );
      return { processedCount: computedRows.length, records };
    });
  }

  async updatePromotionRecord(
    schoolId: bigint,
    recordId: bigint,
    input: {
      promotionStatusId?: number;
      actNumber?: string | null;
      isGraduated?: boolean;
      diplomaNumber?: string | null;
      graduationFolio?: string | null;
      observations?: string | null;
    },
  ): Promise<PromotionRecordView> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        enrollment_id: string;
        academic_year: number;
        promotion_status_id: number;
      }>(
        `UPDATE promotion_records
            SET promotion_status_id = COALESCE($3, promotion_status_id),
                act_number = COALESCE($4, act_number),
                is_graduated = COALESCE($5, is_graduated),
                diploma_number = COALESCE($6, diploma_number),
                graduation_folio = COALESCE($7, graduation_folio),
                observations = COALESCE($8, observations)
          WHERE school_id = $1 AND id = $2
          RETURNING id, enrollment_id, academic_year, promotion_status_id`,
        [
          schoolId.toString(),
          recordId.toString(),
          input.promotionStatusId ?? null,
          input.actNumber !== undefined ? input.actNumber : null,
          input.isGraduated ?? null,
          input.diplomaNumber !== undefined ? input.diplomaNumber : null,
          input.graduationFolio !== undefined ? input.graduationFolio : null,
          input.observations !== undefined ? input.observations : null,
        ],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('PromotionRecord', recordId.toString());
      }

      const updated = res.rows[0];
      await client.query(
        `UPDATE student_enrollments
            SET promotion_status_id = $3, updated_at = NOW()
          WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), updated.enrollment_id, updated.promotion_status_id],
      );

      const list = await this.queryPromotionRecords(
        client,
        schoolId,
        updated.academic_year,
        undefined,
        Number(updated.id),
      );
      return list[0];
    });
  }

  async applyAdvancePromotion(
    schoolId: bigint,
    input: {
      enrollmentId: number;
      academicYear: number;
      promotionStatusId?: number;
      actNumber?: string | null;
      observations?: string | null;
      targetCampusId?: number;
      targetShiftId?: number;
      targetGradeId?: number;
      targetGroupId?: number;
    },
  ): Promise<PromotionRecordView> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      const enrCheck = await client.query<{ id: string }>(
        `SELECT id FROM student_enrollments WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), input.enrollmentId],
      );
      if (enrCheck.rowCount === 0) {
        throw new ResourceNotFoundException(
          'StudentEnrollment',
          String(input.enrollmentId),
        );
      }

      const statusId = input.promotionStatusId ?? 1;
      const upsertRes = await client.query<{ id: string }>(
        `INSERT INTO promotion_records (
           school_id, enrollment_id, promotion_status_id, academic_year,
           act_number, observations, promoted_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
         ON CONFLICT (school_id, enrollment_id) DO UPDATE SET
           promotion_status_id = EXCLUDED.promotion_status_id,
           act_number = COALESCE(EXCLUDED.act_number, promotion_records.act_number),
           observations = COALESCE(EXCLUDED.observations, promotion_records.observations),
           promoted_at = CURRENT_DATE
         RETURNING id`,
        [
          schoolId.toString(),
          input.enrollmentId,
          statusId,
          input.academicYear,
          input.actNumber ?? null,
          input.observations ?? 'Promoción anticipada aprobada por Consejo Académico',
        ],
      );

      if (
        input.targetCampusId &&
        input.targetShiftId &&
        input.targetGradeId &&
        input.targetGroupId
      ) {
        await client.query(
          `UPDATE student_enrollments
              SET campus_id = $3,
                  shift_id = $4,
                  grade_id = $5,
                  academic_group_id = $6,
                  promotion_status_id = $7,
                  updated_at = NOW()
            WHERE school_id = $1 AND id = $2`,
          [
            schoolId.toString(),
            input.enrollmentId,
            input.targetCampusId,
            input.targetShiftId,
            input.targetGradeId,
            input.targetGroupId,
            statusId,
          ],
        );
      } else {
        await client.query(
          `UPDATE student_enrollments
              SET promotion_status_id = $3, updated_at = NOW()
            WHERE school_id = $1 AND id = $2`,
          [schoolId.toString(), input.enrollmentId, statusId],
        );
      }

      const list = await this.queryPromotionRecords(
        client,
        schoolId,
        input.academicYear,
        undefined,
        Number(upsertRes.rows[0].id),
      );
      return list[0];
    });
  }

  async enrollReturningStudents(
    schoolId: bigint,
    input: {
      fromYear: number;
      toYear: number;
      enrollmentIds: number[];
      targetCampusId: number;
      targetShiftId: number;
      targetGradeId: number;
      targetGroupId: number;
    },
  ): Promise<{ enrolledCount: number; skippedCount: number }> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      const sourceRes = await client.query<{
        student_profile_id: string;
        promo_code: number | null;
      }>(
        `SELECT se.student_profile_id, psc.status_code AS promo_code
           FROM student_enrollments se
           LEFT JOIN promotion_statuses_catalog psc
             ON psc.id = se.promotion_status_id
          WHERE se.school_id = $1
            AND se.academic_year = $2
            AND se.id = ANY($3::bigint[])`,
        [schoolId.toString(), input.fromYear, input.enrollmentIds],
      );

      let enrolledCount = 0;
      let skippedCount = 0;

      for (const src of sourceRes.rows) {
        const isRepeating = src.promo_code === 3 || src.promo_code === 15;
        const insertRes = await client.query(
          `INSERT INTO student_enrollments (
             school_id, student_profile_id, campus_id, shift_id, grade_id,
             academic_group_id, academic_year, enrollment_status_id,
             is_repeating_grade, is_new_student
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, 2, $8, FALSE)
           ON CONFLICT (school_id, student_profile_id, academic_year, grade_id) DO NOTHING`,
          [
            schoolId.toString(),
            src.student_profile_id,
            input.targetCampusId,
            input.targetShiftId,
            input.targetGradeId,
            input.targetGroupId,
            input.toYear,
            isRepeating,
          ],
        );
        if ((insertRes.rowCount ?? 0) > 0) {
          enrolledCount += 1;
        } else {
          skippedCount += 1;
        }
      }

      return { enrolledCount, skippedCount };
    });
  }

  async getStudentAcademicHistory(
    schoolId: bigint,
    studentProfileId: bigint,
  ): Promise<StudentAcademicHistoryYear[]> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      const enrRes = await client.query<{
        enrollment_id: string;
        academic_year: number;
        campus_name: string;
        shift_name: string;
        grade_name: string;
        group_code: string;
        enrollment_status_name: string;
        promotion_desc: string | null;
        final_average: string | null;
        is_graduated: boolean | null;
        act_number: string | null;
        diploma_number: string | null;
      }>(
        `SELECT se.id AS enrollment_id,
                se.academic_year,
                c.name AS campus_name,
                ss.name AS shift_name,
                g.name AS grade_name,
                ag.group_code,
                es.name AS enrollment_status_name,
                psc.description AS promotion_desc,
                pr.final_average,
                pr.is_graduated,
                pr.act_number,
                pr.diploma_number
           FROM student_enrollments se
           INNER JOIN campuses c ON c.school_id = se.school_id AND c.id = se.campus_id
           INNER JOIN school_shifts ss ON ss.school_id = se.school_id AND ss.id = se.shift_id
           INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
           INNER JOIN enrollment_statuses es ON es.id = se.enrollment_status_id
           LEFT JOIN promotion_records pr
             ON pr.school_id = se.school_id AND pr.enrollment_id = se.id
           LEFT JOIN promotion_statuses_catalog psc
             ON psc.id = COALESCE(pr.promotion_status_id, se.promotion_status_id)
          WHERE se.school_id = $1 AND se.student_profile_id = $2
          ORDER BY se.academic_year DESC`,
        [schoolId.toString(), studentProfileId.toString()],
      );

      const history: StudentAcademicHistoryYear[] = [];
      for (const row of enrRes.rows) {
        const subjRes = await client.query<{
          subject_name: string;
          area_name: string;
          avg_score: string;
          periods_count: string;
        }>(
          `SELECT s.name AS subject_name,
                  COALESCE(aa.name, 'Sin área') AS area_name,
                  ROUND(AVG(COALESCE(NULLIF(gr.recovery_score, 0), gr.final_score))::numeric, 2) AS avg_score,
                  COUNT(*)::text AS periods_count
             FROM academic_scores gr
             INNER JOIN course_assignments ca
               ON ca.school_id = gr.school_id AND ca.id = gr.course_assignment_id
             INNER JOIN subjects s
               ON s.school_id = ca.school_id AND s.id = ca.subject_id
             LEFT JOIN subject_area_assignments saa
               ON saa.school_id = gr.school_id
              AND saa.academic_year = gr.academic_year
              AND saa.subject_id = s.id
             LEFT JOIN academic_areas aa
               ON aa.school_id = s.school_id
              AND aa.id = COALESCE(saa.academic_area_id, s.academic_area_id)
            WHERE gr.school_id = $1
              AND gr.academic_year = $2
              AND gr.enrollment_id = $3
            GROUP BY s.name, COALESCE(aa.name, 'Sin área')
            ORDER BY COALESCE(aa.name, 'Sin área'), s.name`,
          [schoolId.toString(), row.academic_year, row.enrollment_id],
        );

        history.push({
          academicYear: Number(row.academic_year),
          enrollmentId: Number(row.enrollment_id),
          campusName: row.campus_name,
          shiftName: row.shift_name,
          gradeName: row.grade_name,
          groupCode: row.group_code,
          enrollmentStatusName: row.enrollment_status_name,
          promotionStatusDescription: row.promotion_desc,
          finalAverage:
            row.final_average !== null ? Number(row.final_average) : null,
          isGraduated: Boolean(row.is_graduated),
          actNumber: row.act_number,
          diplomaNumber: row.diploma_number,
          subjects: subjRes.rows.map((s) => ({
            subjectName: s.subject_name,
            academicAreaName: s.area_name,
            averageScore: Number(s.avg_score),
            periodsCount: Number(s.periods_count),
          })),
        });
      }

      return history;
    });
  }

  async getCertificateHeaders(
    schoolId: bigint,
    academicYear: number,
  ): Promise<YearCertificateHeadersRecord> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        year: number;
        is_closed: boolean;
        certificate_settings: Record<string, unknown>;
        graduation_act_settings: Record<string, unknown>;
      }>(
        `SELECT year, is_closed, certificate_settings, graduation_act_settings
           FROM academic_years
          WHERE school_id = $1 AND year = $2`,
        [schoolId.toString(), academicYear],
      );
      if (res.rowCount === 0) {
        return {
          academicYear,
          isClosed: false,
          certificateSettings: {},
          graduationActSettings: {},
        };
      }
      return {
        academicYear: Number(res.rows[0].year),
        isClosed: res.rows[0].is_closed,
        certificateSettings: res.rows[0].certificate_settings ?? {},
        graduationActSettings: res.rows[0].graduation_act_settings ?? {},
      };
    });
  }

  async updateCertificateHeaders(
    schoolId: bigint,
    input: {
      academicYear: number;
      certificateSettings: Record<string, unknown>;
      graduationActSettings: Record<string, unknown>;
    },
  ): Promise<YearCertificateHeadersRecord> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        year: number;
        is_closed: boolean;
        certificate_settings: Record<string, unknown>;
        graduation_act_settings: Record<string, unknown>;
      }>(
        `INSERT INTO academic_years (
           school_id, year, certificate_settings, graduation_act_settings
         )
         VALUES ($1, $2, $3::jsonb, $4::jsonb)
         ON CONFLICT (school_id, year) DO UPDATE SET
           certificate_settings = EXCLUDED.certificate_settings,
           graduation_act_settings = EXCLUDED.graduation_act_settings,
           updated_at = NOW()
         RETURNING year, is_closed, certificate_settings, graduation_act_settings`,
        [
          schoolId.toString(),
          input.academicYear,
          JSON.stringify(input.certificateSettings),
          JSON.stringify(input.graduationActSettings),
        ],
      );
      return {
        academicYear: Number(res.rows[0].year),
        isClosed: res.rows[0].is_closed,
        certificateSettings: res.rows[0].certificate_settings ?? {},
        graduationActSettings: res.rows[0].graduation_act_settings ?? {},
      };
    });
  }

  async setAcademicYearClosedState(
    schoolId: bigint,
    academicYear: number,
    isClosed: boolean,
  ): Promise<{ academicYear: number; isClosed: boolean; periodsUpdated: number }> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      await client.query(
        `INSERT INTO academic_years (school_id, year, is_closed)
         VALUES ($1, $2, $3)
         ON CONFLICT (school_id, year) DO UPDATE SET
           is_closed = EXCLUDED.is_closed,
           updated_at = NOW()`,
        [schoolId.toString(), academicYear, isClosed],
      );

      const periodsRes = await client.query(
        `UPDATE academic_periods
            SET is_closed = $3,
                is_active = CASE WHEN $3 THEN FALSE ELSE is_active END
          WHERE school_id = $1 AND academic_year = $2`,
        [schoolId.toString(), academicYear, isClosed],
      );

      return {
        academicYear,
        isClosed,
        periodsUpdated: periodsRes.rowCount ?? 0,
      };
    });
  }

  private async queryPromotionRecords(
    client: PoolClient,
    schoolId: bigint,
    academicYear: number,
    academicGroupId?: number,
    recordId?: number,
  ): Promise<PromotionRecordView[]> {
    const params: unknown[] = [schoolId.toString(), academicYear];
    const clauses: string[] = [];
    if (academicGroupId) {
      params.push(academicGroupId);
      clauses.push(`AND se.academic_group_id = $${params.length}`);
    }
    if (recordId) {
      params.push(recordId);
      clauses.push(`AND pr.id = $${params.length}`);
    }

    const res = await client.query<{
      id: string;
      enrollment_id: string;
      student_profile_id: string;
      document_number: string;
      full_name: string;
      campus_name: string;
      grade_id: string;
      grade_name: string;
      academic_group_id: string;
      group_code: string;
      academic_year: number;
      promotion_status_id: number;
      status_code: number;
      status_description: string;
      act_number: string | null;
      final_average: string;
      failed_areas_count: number;
      failed_subjects_count: number;
      total_absences: number;
      group_rank: number | null;
      is_graduated: boolean;
      diploma_number: string | null;
      graduation_folio: string | null;
      observations: string | null;
      promoted_at: string | null;
    }>(
      `SELECT pr.id,
              pr.enrollment_id,
              se.student_profile_id,
              sp.document_number,
              TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
              c.name AS campus_name,
              se.grade_id,
              g.name AS grade_name,
              se.academic_group_id,
              ag.group_code,
              pr.academic_year,
              pr.promotion_status_id,
              psc.status_code,
              psc.description AS status_description,
              pr.act_number,
              pr.final_average,
              pr.failed_areas_count,
              pr.failed_subjects_count,
              pr.total_absences,
              pr.group_rank,
              pr.is_graduated,
              pr.diploma_number,
              pr.graduation_folio,
              pr.observations,
              pr.promoted_at::text AS promoted_at
         FROM promotion_records pr
         INNER JOIN student_enrollments se
           ON se.school_id = pr.school_id AND se.id = pr.enrollment_id
         INNER JOIN student_profiles sp
           ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
         INNER JOIN campuses c
           ON c.school_id = se.school_id AND c.id = se.campus_id
         INNER JOIN grades g
           ON g.school_id = se.school_id AND g.id = se.grade_id
         INNER JOIN academic_groups ag
           ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
         INNER JOIN promotion_statuses_catalog psc
           ON psc.id = pr.promotion_status_id
        WHERE pr.school_id = $1
          AND pr.academic_year = $2
          ${clauses.join(' ')}
        ORDER BY g.display_order, ag.group_code, pr.group_rank NULLS LAST, full_name`,
      params,
    );

    return res.rows.map((r) => ({
      id: Number(r.id),
      enrollmentId: Number(r.enrollment_id),
      studentProfileId: Number(r.student_profile_id),
      studentDocumentNumber: r.document_number,
      studentFullName: r.full_name,
      campusName: r.campus_name,
      gradeId: Number(r.grade_id),
      gradeName: r.grade_name,
      academicGroupId: Number(r.academic_group_id),
      groupCode: r.group_code,
      academicYear: Number(r.academic_year),
      promotionStatusId: Number(r.promotion_status_id),
      promotionStatusCode: Number(r.status_code),
      promotionStatusDescription: r.status_description,
      actNumber: r.act_number,
      finalAverage: Number(r.final_average),
      failedAreasCount: Number(r.failed_areas_count),
      failedSubjectsCount: Number(r.failed_subjects_count),
      totalAbsences: Number(r.total_absences),
      groupRank: r.group_rank !== null ? Number(r.group_rank) : null,
      isGraduated: r.is_graduated,
      diplomaNumber: r.diploma_number,
      graduationFolio: r.graduation_folio,
      observations: r.observations,
      promotedAt: r.promoted_at,
    }));
  }
}
