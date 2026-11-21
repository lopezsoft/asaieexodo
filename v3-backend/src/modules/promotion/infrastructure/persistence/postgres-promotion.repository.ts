import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { EnrollmentNumberingService } from '../../../academic/application/services/enrollment-numbering.service';
import {
  CloseAcademicYearResult,
  FinalSabanaReport,
  FinalSabanaStudentRow,
  FinalSabanaSubjectColumn,
  PromotionRecordView,
  PromotionRepositoryPort,
  PromotionStatusOption,
  StudentAcademicHistoryYear,
  YearCertificateHeadersRecord,
} from '../../domain/ports/promotion.repository.port';
import {
  PromotionEvaluationEngineService,
  PromotionEvaluationOutput,
  SieePromotionRuleConfig,
  StudentSubjectAnnualInput,
} from '../../domain/services/promotion-evaluation-engine.service';

interface ActiveEnrollmentRow {
  enrollment_id: string;
  student_profile_id: string;
  document_number: string;
  full_name: string;
  academic_group_id: string;
  group_code: string;
  grade_id: string;
  grade_name: string;
  grade_group_id: string | null;
  is_cycle_end: boolean;
  next_grade_code: string | null;
  next_grade_name: string | null;
}

interface AnnualSubjectRow {
  enrollment_id: string;
  subject_id: string;
  subject_name: string;
  subject_abbreviation: string | null;
  academic_area_id: string;
  academic_area_name: string;
  course_assignment_id: string;
  teacher_profile_id: string | null;
  area_weight_percentage: string;
  weekly_hours: string;
  is_excluded_from_average: boolean;
  is_elective: boolean;
  area_fails_school_year: boolean;
  annual_score: string;
  final_recovery_score: string | null;
  final_effective_score: string;
  failing_max_score: string;
  total_absences: string;
}

@Injectable()
export class PostgresPromotionRepository extends PromotionRepositoryPort {
  constructor(
    private readonly postgres: PostgresRlsService,
    private readonly evaluationEngine: PromotionEvaluationEngineService,
    private readonly enrollmentNumbering: EnrollmentNumberingService,
  ) {
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
      const evaluated = await this.evaluateCohortForYear(
        client,
        schoolId,
        input.academicYear,
        input.academicGroupId,
      );

      if (evaluated.length === 0) {
        const records = await this.queryPromotionRecords(
          client,
          schoolId,
          input.academicYear,
          input.academicGroupId,
        );
        return { processedCount: 0, records };
      }

      // Calcular puesto final dentro de cada grupo con desempate determinístico
      const byGroup = new Map<number, typeof evaluated>();
      for (const item of evaluated) {
        const list = byGroup.get(item.academicGroupId) ?? [];
        list.push(item);
        byGroup.set(item.academicGroupId, list);
      }

      const rankedRows: Array<
        (typeof evaluated)[number] & { readonly groupRank: number }
      > = [];

      for (const list of byGroup.values()) {
        list.sort((a, b) => {
          const scoreB =
            b.evaluation.recoveryAverage > 0
              ? b.evaluation.recoveryAverage
              : b.evaluation.finalAverage;
          const scoreA =
            a.evaluation.recoveryAverage > 0
              ? a.evaluation.recoveryAverage
              : a.evaluation.finalAverage;
          if (scoreB !== scoreA) return scoreB - scoreA;
          if (a.evaluation.failedAreasCount !== b.evaluation.failedAreasCount) {
            return a.evaluation.failedAreasCount - b.evaluation.failedAreasCount;
          }
          if (b.evaluation.finalAverage !== a.evaluation.finalAverage) {
            return b.evaluation.finalAverage - a.evaluation.finalAverage;
          }
          return a.studentFullName.localeCompare(b.studentFullName, 'es');
        });
        for (let idx = 0; idx < list.length; idx += 1) {
          rankedRows.push({ ...list[idx], groupRank: idx + 1 });
        }
      }

      // Persistencia set-based en 2 queries (0 N+1) protegiendo `is_commission_promoted = TRUE`
      const enrollmentIds = rankedRows.map((r) => r.enrollmentId);
      const statusIds = rankedRows.map((r) => r.evaluation.promotionStatusId);
      const finalAvgs = rankedRows.map((r) => r.evaluation.finalAverage);
      const recoveryAvgs = rankedRows.map((r) => r.evaluation.recoveryAverage);
      const passedAreas = rankedRows.map((r) => r.evaluation.passedAreasCount);
      const failedAreas = rankedRows.map((r) => r.evaluation.failedAreasCount);
      const failedSubjects = rankedRows.map(
        (r) => r.evaluation.failedSubjectsCount,
      );
      const absences = rankedRows.map((r) => r.evaluation.totalAbsences);
      const ranks = rankedRows.map((r) => r.groupRank);
      const graduatedFlags = rankedRows.map((r) => r.evaluation.isGraduated);
      const messagesJson = rankedRows.map((r) =>
        JSON.stringify(r.evaluation.promotionMessages),
      );

      await client.query(
        `INSERT INTO promotion_records (
           school_id, enrollment_id, promotion_status_id, academic_year,
           act_number, final_average, recovery_average, passed_areas_count,
           failed_areas_count, failed_subjects_count, total_absences,
           group_rank, is_graduated, promotion_messages, promoted_at, updated_at
         )
         SELECT $1::bigint,
                u.enrollment_id,
                u.promotion_status_id,
                $2::smallint,
                $3::varchar,
                u.final_average,
                u.recovery_average,
                u.passed_areas_count,
                u.failed_areas_count,
                u.failed_subjects_count,
                u.total_absences,
                u.group_rank,
                u.is_graduated,
                u.promotion_messages::jsonb,
                CURRENT_DATE,
                NOW()
           FROM UNNEST(
                  $4::bigint[],
                  $5::smallint[],
                  $6::numeric[],
                  $7::numeric[],
                  $8::smallint[],
                  $9::smallint[],
                  $10::smallint[],
                  $11::integer[],
                  $12::smallint[],
                  $13::boolean[],
                  $14::text[]
                ) AS u(
                  enrollment_id,
                  promotion_status_id,
                  final_average,
                  recovery_average,
                  passed_areas_count,
                  failed_areas_count,
                  failed_subjects_count,
                  total_absences,
                  group_rank,
                  is_graduated,
                  promotion_messages
                )
         ON CONFLICT (school_id, enrollment_id) DO UPDATE SET
           promotion_status_id = EXCLUDED.promotion_status_id,
           act_number = COALESCE(EXCLUDED.act_number, promotion_records.act_number),
           final_average = EXCLUDED.final_average,
           recovery_average = EXCLUDED.recovery_average,
           passed_areas_count = EXCLUDED.passed_areas_count,
           failed_areas_count = EXCLUDED.failed_areas_count,
           failed_subjects_count = EXCLUDED.failed_subjects_count,
           total_absences = EXCLUDED.total_absences,
           group_rank = EXCLUDED.group_rank,
           is_graduated = EXCLUDED.is_graduated,
           promotion_messages = EXCLUDED.promotion_messages,
           promoted_at = CURRENT_DATE,
           updated_at = NOW()
         WHERE promotion_records.is_commission_promoted = FALSE`,
        [
          schoolId.toString(),
          input.academicYear,
          input.actNumber ?? null,
          enrollmentIds,
          statusIds,
          finalAvgs,
          recoveryAvgs,
          passedAreas,
          failedAreas,
          failedSubjects,
          absences,
          ranks,
          graduatedFlags,
          messagesJson,
        ],
      );

      // Sincronizar `student_enrollments.promotion_status_id` respetando bloqueos de comisión
      await client.query(
        `UPDATE student_enrollments se
            SET promotion_status_id = pr.promotion_status_id,
                updated_at = NOW()
           FROM promotion_records pr
          WHERE se.school_id = $1
            AND pr.school_id = se.school_id
            AND pr.enrollment_id = se.id
            AND se.id = ANY($2::bigint[])`,
        [schoolId.toString(), enrollmentIds],
      );

      const records = await this.queryPromotionRecords(
        client,
        schoolId,
        input.academicYear,
        input.academicGroupId,
      );
      return { processedCount: rankedRows.length, records };
    });
  }

  async generateFinalRecoveries(
    schoolId: bigint,
    input: {
      academicYear: number;
      academicGroupId?: number;
    },
  ): Promise<{
    eligibleStudentsCount: number;
    generatedRecordsCount: number;
    skippedExistingCount: number;
  }> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      const evaluated = await this.evaluateCohortForYear(
        client,
        schoolId,
        input.academicYear,
        input.academicGroupId,
      );

      const eligible = evaluated.filter(
        (item) => item.evaluation.isEligibleForFinalRecovery,
      );
      if (eligible.length === 0) {
        return {
          eligibleStudentsCount: 0,
          generatedRecordsCount: 0,
          skippedExistingCount: 0,
        };
      }

      // Cargar existentes para garantizar idempotencia por (enrollment_id, course_assignment_id)
      const eligibleIds = eligible.map((e) => e.enrollmentId);
      const existingRes = await client.query<{
        enrollment_id: string;
        course_assignment_id: string;
      }>(
        `SELECT enrollment_id, course_assignment_id
           FROM period_recovery_records
          WHERE school_id = $1
            AND academic_year = $2
            AND recovery_type = 'FINAL_RECOVERY'
            AND enrollment_id = ANY($3::bigint[])`,
        [schoolId.toString(), input.academicYear, eligibleIds],
      );
      const existingKeys = new Set(
        existingRes.rows.map(
          (r) => `${r.enrollment_id}:${r.course_assignment_id}`,
        ),
      );

      // Mapear docente responsable de cada course_assignment para consecutivo de actas
      const candidateCourseIds = new Set<number>();
      for (const item of eligible) {
        for (const area of item.evaluation.areas) {
          for (const subj of area.subjects) {
            if (subj.isFailedPreRecovery && subj.courseAssignmentId) {
              candidateCourseIds.add(subj.courseAssignmentId);
            }
          }
        }
      }

      const teacherByCourse = new Map<number, number>();
      if (candidateCourseIds.size > 0) {
        const caRes = await client.query<{
          id: string;
          teacher_profile_id: string;
        }>(
          `SELECT id, teacher_profile_id
             FROM course_assignments
            WHERE school_id = $1 AND id = ANY($2::bigint[])`,
          [schoolId.toString(), Array.from(candidateCourseIds)],
        );
        for (const r of caRes.rows) {
          teacherByCourse.set(Number(r.id), Number(r.teacher_profile_id));
        }
      }

      let generatedRecordsCount = 0;
      let skippedExistingCount = 0;

      for (const item of eligible) {
        for (const area of item.evaluation.areas) {
          for (const subj of area.subjects) {
            if (!subj.isFailedPreRecovery || !subj.courseAssignmentId) {
              continue;
            }
            const key = `${item.enrollmentId}:${subj.courseAssignmentId}`;
            if (existingKeys.has(key)) {
              skippedExistingCount += 1;
              continue;
            }

            const teacherId = teacherByCourse.get(subj.courseAssignmentId) ?? 0;
            const docType = `FINAL_RECOVERY_ACT_T_${teacherId}`;
            const seqRes = await client.query<{ last_number: number }>(
              `INSERT INTO document_number_sequences (
                 school_id, academic_year, document_type, last_number, updated_at
               )
               VALUES ($1, $2, $3, 1, NOW())
               ON CONFLICT (school_id, academic_year, document_type)
               DO UPDATE SET last_number = document_number_sequences.last_number + 1,
                             updated_at = NOW()
               RETURNING last_number`,
              [schoolId.toString(), input.academicYear, docType],
            );
            const actNumber = `${input.academicYear}-${String(seqRes.rows[0].last_number).padStart(4, '0')}`;

            await client.query(
              `INSERT INTO period_recovery_records (
                 school_id, academic_year, enrollment_id, course_assignment_id,
                 period_number, act_number, previous_score, recovery_score,
                 recovery_type, observations, status, updated_at
               )
               VALUES ($1, $2, $3, $4, NULL, $5, $6, 0, 'FINAL_RECOVERY', $7, 1, NOW())`,
              [
                schoolId.toString(),
                input.academicYear,
                item.enrollmentId,
                subj.courseAssignmentId,
                actNumber,
                subj.annualScore,
                `Habilitación final generada automáticamente bajo SIEE (${area.academicAreaName})`,
              ],
            );
            existingKeys.add(key);
            generatedRecordsCount += 1;
          }
        }
      }

      return {
        eligibleStudentsCount: eligible.length,
        generatedRecordsCount,
        skippedExistingCount,
      };
    });
  }

  async getFinalSabana(
    schoolId: bigint,
    academicYear: number,
    academicGroupId?: number,
  ): Promise<FinalSabanaReport> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      const evaluated = await this.evaluateCohortForYear(
        client,
        schoolId,
        academicYear,
        academicGroupId,
      );

      // Cargar actas existentes de promoción para reflejar estado oficial y comisión
      const enrIds = evaluated.map((e) => e.enrollmentId);
      const promoByEnrollment = new Map<
        number,
        {
          statusDescription: string | null;
          groupRank: number | null;
          isCommissionPromoted: boolean;
        }
      >();

      if (enrIds.length > 0) {
        const promoRes = await client.query<{
          enrollment_id: string;
          status_description: string | null;
          group_rank: number | null;
          is_commission_promoted: boolean;
        }>(
          `SELECT pr.enrollment_id,
                  psc.description AS status_description,
                  pr.group_rank,
                  pr.is_commission_promoted
             FROM promotion_records pr
             LEFT JOIN promotion_statuses_catalog psc ON psc.id = pr.promotion_status_id
            WHERE pr.school_id = $1
              AND pr.academic_year = $2
              AND pr.enrollment_id = ANY($3::bigint[])`,
          [schoolId.toString(), academicYear, enrIds],
        );
        for (const r of promoRes.rows) {
          promoByEnrollment.set(Number(r.enrollment_id), {
            statusDescription: r.status_description,
            groupRank: r.group_rank !== null ? Number(r.group_rank) : null,
            isCommissionPromoted: Boolean(r.is_commission_promoted),
          });
        }
      }

      const subjectMap = new Map<number, FinalSabanaSubjectColumn>();
      const students: FinalSabanaStudentRow[] = [];

      for (const item of evaluated) {
        const scoresBySubject: FinalSabanaStudentRow['scoresBySubject'] = {};
        for (const subjMeta of item.subjectMetaList) {
          if (!subjectMap.has(subjMeta.subjectId)) {
            subjectMap.set(subjMeta.subjectId, {
              subjectId: subjMeta.subjectId,
              subjectName: subjMeta.subjectName,
              abbreviation: subjMeta.abbreviation,
              academicAreaId: subjMeta.academicAreaId,
              academicAreaName: subjMeta.academicAreaName,
              weeklyHours: subjMeta.weeklyHours,
            });
          }
        }
        for (const area of item.evaluation.areas) {
          for (const subj of area.subjects) {
            scoresBySubject[subj.subjectId] = {
              annualScore: subj.annualScore,
              finalRecoveryScore: subj.finalRecoveryScore,
              finalEffectiveScore: subj.finalEffectiveScore,
              isFailed: subj.isFailedPostRecovery,
            };
          }
        }

        const promo = promoByEnrollment.get(item.enrollmentId);
        students.push({
          enrollmentId: item.enrollmentId,
          studentProfileId: item.studentProfileId,
          studentDocumentNumber: item.studentDocumentNumber,
          studentFullName: item.studentFullName,
          groupCode: item.groupCode,
          gradeName: item.gradeName,
          finalAverage: item.evaluation.finalAverage,
          recoveryAverage: item.evaluation.recoveryAverage,
          passedAreasCount: item.evaluation.passedAreasCount,
          failedAreasCount: item.evaluation.failedAreasCount,
          failedSubjectsCount: item.evaluation.failedSubjectsCount,
          groupRank: promo?.groupRank ?? null,
          promotionStatusDescription:
            promo?.statusDescription ??
            item.evaluation.promotionMessages.statusText,
          isCommissionPromoted: promo?.isCommissionPromoted ?? false,
          scoresBySubject,
        });
      }

      const subjects = Array.from(subjectMap.values()).sort(
        (a, b) =>
          a.academicAreaName.localeCompare(b.academicAreaName, 'es') ||
          a.subjectName.localeCompare(b.subjectName, 'es'),
      );

      return {
        academicYear,
        academicGroupId: academicGroupId ?? null,
        subjects,
        students,
      };
    });
  }

  async updatePromotionRecord(
    schoolId: bigint,
    recordId: bigint,
    input: {
      promotionStatusId?: number;
      actNumber?: string | null;
      isCommissionPromoted?: boolean;
      isGraduated?: boolean;
      diplomaNumber?: string | null;
      graduationFolio?: string | null;
      observations?: string | null;
    },
  ): Promise<PromotionRecordView> {
    return this.postgres.withTenantTransaction(schoolId, async (client) => {
      // Proteger promoción por comisión (paridad trigger legacy `acta_promocion_before_update`)
      const currentRes = await client.query<{
        id: string;
        enrollment_id: string;
        academic_year: number;
        promotion_status_id: number;
        is_commission_promoted: boolean;
        promotion_messages: Record<string, unknown>;
        next_grade_code: string | null;
      }>(
        `SELECT pr.id,
                pr.enrollment_id,
                pr.academic_year,
                pr.promotion_status_id,
                pr.is_commission_promoted,
                pr.promotion_messages,
                g.next_grade_code
           FROM promotion_records pr
           INNER JOIN student_enrollments se
             ON se.school_id = pr.school_id AND se.id = pr.enrollment_id
           INNER JOIN grades g
             ON g.school_id = se.school_id AND g.id = se.grade_id
          WHERE pr.school_id = $1 AND pr.id = $2
          FOR UPDATE OF pr`,
        [schoolId.toString(), recordId.toString()],
      );

      if (currentRes.rowCount === 0) {
        throw new ResourceNotFoundException('PromotionRecord', recordId.toString());
      }

      const current = currentRes.rows[0];
      if (current.is_commission_promoted && input.isCommissionPromoted === false) {
        throw new DomainException(
          'COMMISSION_PROMOTION_LOCKED',
          'No está permitido revertir un acta marcada como promovida por Comisión de Evaluación y Promoción.',
        );
      }

      const nextCommissionFlag =
        input.isCommissionPromoted !== undefined
          ? input.isCommissionPromoted
          : current.is_commission_promoted;

      let effectiveStatusId = input.promotionStatusId ?? current.promotion_status_id;
      let effectiveGraduated = input.isGraduated ?? null;
      const updatedMessages: Record<string, unknown> = {
        ...(current.promotion_messages ?? {}),
      };

      if (input.isCommissionPromoted === true) {
        const isLastGrade = !current.next_grade_code;
        if (!input.promotionStatusId) {
          effectiveStatusId = isLastGrade ? 4 : 1;
        }
        if (effectiveGraduated === null && isLastGrade) {
          effectiveGraduated = true;
        }
        updatedMessages['statusText'] = isLastGrade
          ? 'FUE GRADUADO(A) POR COMISIÓN DE EVALUACIÓN Y PROMOCIÓN'
          : 'FUE PROMOVIDO(A) AL SIGUIENTE GRADO POR COMISIÓN DE EVALUACIÓN Y PROMOCIÓN';
        updatedMessages['commissionMessage'] =
          input.observations ??
          'Promoción otorgada mediante acta de Comisión de Evaluación y Promoción.';
      }

      const res = await client.query<{
        id: string;
        enrollment_id: string;
        academic_year: number;
        promotion_status_id: number;
      }>(
        `UPDATE promotion_records
            SET promotion_status_id = $3,
                act_number = COALESCE($4, act_number),
                is_commission_promoted = $5,
                is_graduated = COALESCE($6, is_graduated),
                diploma_number = COALESCE($7, diploma_number),
                graduation_folio = COALESCE($8, graduation_folio),
                observations = COALESCE($9, observations),
                promotion_messages = $10::jsonb,
                updated_at = NOW()
          WHERE school_id = $1 AND id = $2
          RETURNING id, enrollment_id, academic_year, promotion_status_id`,
        [
          schoolId.toString(),
          recordId.toString(),
          effectiveStatusId,
          input.actNumber !== undefined ? input.actNumber : null,
          nextCommissionFlag,
          effectiveGraduated,
          input.diplomaNumber !== undefined ? input.diplomaNumber : null,
          input.graduationFolio !== undefined ? input.graduationFolio : null,
          input.observations !== undefined ? input.observations : null,
          JSON.stringify(updatedMessages),
        ],
      );

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
      const enrRes = await client.query<{
        id: string;
        student_profile_id: string;
        campus_id: string;
        shift_id: string;
        grade_id: string;
        academic_group_id: string;
        character_id: number | null;
        specialty_id: number | null;
      }>(
        `SELECT id, student_profile_id, campus_id, shift_id, grade_id,
                academic_group_id, character_id, specialty_id
           FROM student_enrollments
          WHERE school_id = $1 AND id = $2
          FOR UPDATE`,
        [schoolId.toString(), input.enrollmentId],
      );
      if (enrRes.rowCount === 0) {
        throw new ResourceNotFoundException(
          'StudentEnrollment',
          String(input.enrollmentId),
        );
      }

      const source = enrRes.rows[0];
      const statusId = input.promotionStatusId ?? 1;
      const obsText =
        input.observations ??
        'Promoción anticipada aprobada por Consejo Académico (Decreto 1290 Art. 7)';

      const hasTargetPlacement = Boolean(
        input.targetCampusId &&
          input.targetShiftId &&
          input.targetGradeId &&
          input.targetGroupId,
      );
      const isCrossGradePromotion =
        hasTargetPlacement && Number(source.grade_id) !== input.targetGradeId;

      let newEnrollmentId: number | null = null;

      if (isCrossGradePromotion) {
        // 1. Marcar matrícula original como Promovida (estado 3 + is_promoted = TRUE) sin destruir histórico
        await client.query(
          `UPDATE student_enrollments
              SET enrollment_status_id = 3,
                  is_promoted = TRUE,
                  promotion_status_id = $3,
                  updated_at = NOW()
            WHERE school_id = $1 AND id = $2`,
          [schoolId.toString(), source.id, statusId],
        );

        // 2. Crear nueva matrícula en el grado destino con numeración legal (libro/folio) y control de acceso
        const numbering = await this.enrollmentNumbering.allocateNextNumbers(
          client,
          schoolId,
          input.academicYear,
        );

        const newEnrRes = await client.query<{ id: string }>(
          `INSERT INTO student_enrollments (
             school_id, student_profile_id, campus_id, shift_id, grade_id,
             academic_group_id, character_id, specialty_id,
             enrollment_status_id, academic_year,
             registration_number, book_number, folio_number,
             is_promoted, is_repeating_grade, is_new_student, observations
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 2, $9, $10, $11, $12, FALSE, FALSE, FALSE, $13)
           ON CONFLICT (school_id, student_profile_id, academic_year, grade_id)
           DO UPDATE SET
             campus_id = EXCLUDED.campus_id,
             shift_id = EXCLUDED.shift_id,
             academic_group_id = EXCLUDED.academic_group_id,
             enrollment_status_id = 2,
             updated_at = NOW()
           RETURNING id`,
          [
            schoolId.toString(),
            source.student_profile_id,
            input.targetCampusId,
            input.targetShiftId,
            input.targetGradeId,
            input.targetGroupId,
            source.character_id,
            source.specialty_id,
            input.academicYear,
            numbering.registrationNumber,
            numbering.bookNumber,
            numbering.folioNumber,
            `Matrícula por promoción anticipada desde matrícula #${source.id}`,
          ],
        );
        newEnrollmentId = Number(newEnrRes.rows[0].id);
        await this.enrollmentNumbering.ensureAccessControl(
          client,
          schoolId,
          newEnrollmentId,
        );

        // 3. Registrar cabecera 3NF `advance_promotions` + detalle de asignaturas P1
        const advRes = await client.query<{ id: string }>(
          `INSERT INTO advance_promotions (
             school_id, academic_year, previous_enrollment_id, new_enrollment_id,
             act_number, promotion_date, certificate_texts
           )
           VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6::jsonb)
           ON CONFLICT (school_id, previous_enrollment_id)
           DO UPDATE SET
             new_enrollment_id = EXCLUDED.new_enrollment_id,
             act_number = COALESCE(EXCLUDED.act_number, advance_promotions.act_number),
             promotion_date = CURRENT_DATE,
             certificate_texts = EXCLUDED.certificate_texts
           RETURNING id`,
          [
            schoolId.toString(),
            input.academicYear,
            source.id,
            newEnrollmentId,
            input.actNumber ?? null,
            JSON.stringify({ observations: obsText }),
          ],
        );
        const advancePromotionId = Number(advRes.rows[0].id);

        // Preservar calificaciones P1 en `advance_promotion_subject_details`
        await client.query(
          `DELETE FROM advance_promotion_subject_details
            WHERE school_id = $1 AND advance_promotion_id = $2`,
          [schoolId.toString(), advancePromotionId],
        );
        await client.query(
          `INSERT INTO advance_promotion_subject_details (
             school_id, advance_promotion_id, subject_id, period_number, score, absences
           )
           SELECT $1::bigint,
                  $2::bigint,
                  ca.subject_id,
                  sc.period_number,
                  GREATEST(COALESCE(sc.recovery_score, 0), sc.final_score),
                  (sc.justified_absences + sc.unjustified_absences)::smallint
             FROM academic_scores sc
             INNER JOIN course_assignments ca
               ON ca.school_id = sc.school_id AND ca.id = sc.course_assignment_id
            WHERE sc.school_id = $1
              AND sc.academic_year = $3
              AND sc.enrollment_id = $4
              AND sc.period_number = 1`,
          [schoolId.toString(), advancePromotionId, input.academicYear, source.id],
        );

        // 4. Clonar notas P1 a las asignaturas equivalentes del grupo destino (`ON CONFLICT DO NOTHING`)
        await client.query(
          `INSERT INTO academic_scores (
             school_id, academic_year, enrollment_id, course_assignment_id,
             period_number, final_score, national_scale_id,
             justified_absences, unjustified_absences, late_arrivals
           )
           SELECT $1::bigint,
                  $2::smallint,
                  $3::bigint,
                  ca_dest.id,
                  1,
                  GREATEST(COALESCE(sc.recovery_score, 0), sc.final_score),
                  sc.national_scale_id,
                  sc.justified_absences,
                  sc.unjustified_absences,
                  sc.late_arrivals
             FROM academic_scores sc
             INNER JOIN course_assignments ca_src
               ON ca_src.school_id = sc.school_id AND ca_src.id = sc.course_assignment_id
             INNER JOIN LATERAL (
               SELECT ca2.id
                 FROM course_assignments ca2
                WHERE ca2.school_id = sc.school_id
                  AND ca2.academic_year = sc.academic_year
                  AND ca2.academic_group_id = $5
                  AND ca2.subject_id = ca_src.subject_id
                  AND ca2.is_active = TRUE
                ORDER BY ca2.id ASC
                LIMIT 1
             ) ca_dest ON TRUE
            WHERE sc.school_id = $1
              AND sc.academic_year = $2
              AND sc.enrollment_id = $4
              AND sc.period_number = 1
           ON CONFLICT (school_id, academic_year, enrollment_id, period_number, course_assignment_id)
           DO NOTHING`,
          [
            schoolId.toString(),
            input.academicYear,
            newEnrollmentId,
            source.id,
            input.targetGroupId,
          ],
        );
      } else if (hasTargetPlacement) {
        await client.query(
          `UPDATE student_enrollments
              SET campus_id = $3,
                  shift_id = $4,
                  academic_group_id = $5,
                  promotion_status_id = $6,
                  is_promoted = TRUE,
                  updated_at = NOW()
            WHERE school_id = $1 AND id = $2`,
          [
            schoolId.toString(),
            source.id,
            input.targetCampusId,
            input.targetShiftId,
            input.targetGroupId,
            statusId,
          ],
        );
      } else {
        await client.query(
          `UPDATE student_enrollments
              SET promotion_status_id = $3, is_promoted = TRUE, updated_at = NOW()
            WHERE school_id = $1 AND id = $2`,
          [schoolId.toString(), source.id, statusId],
        );
      }

      const upsertRes = await client.query<{ id: string }>(
        `INSERT INTO promotion_records (
           school_id, enrollment_id, promotion_status_id, academic_year,
           act_number, is_commission_promoted, observations, promotion_messages,
           promoted_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7::jsonb, CURRENT_DATE, NOW())
         ON CONFLICT (school_id, enrollment_id) DO UPDATE SET
           promotion_status_id = EXCLUDED.promotion_status_id,
           act_number = COALESCE(EXCLUDED.act_number, promotion_records.act_number),
           is_commission_promoted = TRUE,
           observations = COALESCE(EXCLUDED.observations, promotion_records.observations),
           promotion_messages = EXCLUDED.promotion_messages,
           promoted_at = CURRENT_DATE,
           updated_at = NOW()
         RETURNING id`,
        [
          schoolId.toString(),
          input.enrollmentId,
          statusId,
          input.academicYear,
          input.actNumber ?? null,
          obsText,
          JSON.stringify({
            statusText: 'PROMOCIÓN ANTICIPADA APROBADA',
            summaryMessage: obsText,
            newEnrollmentId,
          }),
        ],
      );

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
            AND se.id = ANY($3::bigint[])
          ORDER BY se.id ASC`,
        [schoolId.toString(), input.fromYear, input.enrollmentIds],
      );

      let enrolledCount = 0;
      let skippedCount = 0;

      for (const src of sourceRes.rows) {
        const isRepeating = src.promo_code === 3 || src.promo_code === 15;

        // Verificar existencia previa antes de consumir un consecutivo legal de libro/folio
        const existsRes = await client.query<{ id: string }>(
          `SELECT id
             FROM student_enrollments
            WHERE school_id = $1
              AND student_profile_id = $2
              AND academic_year = $3
              AND grade_id = $4
            LIMIT 1`,
          [
            schoolId.toString(),
            src.student_profile_id,
            input.toYear,
            input.targetGradeId,
          ],
        );
        if ((existsRes.rowCount ?? 0) > 0) {
          skippedCount += 1;
          continue;
        }

        const numbering = await this.enrollmentNumbering.allocateNextNumbers(
          client,
          schoolId,
          input.toYear,
        );

        const insertRes = await client.query<{ id: string }>(
          `INSERT INTO student_enrollments (
             school_id, student_profile_id, campus_id, shift_id, grade_id,
             academic_group_id, academic_year, enrollment_status_id,
             registration_number, book_number, folio_number,
             is_repeating_grade, is_new_student
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, 2, $8, $9, $10, $11, FALSE)
           ON CONFLICT (school_id, student_profile_id, academic_year, grade_id) DO NOTHING
           RETURNING id`,
          [
            schoolId.toString(),
            src.student_profile_id,
            input.targetCampusId,
            input.targetShiftId,
            input.targetGradeId,
            input.targetGroupId,
            input.toYear,
            numbering.registrationNumber,
            numbering.bookNumber,
            numbering.folioNumber,
            isRepeating,
          ],
        );

        if ((insertRes.rowCount ?? 0) > 0) {
          await this.enrollmentNumbering.ensureAccessControl(
            client,
            schoolId,
            Number(insertRes.rows[0].id),
          );
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

      if (enrRes.rows.length === 0) {
        return [];
      }

      const enrollmentIds = enrRes.rows.map((r) => Number(r.enrollment_id));
      const allSubjectsRes = await client.query<{
        enrollment_id: string;
        subject_name: string;
        area_name: string;
        avg_score: string;
        periods_count: string;
      }>(
        `SELECT v.enrollment_id,
                s.name AS subject_name,
                COALESCE(aa.name, 'Sin área') AS area_name,
                v.final_effective_score::text AS avg_score,
                v.scored_periods_count::text AS periods_count
           FROM v_siee_subject_annual_scores v
           INNER JOIN subjects s
             ON s.school_id = v.school_id AND s.id = v.subject_id
           LEFT JOIN academic_areas aa
             ON aa.school_id = v.school_id AND aa.id = v.academic_area_id
          WHERE v.school_id = $1
            AND v.enrollment_id = ANY($2::bigint[])
          ORDER BY COALESCE(aa.display_order, 999), COALESCE(aa.name, 'Sin área'), s.display_order, s.name`,
        [schoolId.toString(), enrollmentIds],
      );

      const subjectsByEnrollment = new Map<
        number,
        StudentAcademicHistoryYear['subjects']
      >();
      for (const s of allSubjectsRes.rows) {
        const key = Number(s.enrollment_id);
        const list = subjectsByEnrollment.get(key) ?? [];
        list.push({
          subjectName: s.subject_name,
          academicAreaName: s.area_name,
          averageScore: Number(s.avg_score),
          periodsCount: Number(s.periods_count),
        });
        subjectsByEnrollment.set(key, list);
      }

      return enrRes.rows.map((row) => ({
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
        subjects: subjectsByEnrollment.get(Number(row.enrollment_id)) ?? [],
      }));
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

  /**
   * Cierra o reabre el año lectivo. Al cerrar con `cloneToNextYear = true` (default),
   * ejecuta paridad completa de `sp_close_year`: crea el año `Y + 1` y clona
   * idempotentemente las 7 tablas maestras + periodos desplazados +1 año.
   */
  async setAcademicYearClosedState(
    schoolId: bigint,
    academicYear: number,
    isClosed: boolean,
    options?: { cloneToNextYear?: boolean },
  ): Promise<CloseAcademicYearResult> {
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

      const shouldClone = isClosed && (options?.cloneToNextYear ?? true);
      if (!shouldClone) {
        return {
          academicYear,
          isClosed,
          periodsUpdated: periodsRes.rowCount ?? 0,
          nextYearCloned: null,
        };
      }

      const nextYear = academicYear + 1;
      const schoolParam = schoolId.toString();

      // 1. Crear/preservar academic_years para Y + 1 heredando plantillas JSONB
      await client.query(
        `INSERT INTO academic_years (
           school_id, year, start_date, end_date,
           is_online_enrollment_open, is_closed,
           report_card_settings, certificate_settings, graduation_act_settings
         )
         SELECT school_id,
                $3::smallint,
                CASE WHEN start_date IS NOT NULL THEN (start_date + INTERVAL '1 year')::date ELSE NULL END,
                CASE WHEN end_date IS NOT NULL THEN (end_date + INTERVAL '1 year')::date ELSE NULL END,
                TRUE,
                FALSE,
                report_card_settings,
                certificate_settings,
                graduation_act_settings
           FROM academic_years
          WHERE school_id = $1 AND year = $2
         ON CONFLICT (school_id, year) DO NOTHING`,
        [schoolParam, academicYear, nextYear],
      );

      // 2. Clonar `grading_scales`
      const scalesRes = await client.query(
        `INSERT INTO grading_scales (
           school_id, grade_group_id, national_scale_id, academic_year,
           min_score, max_score, rank_order, is_failing, is_gradable
         )
         SELECT school_id, grade_group_id, national_scale_id, $3::smallint,
                min_score, max_score, rank_order, is_failing, is_gradable
           FROM grading_scales
          WHERE school_id = $1 AND academic_year = $2
         ON CONFLICT DO NOTHING`,
        [schoolParam, academicYear, nextYear],
      );

      // 3. Clonar `evaluation_dimensions` + `evaluation_dimension_columns` remapeando IDs
      const dimsRes = await client.query(
        `INSERT INTO evaluation_dimensions (
           school_id, grade_group_id, academic_year, dimension_code,
           name, abbreviation, weight_percentage, is_editable, is_gradable, icon_url
         )
         SELECT school_id, grade_group_id, $3::smallint, dimension_code,
                name, abbreviation, weight_percentage, is_editable, is_gradable, icon_url
           FROM evaluation_dimensions
          WHERE school_id = $1 AND academic_year = $2
         ON CONFLICT DO NOTHING`,
        [schoolParam, academicYear, nextYear],
      );

      const dimColsRes = await client.query(
        `INSERT INTO evaluation_dimension_columns (
           school_id, dimension_id, column_number, label, abbreviation,
           column_type, weight_percentage, is_editable
         )
         SELECT src_col.school_id,
                dst_dim.id,
                src_col.column_number,
                src_col.label,
                src_col.abbreviation,
                src_col.column_type,
                src_col.weight_percentage,
                src_col.is_editable
           FROM evaluation_dimension_columns src_col
           INNER JOIN evaluation_dimensions src_dim
             ON src_dim.school_id = src_col.school_id
            AND src_dim.id = src_col.dimension_id
            AND src_dim.academic_year = $2
           INNER JOIN evaluation_dimensions dst_dim
             ON dst_dim.school_id = src_dim.school_id
            AND dst_dim.academic_year = $3
            AND dst_dim.dimension_code = src_dim.dimension_code
            AND dst_dim.grade_group_id IS NOT DISTINCT FROM src_dim.grade_group_id
          WHERE src_col.school_id = $1
         ON CONFLICT (school_id, dimension_id, column_number) DO NOTHING`,
        [schoolParam, academicYear, nextYear],
      );

      // 4. Clonar `academic_grading_rules` (SIEE)
      const rulesRes = await client.query(
        `INSERT INTO academic_grading_rules (
           school_id, academic_year, grade_group_id, decimals_count,
           min_passing_score, max_recovery_score,
           rounding_threshold_score, rounding_target_score, min_area_average,
           failed_areas_limit, fails_after_recovery, fails_after_recovery_mode,
           fails_area_if_any_subject_fails, fails_year_by_mandatory_area,
           promotion_mode, academic_year_mode, uses_weighted_areas,
           ranks_by_area_average, enforces_recovery_dates,
           absence_fail_percentage, rounds_period_score, rounds_final_score,
           students_per_book, promotion_date, extra_settings
         )
         SELECT school_id, $3::smallint, grade_group_id, decimals_count,
                min_passing_score, max_recovery_score,
                rounding_threshold_score, rounding_target_score, min_area_average,
                failed_areas_limit, fails_after_recovery, fails_after_recovery_mode,
                fails_area_if_any_subject_fails, fails_year_by_mandatory_area,
                promotion_mode, academic_year_mode, uses_weighted_areas,
                ranks_by_area_average, enforces_recovery_dates,
                absence_fail_percentage, rounds_period_score, rounds_final_score,
                students_per_book,
                CASE WHEN promotion_date IS NOT NULL THEN (promotion_date + INTERVAL '1 year')::date ELSE NULL END,
                extra_settings
           FROM academic_grading_rules
          WHERE school_id = $1 AND academic_year = $2
         ON CONFLICT (school_id, academic_year, grade_group_id) DO NOTHING`,
        [schoolParam, academicYear, nextYear],
      );

      // 5. Clonar `curriculum_study_plans` (`matcurso`)
      const plansRes = await client.query(
        `INSERT INTO curriculum_study_plans (
           school_id, campus_id, grade_id, subject_id, academic_year,
           weekly_hours, area_weight_percentage, process_weights, is_active
         )
         SELECT school_id, campus_id, grade_id, subject_id, $3::smallint,
                weekly_hours, area_weight_percentage, process_weights, is_active
           FROM curriculum_study_plans
          WHERE school_id = $1 AND academic_year = $2 AND is_active = TRUE
         ON CONFLICT DO NOTHING`,
        [schoolParam, academicYear, nextYear],
      );

      // 6. Clonar `subject_area_assignments` (`aux_asignaturas`)
      const saaRes = await client.query(
        `INSERT INTO subject_area_assignments (
           school_id, academic_year, subject_id, academic_area_id, is_active
         )
         SELECT school_id, $3::smallint, subject_id, academic_area_id, is_active
           FROM subject_area_assignments
          WHERE school_id = $1 AND academic_year = $2 AND is_active = TRUE
         ON CONFLICT (school_id, academic_year, subject_id) DO NOTHING`,
        [schoolParam, academicYear, nextYear],
      );

      // 7. Clonar `teacher_academic_years` (`aux_docentes`)
      const teachersRes = await client.query(
        `INSERT INTO teacher_academic_years (
           school_id, academic_year, teacher_profile_id, is_active
         )
         SELECT school_id, $3::smallint, teacher_profile_id, is_active
           FROM teacher_academic_years
          WHERE school_id = $1 AND academic_year = $2 AND is_active = TRUE
         ON CONFLICT (school_id, academic_year, teacher_profile_id) DO NOTHING`,
        [schoolParam, academicYear, nextYear],
      );

      // 8. Clonar `academic_periods` desplazando fechas +1 año (P1 activo, todos abiertos)
      const clonedPeriodsRes = await client.query(
        `INSERT INTO academic_periods (
           school_id, grade_group_id, academic_year, period_number, name,
           weight_percentage, start_date, end_date,
           grading_open_date, grading_close_date,
           recovery_open_date, recovery_close_date,
           is_gradable, is_active, is_closed
         )
         SELECT school_id,
                grade_group_id,
                $3::smallint,
                period_number,
                name,
                weight_percentage,
                (start_date + INTERVAL '1 year')::date,
                (end_date + INTERVAL '1 year')::date,
                CASE WHEN grading_open_date IS NOT NULL THEN (grading_open_date + INTERVAL '1 year')::date ELSE NULL END,
                CASE WHEN grading_close_date IS NOT NULL THEN (grading_close_date + INTERVAL '1 year')::date ELSE NULL END,
                CASE WHEN recovery_open_date IS NOT NULL THEN (recovery_open_date + INTERVAL '1 year')::date ELSE NULL END,
                CASE WHEN recovery_close_date IS NOT NULL THEN (recovery_close_date + INTERVAL '1 year')::date ELSE NULL END,
                is_gradable,
                (period_number = 1),
                FALSE
           FROM academic_periods
          WHERE school_id = $1 AND academic_year = $2
         ON CONFLICT DO NOTHING`,
        [schoolParam, academicYear, nextYear],
      );

      return {
        academicYear,
        isClosed,
        periodsUpdated: periodsRes.rowCount ?? 0,
        nextYearCloned: nextYear,
        clonedCounts: {
          gradingScales: scalesRes.rowCount ?? 0,
          evaluationDimensions: dimsRes.rowCount ?? 0,
          evaluationDimensionColumns: dimColsRes.rowCount ?? 0,
          gradingRules: rulesRes.rowCount ?? 0,
          curriculumStudyPlans: plansRes.rowCount ?? 0,
          subjectAreaAssignments: saaRes.rowCount ?? 0,
          teacherAcademicYears: teachersRes.rowCount ?? 0,
          academicPeriods: clonedPeriodsRes.rowCount ?? 0,
        },
      };
    });
  }

  /**
   * Evalúa un cohorte completo (año o grupo) con cero queries N+1:
   * 3 queries en total (reglas SIEE por grade_group_id, matrículas activas,
   * notas anuales consolidadas desde `v_siee_subject_annual_scores`).
   */
  private async evaluateCohortForYear(
    client: PoolClient,
    schoolId: bigint,
    academicYear: number,
    academicGroupId?: number,
  ): Promise<
    Array<{
      readonly enrollmentId: number;
      readonly studentProfileId: number;
      readonly studentDocumentNumber: string;
      readonly studentFullName: string;
      readonly academicGroupId: number;
      readonly groupCode: string;
      readonly gradeName: string;
      readonly evaluation: PromotionEvaluationOutput;
      readonly subjectMetaList: FinalSabanaSubjectColumn[];
    }>
  > {
    // 1. Reglas SIEE por grupo de grados + techo reprobatorio desde `grading_scales`
    const rulesRes = await client.query<{
      grade_group_id: string;
      decimals_count: number;
      min_passing_score: string;
      max_recovery_score: string;
      rounding_threshold_score: string;
      rounding_target_score: string;
      rounds_final_score: boolean;
      min_area_average: string;
      failed_areas_limit: number;
      fails_after_recovery: boolean;
      fails_after_recovery_mode: number;
      fails_area_if_any_subject_fails: boolean;
      fails_year_by_mandatory_area: boolean;
      promotion_mode: number;
      academic_year_mode: number;
      uses_weighted_areas: boolean;
      ranks_by_area_average: boolean;
      failing_max_score: string | null;
    }>(
      `SELECT r.grade_group_id,
              r.decimals_count,
              r.min_passing_score,
              r.max_recovery_score,
              r.rounding_threshold_score,
              r.rounding_target_score,
              r.rounds_final_score,
              r.min_area_average,
              r.failed_areas_limit,
              r.fails_after_recovery,
              r.fails_after_recovery_mode,
              r.fails_area_if_any_subject_fails,
              r.fails_year_by_mandatory_area,
              r.promotion_mode,
              r.academic_year_mode,
              r.uses_weighted_areas,
              r.ranks_by_area_average,
              (
                SELECT MAX(gs.max_score)
                  FROM grading_scales gs
                 WHERE gs.school_id = r.school_id
                   AND gs.academic_year = r.academic_year
                   AND gs.is_failing = TRUE
                   AND (gs.grade_group_id IS NULL OR gs.grade_group_id = r.grade_group_id)
              ) AS failing_max_score
         FROM academic_grading_rules r
        WHERE r.school_id = $1 AND r.academic_year = $2
        ORDER BY r.id ASC`,
      [schoolId.toString(), academicYear],
    );

    const ruleByGradeGroup = new Map<number, SieePromotionRuleConfig>();
    let defaultRule: SieePromotionRuleConfig = {
      decimalsCount: 2,
      minPassingScore: 3.0,
      failingMaxScore: 2.99,
      maxRecoveryScore: 3.0,
      roundingThresholdScore: 0,
      roundingTargetScore: 0,
      roundsFinalScore: false,
      minAreaAverage: 0,
      failedAreasLimit: 3,
      failsAfterRecovery: true,
      failsAfterRecoveryMode: 1,
      failsAreaIfAnySubjectFails: false,
      failsYearByMandatoryArea: false,
      promotionMode: 1,
      academicYearMode: 0,
      usesWeightedAreas: true,
      ranksByAreaAverage: false,
    };

    for (const r of rulesRes.rows) {
      const minPassing = Number(r.min_passing_score);
      const cfg: SieePromotionRuleConfig = {
        decimalsCount: Number(r.decimals_count),
        minPassingScore: minPassing,
        failingMaxScore: r.failing_max_score
          ? Number(r.failing_max_score)
          : Number((minPassing - 0.01).toFixed(2)),
        maxRecoveryScore: Number(r.max_recovery_score),
        roundingThresholdScore: Number(r.rounding_threshold_score),
        roundingTargetScore: Number(r.rounding_target_score),
        roundsFinalScore: Boolean(r.rounds_final_score),
        minAreaAverage: Number(r.min_area_average),
        failedAreasLimit: Number(r.failed_areas_limit),
        failsAfterRecovery: Boolean(r.fails_after_recovery),
        failsAfterRecoveryMode: Number(r.fails_after_recovery_mode),
        failsAreaIfAnySubjectFails: Boolean(r.fails_area_if_any_subject_fails),
        failsYearByMandatoryArea: Boolean(r.fails_year_by_mandatory_area),
        promotionMode: Number(r.promotion_mode),
        academicYearMode: Number(r.academic_year_mode),
        usesWeightedAreas: Boolean(r.uses_weighted_areas),
        ranksByAreaAverage: Boolean(r.ranks_by_area_average),
      };
      ruleByGradeGroup.set(Number(r.grade_group_id), cfg);
    }
    if (rulesRes.rows.length > 0) {
      defaultRule = ruleByGradeGroup.get(Number(rulesRes.rows[0].grade_group_id))!;
    }

    // 2. Matrículas ACTIVAS únicamente (`enrollment_status_id = 2`)
    const params: unknown[] = [schoolId.toString(), academicYear];
    let groupClause = '';
    if (academicGroupId) {
      params.push(academicGroupId);
      groupClause = `AND se.academic_group_id = $${params.length}`;
    }

    const enrollmentsRes = await client.query<ActiveEnrollmentRow>(
      `SELECT se.id AS enrollment_id,
              se.student_profile_id,
              sp.document_number,
              TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
              se.academic_group_id,
              ag.group_code,
              se.grade_id,
              g.name AS grade_name,
              g.grade_group_id,
              COALESCE(gg.is_cycle_end, FALSE) AS is_cycle_end,
              g.next_grade_code,
              g_next.name AS next_grade_name
         FROM student_enrollments se
         INNER JOIN student_profiles sp
           ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
         INNER JOIN grades g
           ON g.school_id = se.school_id AND g.id = se.grade_id
         INNER JOIN academic_groups ag
           ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
         LEFT JOIN grade_groups gg
           ON gg.school_id = g.school_id AND gg.id = g.grade_group_id
         LEFT JOIN LATERAL (
           SELECT gn.name
             FROM grades gn
            WHERE gn.school_id = g.school_id
              AND gn.grade_code = g.next_grade_code
            LIMIT 1
         ) g_next ON g.next_grade_code IS NOT NULL
        WHERE se.school_id = $1
          AND se.academic_year = $2
          AND se.enrollment_status_id = 2
          ${groupClause}
        ORDER BY g.display_order, ag.group_code, full_name`,
      params,
    );

    if (enrollmentsRes.rows.length === 0) {
      return [];
    }

    // 3. Una sola consulta set-based sobre `v_siee_subject_annual_scores` para todo el cohorte
    const enrollmentIds = enrollmentsRes.rows.map((e) => Number(e.enrollment_id));
    const scoresRes = await client.query<AnnualSubjectRow>(
      `SELECT v.enrollment_id,
              v.subject_id,
              s.name AS subject_name,
              s.abbreviation AS subject_abbreviation,
              COALESCE(v.academic_area_id, 0) AS academic_area_id,
              COALESCE(aa.name, 'Sin área') AS academic_area_name,
              v.course_assignment_id,
              ca.teacher_profile_id,
              v.area_weight_percentage,
              v.weekly_hours,
              v.is_excluded_from_average,
              v.is_elective,
              v.area_fails_school_year,
              v.annual_score,
              v.final_recovery_score,
              v.final_effective_score,
              v.failing_max_score,
              (v.justified_absences + v.unjustified_absences)::text AS total_absences
         FROM v_siee_subject_annual_scores v
         INNER JOIN subjects s
           ON s.school_id = v.school_id AND s.id = v.subject_id
         LEFT JOIN academic_areas aa
           ON aa.school_id = v.school_id AND aa.id = v.academic_area_id
         LEFT JOIN course_assignments ca
           ON ca.school_id = v.school_id AND ca.id = v.course_assignment_id
        WHERE v.school_id = $1
          AND v.academic_year = $2
          AND v.enrollment_id = ANY($3::bigint[])`,
      [schoolId.toString(), academicYear, enrollmentIds],
    );

    const rowsByEnrollment = new Map<number, AnnualSubjectRow[]>();
    for (const row of scoresRes.rows) {
      const key = Number(row.enrollment_id);
      const list = rowsByEnrollment.get(key) ?? [];
      list.push(row);
      rowsByEnrollment.set(key, list);
    }

    return enrollmentsRes.rows.map((enr) => {
      const enrollmentId = Number(enr.enrollment_id);
      const groupRule = enr.grade_group_id
        ? (ruleByGradeGroup.get(Number(enr.grade_group_id)) ?? defaultRule)
        : defaultRule;
      const subjectRows = rowsByEnrollment.get(enrollmentId) ?? [];

      const subjectInputs: StudentSubjectAnnualInput[] = subjectRows.map((sr) => ({
        subjectId: Number(sr.subject_id),
        subjectName: sr.subject_name,
        academicAreaId: Number(sr.academic_area_id),
        academicAreaName: sr.academic_area_name,
        courseAssignmentId: Number(sr.course_assignment_id),
        areaWeightPercentage: Number(sr.area_weight_percentage),
        areaFailsSchoolYear: Boolean(sr.area_fails_school_year),
        isExcludedFromAverage: Boolean(sr.is_excluded_from_average),
        isElective: Boolean(sr.is_elective),
        preCalculatedAnnualScore: Number(sr.annual_score),
        finalRecoveryScore:
          sr.final_recovery_score !== null
            ? Number(sr.final_recovery_score)
            : null,
        totalAbsences: Number(sr.total_absences),
      }));

      const evaluation = this.evaluationEngine.evaluateStudent({
        rule: groupRule,
        subjects: subjectInputs,
        gradeName: enr.grade_name,
        nextGradeCode: enr.next_grade_code,
        nextGradeName: enr.next_grade_name,
        isCycleEnd: Boolean(enr.is_cycle_end),
      });

      const subjectMetaList: FinalSabanaSubjectColumn[] = subjectRows
        .filter((sr) => !sr.is_excluded_from_average)
        .map((sr) => ({
          subjectId: Number(sr.subject_id),
          subjectName: sr.subject_name,
          abbreviation: sr.subject_abbreviation,
          academicAreaId: Number(sr.academic_area_id),
          academicAreaName: sr.academic_area_name,
          weeklyHours: Number(sr.weekly_hours),
        }));

      return {
        enrollmentId,
        studentProfileId: Number(enr.student_profile_id),
        studentDocumentNumber: enr.document_number,
        studentFullName: enr.full_name,
        academicGroupId: Number(enr.academic_group_id),
        groupCode: enr.group_code,
        gradeName: enr.grade_name,
        evaluation,
        subjectMetaList,
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
      recovery_average: string;
      passed_areas_count: number;
      failed_areas_count: number;
      failed_subjects_count: number;
      total_absences: number;
      group_rank: number | null;
      is_commission_promoted: boolean;
      is_graduated: boolean;
      diploma_number: string | null;
      graduation_folio: string | null;
      observations: string | null;
      promotion_messages: Record<string, unknown> | null;
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
              pr.recovery_average,
              pr.passed_areas_count,
              pr.failed_areas_count,
              pr.failed_subjects_count,
              pr.total_absences,
              pr.group_rank,
              pr.is_commission_promoted,
              pr.is_graduated,
              pr.diploma_number,
              pr.graduation_folio,
              pr.observations,
              pr.promotion_messages,
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
      recoveryAverage: Number(r.recovery_average ?? 0),
      passedAreasCount: Number(r.passed_areas_count ?? 0),
      failedAreasCount: Number(r.failed_areas_count),
      failedSubjectsCount: Number(r.failed_subjects_count),
      totalAbsences: Number(r.total_absences),
      groupRank: r.group_rank !== null ? Number(r.group_rank) : null,
      isCommissionPromoted: Boolean(r.is_commission_promoted),
      isGraduated: Boolean(r.is_graduated),
      diplomaNumber: r.diploma_number,
      graduationFolio: r.graduation_folio,
      observations: r.observations,
      promotionMessages: r.promotion_messages ?? {},
      promotedAt: r.promoted_at,
    }));
  }
}
