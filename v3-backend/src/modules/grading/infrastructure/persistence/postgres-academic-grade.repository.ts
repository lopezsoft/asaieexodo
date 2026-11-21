import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { AcademicGrade } from '../../domain/entities/academic-grade.entity';
import { computeEffectiveScore } from '../../domain/helpers/siee-decimal.helper';
import {
  AcademicGradeRepositoryPort,
  InstitutionalGradingRulesSnapshot,
  SaveAcademicGradeInput,
  StudentBulletinGradeSummary,
} from '../../domain/ports/academic-grade.repository.port';
import { GradingScore } from '../../domain/strategies/grading-calculation.strategy';

interface ScoreRow {
  id: string;
  school_id: string;
  academic_year: number;
  enrollment_id: string;
  course_assignment_id: string;
  period_number: number;
  final_score: string;
  lost_score: string | null;
  recovery_score: string | null;
  is_leveled: boolean;
  leveled_at: string | null;
  national_scale_id: number | null;
  justified_absences: number;
  unjustified_absences: number;
  late_arrivals: number;
}

interface BulletinSummaryRow {
  area_name: string;
  subject_name: string;
  weekly_hours: string;
  final_score: string;
  lost_score: string | null;
  recovery_score: string | null;
  is_leveled: boolean;
  effective_score: string;
  scale_name: string | null;
  scale_abbreviation: string | null;
  scale_color: string | null;
  unjustified_absences: number;
  has_pre_report_alert: boolean;
}

@Injectable()
export class PostgresAcademicGradeRepository
  implements AcademicGradeRepositoryPort
{
  constructor(private readonly db: PostgresRlsService) {}

  async resolveInstitutionalGradingRules(
    schoolId: bigint,
    academicYear: number,
    enrollmentId: bigint,
  ): Promise<InstitutionalGradingRulesSnapshot> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const rulesRes = await client.query<{
        min_passing_score: string;
        max_recovery_score: string;
        decimals_count: number;
        rounds_period_score: boolean;
        rounding_threshold_score: string;
        rounding_target_score: string;
        min_scale_score: string | null;
        max_scale_score: string | null;
        failing_max_score: string | null;
      }>(
        `SELECT
           agr.min_passing_score,
           agr.max_recovery_score,
           agr.decimals_count,
           agr.rounds_period_score,
           agr.rounding_threshold_score,
           agr.rounding_target_score,
           (SELECT MIN(gs.min_score) FROM grading_scales gs
             WHERE gs.school_id = $1 AND gs.academic_year = $2
               AND (gs.grade_group_id = g.grade_group_id OR gs.grade_group_id IS NULL)) AS min_scale_score,
           (SELECT MAX(gs.max_score) FROM grading_scales gs
             WHERE gs.school_id = $1 AND gs.academic_year = $2
               AND (gs.grade_group_id = g.grade_group_id OR gs.grade_group_id IS NULL)) AS max_scale_score,
           (SELECT MAX(gs.max_score) FROM grading_scales gs
             WHERE gs.school_id = $1 AND gs.academic_year = $2
               AND gs.is_failing = TRUE
               AND (gs.grade_group_id = g.grade_group_id OR gs.grade_group_id IS NULL)) AS failing_max_score
         FROM student_enrollments se
         INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
         LEFT JOIN academic_grading_rules agr
           ON agr.school_id = se.school_id
          AND agr.academic_year = $2
          AND agr.grade_group_id = g.grade_group_id
         WHERE se.school_id = $1 AND se.id = $3
         LIMIT 1`,
        [String(schoolId), academicYear, String(enrollmentId)],
      );

      const row = rulesRes.rows[0];
      const minPassing = row?.min_passing_score
        ? Number(row.min_passing_score)
        : 3.0;
      return {
        minScaleScore: row?.min_scale_score ? Number(row.min_scale_score) : 1.0,
        maxScaleScore: row?.max_scale_score ? Number(row.max_scale_score) : 5.0,
        minPassingScore: minPassing,
        failingMaxScore: row?.failing_max_score
          ? Number(row.failing_max_score)
          : Number((minPassing - 0.01).toFixed(2)),
        maxRecoveryScore: row?.max_recovery_score
          ? Number(row.max_recovery_score)
          : 5.0,
        decimalsCount: row?.decimals_count ?? 2,
        roundsPeriodScore: row?.rounds_period_score ?? false,
        roundingThresholdScore: row?.rounding_threshold_score
          ? Number(row.rounding_threshold_score)
          : 0,
        roundingTargetScore: row?.rounding_target_score
          ? Number(row.rounding_target_score)
          : 0,
      };
    });
  }

  async upsertGrade(input: SaveAcademicGradeInput): Promise<AcademicGrade> {
    return this.db.withTenantTransaction(
      input.schoolId,
      async (client) => {
        // 1. Verificar periodo academico activo/abierto y obtener period_number
        const periodRes = await client.query<{
          id: string;
          period_number: number;
          is_closed: boolean;
        }>(
          `SELECT id, period_number, is_closed
           FROM academic_periods
           WHERE school_id = $1 AND id = $2 AND academic_year = $3
           LIMIT 1`,
          [String(input.schoolId), String(input.periodId), input.academicYear],
        );

        if (periodRes.rowCount === 0) {
          throw new ResourceNotFoundException('AcademicPeriod', input.periodId);
        }

        const period = periodRes.rows[0];
        if (period.is_closed) {
          throw new DomainException(
            'ACADEMIC_PERIOD_CLOSED',
            `El periodo académico ${period.period_number} del año ${input.academicYear} se encuentra cerrado.`,
          );
        }

        // 2. Resolver grade_group_id y decimals_count de la matrícula para escala institucional SIEE
        const metaRes = await client.query<{
          grade_group_id: string | null;
          decimals_count: number | null;
        }>(
          `SELECT g.grade_group_id, agr.decimals_count
             FROM student_enrollments se
             INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
             LEFT JOIN academic_grading_rules agr
               ON agr.school_id = se.school_id
              AND agr.academic_year = $2
              AND agr.grade_group_id = g.grade_group_id
            WHERE se.school_id = $1 AND se.id = $3
            LIMIT 1`,
          [String(input.schoolId), input.academicYear, String(input.enrollmentId)],
        );
        const gradeGroupId = metaRes.rows[0]?.grade_group_id ?? null;
        const decimalsCount = metaRes.rows[0]?.decimals_count ?? 2;

        // 3. Bloquear fila previa (si existe) para preservar lost_score y determinar si es INSERT inicial
        const existingRes = await client.query<{
          id: string;
          final_score: string;
          lost_score: string | null;
        }>(
          `SELECT id, final_score, lost_score
           FROM academic_scores
           WHERE school_id = $1
             AND academic_year = $2
             AND enrollment_id = $3
             AND period_number = $4
             AND course_assignment_id = $5
           FOR UPDATE`,
          [
            String(input.schoolId),
            input.academicYear,
            String(input.enrollmentId),
            period.period_number,
            String(input.courseAssignmentId),
          ],
        );

        const previousGrade = existingRes.rows[0];
        const hasRecovery =
          input.recoveryScore !== null && input.recoveryScore > 0;
        const effectiveValue = computeEffectiveScore(
          input.finalScore,
          input.recoveryScore,
        );
        const lostScore = hasRecovery
          ? Number(
              previousGrade?.lost_score ??
                previousGrade?.final_score ??
                input.finalScore,
            )
          : previousGrade?.lost_score
            ? Number(previousGrade.lost_score)
            : null;

        // 4. Resolver national_scale_id con función SIEE PG17 por grupo de grados
        const scaleRes = await client.query<{ national_scale_id: number | null }>(
          `SELECT fn_siee_resolve_scale($1::bigint, $2::smallint, $3::bigint, $4::numeric, $5::smallint) AS national_scale_id`,
          [
            String(input.schoolId),
            input.academicYear,
            gradeGroupId,
            effectiveValue,
            decimalsCount,
          ],
        );
        const nationalScaleId = scaleRes.rows[0]?.national_scale_id ?? null;

        // 5. Upsert 100% alineado con academic_scores (02-core-schema-rls.sql)
        // Nota: las modificaciones (UPDATE) se auditan automáticamente vía trigger PG17
        // `trg_audit_academic_scores_changes` usando el contexto de auditoría de la transacción.
        const res = await client.query<ScoreRow>(
          `INSERT INTO academic_scores (
             school_id, academic_year, enrollment_id, course_assignment_id,
             period_number, final_score, lost_score, recovery_score, is_leveled,
             leveled_at, national_scale_id, justified_absences,
             unjustified_absences, late_arrivals
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::date, $11, $12, $13, $14)
           ON CONFLICT (school_id, academic_year, enrollment_id, period_number, course_assignment_id)
           DO UPDATE SET
             final_score = EXCLUDED.final_score,
             lost_score = COALESCE(EXCLUDED.lost_score, academic_scores.lost_score),
             recovery_score = EXCLUDED.recovery_score,
             is_leveled = EXCLUDED.is_leveled,
             leveled_at = COALESCE(EXCLUDED.leveled_at, academic_scores.leveled_at),
             national_scale_id = EXCLUDED.national_scale_id,
             justified_absences = EXCLUDED.justified_absences,
             unjustified_absences = EXCLUDED.unjustified_absences,
             late_arrivals = EXCLUDED.late_arrivals,
             updated_at = NOW()
           RETURNING id, school_id, academic_year, enrollment_id, course_assignment_id,
                     period_number, final_score, lost_score, recovery_score, is_leveled,
                     leveled_at::text, national_scale_id, justified_absences,
                     unjustified_absences, late_arrivals`,
          [
            String(input.schoolId),
            input.academicYear,
            String(input.enrollmentId),
            String(input.courseAssignmentId),
            period.period_number,
            input.finalScore,
            lostScore,
            hasRecovery ? input.recoveryScore : null,
            hasRecovery,
            hasRecovery ? new Date().toISOString().slice(0, 10) : null,
            nationalScaleId,
            input.justifiedAbsences,
            input.unjustifiedAbsences,
            input.lateArrivals,
          ],
        );

        // 6. Registrar trazabilidad de INSERT inicial (los UPDATE los audita el trigger PG17 sin duplicar)
        if (!previousGrade) {
          await client.query(
            `INSERT INTO academic_score_audit_logs (
               school_id, academic_year, enrollment_id, course_assignment_id,
               period_number, previous_score, new_score, changed_by_user_id, change_reason, snapshot_data
             )
             VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8, $9::jsonb)`,
            [
              String(input.schoolId),
              input.academicYear,
              String(input.enrollmentId),
              String(input.courseAssignmentId),
              period.period_number,
              input.finalScore,
              String(input.updatedByUserId),
              input.changeReason ?? 'Registro inicial de calificación',
              JSON.stringify({
                operation: 'INSERT',
                newFinalScore: input.finalScore,
                newRecoveryScore: hasRecovery ? input.recoveryScore : null,
              }),
            ],
          );
        }

        // 7. Sincronizar alerta temprana en academic_pre_reports
        if (input.hasPreReportAlert) {
          await client.query(
            `INSERT INTO academic_pre_reports (
               school_id, academic_year, enrollment_id, course_assignment_id,
               period_number, partial_score, observations, is_active
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
             ON CONFLICT (school_id, academic_year, enrollment_id, course_assignment_id, period_number)
             DO UPDATE SET
               partial_score = EXCLUDED.partial_score,
               observations = COALESCE(EXCLUDED.observations, academic_pre_reports.observations),
               is_active = TRUE`,
            [
              String(input.schoolId),
              input.academicYear,
              String(input.enrollmentId),
              String(input.courseAssignmentId),
              period.period_number,
              effectiveValue,
              input.preReportObservations ?? null,
            ],
          );
        } else {
          await client.query(
            `DELETE FROM academic_pre_reports
             WHERE school_id = $1
               AND academic_year = $2
               AND enrollment_id = $3
               AND course_assignment_id = $4
               AND period_number = $5`,
            [
              String(input.schoolId),
              input.academicYear,
              String(input.enrollmentId),
              String(input.courseAssignmentId),
              period.period_number,
            ],
          );
        }

        const row = res.rows[0];
        const recVal =
          row.recovery_score !== null ? Number(row.recovery_score) : 0;
        const lostVal = row.lost_score !== null ? Number(row.lost_score) : 0;

        return AcademicGrade.createOrUpdate(BigInt(row.id), {
          schoolId: BigInt(row.school_id),
          academicYear: row.academic_year,
          enrollmentId: BigInt(row.enrollment_id),
          courseAssignmentId: BigInt(row.course_assignment_id),
          periodNumber: row.period_number,
          finalScore: GradingScore.create(Number(row.final_score), 0, 100),
          lostScore: lostVal > 0 ? GradingScore.create(lostVal, 0, 100) : null,
          recoveryScore: recVal > 0 ? GradingScore.create(recVal, 0, 100) : null,
          isLeveled: row.is_leveled,
          leveledAt: row.leveled_at,
          nationalScaleId: row.national_scale_id,
          justifiedAbsences: row.justified_absences,
          unjustifiedAbsences: row.unjustified_absences,
          lateArrivals: row.late_arrivals,
          hasPreReportAlert: input.hasPreReportAlert,
        });
      },
      {
        userId: input.updatedByUserId,
        changeReason: input.changeReason ?? 'Registro periódico de calificación',
      },
    );
  }

  async findStudentPeriodBulletin(
    schoolId: bigint,
    academicYear: number,
    enrollmentId: bigint,
    periodId: bigint,
  ): Promise<StudentBulletinGradeSummary[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      // Resolver period_number desde academic_periods (soporta ID real de periodo o número 1..6 directo)
      const periodLookup = await client.query<{ period_number: number }>(
        `SELECT period_number FROM academic_periods
          WHERE school_id = $1 AND academic_year = $2 AND id = $3 LIMIT 1`,
        [String(schoolId), academicYear, String(periodId)],
      );
      const periodNumber =
        periodLookup.rows[0]?.period_number ?? Number(periodId);

      const res = await client.query<BulletinSummaryRow>(
        `SELECT
           COALESCE(ar.name, 'SIN ÁREA') AS area_name,
           sub.name AS subject_name,
           COALESCE(csp_campus.weekly_hours, csp_global.weekly_hours, ca.weekly_hours) AS weekly_hours,
           sc.final_score,
           sc.lost_score,
           sc.recovery_score,
           sc.is_leveled,
           GREATEST(COALESCE(sc.recovery_score, 0), sc.final_score) AS effective_score,
           ngs.name AS scale_name,
           ngs.abbreviation AS scale_abbreviation,
           ngs.hex_color AS scale_color,
           sc.unjustified_absences,
           EXISTS (
             SELECT 1 FROM academic_pre_reports pr
              WHERE pr.school_id = sc.school_id
                AND pr.academic_year = sc.academic_year
                AND pr.enrollment_id = sc.enrollment_id
                AND pr.course_assignment_id = sc.course_assignment_id
                AND pr.period_number = sc.period_number
                AND pr.is_active = TRUE
           ) AS has_pre_report_alert
         FROM academic_scores sc
         INNER JOIN student_enrollments se
           ON se.id = sc.enrollment_id AND se.school_id = sc.school_id
         INNER JOIN course_assignments ca
           ON ca.id = sc.course_assignment_id AND ca.school_id = sc.school_id
         INNER JOIN subjects sub
           ON sub.id = ca.subject_id AND sub.school_id = sc.school_id
         LEFT JOIN subject_area_assignments saa
           ON saa.school_id = sub.school_id
          AND saa.academic_year = sc.academic_year
          AND saa.subject_id = sub.id
         LEFT JOIN academic_areas ar
           ON ar.id = COALESCE(saa.academic_area_id, sub.academic_area_id)
          AND ar.school_id = sc.school_id
         LEFT JOIN curriculum_study_plans csp_campus
           ON csp_campus.school_id = ca.school_id
          AND csp_campus.campus_id = se.campus_id
          AND csp_campus.grade_id = se.grade_id
          AND csp_campus.subject_id = ca.subject_id
          AND csp_campus.academic_year = sc.academic_year
         LEFT JOIN curriculum_study_plans csp_global
           ON csp_global.school_id = ca.school_id
          AND csp_global.campus_id IS NULL
          AND csp_global.grade_id = se.grade_id
          AND csp_global.subject_id = ca.subject_id
          AND csp_global.academic_year = sc.academic_year
         LEFT JOIN national_grading_scales ngs
           ON ngs.id = sc.national_scale_id
         WHERE sc.school_id = $1
           AND sc.academic_year = $2
           AND sc.enrollment_id = $3
           AND sc.period_number = $4
         ORDER BY COALESCE(ar.display_order, 999) ASC, sub.display_order ASC`,
        [
          String(schoolId),
          academicYear,
          String(enrollmentId),
          periodNumber,
        ],
      );

      return res.rows.map((r) => ({
        areaName: r.area_name,
        subjectName: r.subject_name,
        weeklyHours: Number(r.weekly_hours),
        finalScore: Number(r.final_score),
        lostScore: r.lost_score !== null ? Number(r.lost_score) : null,
        recoveryScore: r.recovery_score !== null ? Number(r.recovery_score) : null,
        isLeveled: r.is_leveled,
        effectiveScore: Number(r.effective_score),
        scaleName: r.scale_name,
        scaleAbbreviation: r.scale_abbreviation,
        scaleColor: r.scale_color,
        unjustifiedAbsences: r.unjustified_absences,
        hasPreReportAlert: r.has_pre_report_alert,
      }));
    });
  }
}
