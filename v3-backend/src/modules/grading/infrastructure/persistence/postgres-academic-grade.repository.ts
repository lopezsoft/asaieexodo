import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { AcademicGrade } from '../../domain/entities/academic-grade.entity';
import {
  AcademicGradeRepositoryPort,
  InstitutionalGradingRulesSnapshot,
  SaveAcademicGradeInput,
  StudentBulletinGradeSummary,
} from '../../domain/ports/academic-grade.repository.port';
import { GradingScore } from '../../domain/strategies/grading-calculation.strategy';

interface GradeRow {
  id: string;
  school_id: string;
  academic_year: number;
  enrollment_id: string;
  course_assignment_id: string;
  period_id: string;
  period_number: number;
  final_score: string;
  recovery_score: string;
  leveling_score: string;
  national_scale_id: number | null;
  justified_absences: number;
  unjustified_absences: number;
  late_arrivals: number;
  teacher_observations: string | null;
  has_pre_report_alert: boolean;
  is_locked: boolean;
  updated_by_user_id: string;
}

interface BulletinSummaryRow {
  area_name: string;
  subject_name: string;
  weekly_hours: number;
  final_score: string;
  recovery_score: string;
  leveling_score: string;
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
        min_scale_score: string | null;
        max_scale_score: string | null;
      }>(
        `SELECT
           agr.min_passing_score,
           agr.max_recovery_score,
           agr.decimals_count,
           (SELECT MIN(gs.min_score) FROM grading_scales gs
             WHERE gs.school_id = $1 AND gs.academic_year = $2
               AND (gs.grade_group_id = g.grade_group_id OR gs.grade_group_id IS NULL)) AS min_scale_score,
           (SELECT MAX(gs.max_score) FROM grading_scales gs
             WHERE gs.school_id = $1 AND gs.academic_year = $2
               AND (gs.grade_group_id = g.grade_group_id OR gs.grade_group_id IS NULL)) AS max_scale_score
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
      return {
        minScaleScore: row?.min_scale_score ? Number(row.min_scale_score) : 1.0,
        maxScaleScore: row?.max_scale_score ? Number(row.max_scale_score) : 5.0,
        minPassingScore: row?.min_passing_score
          ? Number(row.min_passing_score)
          : 3.0,
        maxRecoveryScore: row?.max_recovery_score
          ? Number(row.max_recovery_score)
          : 5.0,
        decimalsCount: row?.decimals_count ?? 2,
      };
    });
  }

  async upsertGrade(input: SaveAcademicGradeInput): Promise<AcademicGrade> {
    return this.db.withTenantTransaction(input.schoolId, async (client) => {
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

      // 2. Bloquear fila previa (si existe) para validar is_locked y auditar cambio de nota
      const existingRes = await client.query<{
        id: string;
        final_score: string;
        is_locked: boolean;
      }>(
        `SELECT id, final_score, is_locked
         FROM academic_grades
         WHERE school_id = $1
           AND academic_year = $2
           AND enrollment_id = $3
           AND course_assignment_id = $4
           AND period_number = $5
         FOR UPDATE`,
        [
          String(input.schoolId),
          input.academicYear,
          String(input.enrollmentId),
          String(input.courseAssignmentId),
          period.period_number,
        ],
      );

      const previousGrade = existingRes.rows[0];
      if (previousGrade?.is_locked) {
        throw new DomainException(
          'GRADE_LOCKED',
          'Esta calificación se encuentra bloqueada y no puede ser modificada.',
        );
      }

      // 3. Resolver national_scale_id segun la escala institucional del colegio
      const effectiveValue = Math.max(
        input.finalScore,
        input.recoveryScore,
        input.levelingScore,
      );
      const scaleRes = await client.query<{ national_scale_id: number }>(
        `SELECT gs.national_scale_id
         FROM grading_scales gs
         WHERE gs.school_id = $1
           AND gs.academic_year = $2
           AND $3 BETWEEN gs.min_score AND gs.max_score
         ORDER BY gs.grade_group_id NULLS LAST
         LIMIT 1`,
        [String(input.schoolId), input.academicYear, effectiveValue],
      );
      const nationalScaleId = scaleRes.rows[0]?.national_scale_id ?? null;

      // 4. Upsert 100% alineado con academic_grades (02-core-schema-rls.sql)
      const res = await client.query<GradeRow>(
        `INSERT INTO academic_grades (
           school_id, academic_year, enrollment_id, course_assignment_id,
           period_id, period_number, final_score, recovery_score, leveling_score,
           national_scale_id, justified_absences, unjustified_absences, late_arrivals,
           teacher_observations, has_pre_report_alert, updated_by_user_id
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (school_id, academic_year, enrollment_id, course_assignment_id, period_number)
         DO UPDATE SET
           period_id = EXCLUDED.period_id,
           final_score = EXCLUDED.final_score,
           recovery_score = EXCLUDED.recovery_score,
           leveling_score = EXCLUDED.leveling_score,
           national_scale_id = EXCLUDED.national_scale_id,
           justified_absences = EXCLUDED.justified_absences,
           unjustified_absences = EXCLUDED.unjustified_absences,
           late_arrivals = EXCLUDED.late_arrivals,
           teacher_observations = EXCLUDED.teacher_observations,
           has_pre_report_alert = EXCLUDED.has_pre_report_alert,
           updated_by_user_id = EXCLUDED.updated_by_user_id,
           updated_at = NOW()
         RETURNING id, school_id, academic_year, enrollment_id, course_assignment_id,
                   period_id, period_number, final_score, recovery_score, leveling_score,
                   national_scale_id, justified_absences, unjustified_absences, late_arrivals,
                   teacher_observations, has_pre_report_alert, is_locked, updated_by_user_id`,
        [
          String(input.schoolId),
          input.academicYear,
          String(input.enrollmentId),
          String(input.courseAssignmentId),
          String(input.periodId),
          period.period_number,
          input.finalScore,
          input.recoveryScore,
          input.levelingScore,
          nationalScaleId,
          input.justifiedAbsences,
          input.unjustifiedAbsences,
          input.lateArrivals,
          input.teacherObservations ?? null,
          input.hasPreReportAlert,
          String(input.updatedByUserId),
        ],
      );

      // 5. Registrar trazabilidad en academic_grade_audit_logs
      const previousScore = previousGrade
        ? Number(previousGrade.final_score)
        : null;
      if (previousScore === null || previousScore !== input.finalScore) {
        await client.query(
          `INSERT INTO academic_grade_audit_logs (
             school_id, academic_year, enrollment_id, course_assignment_id,
             period_number, previous_score, new_score, changed_by_user_id, change_reason
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            String(input.schoolId),
            input.academicYear,
            String(input.enrollmentId),
            String(input.courseAssignmentId),
            period.period_number,
            previousScore,
            input.finalScore,
            String(input.updatedByUserId),
            input.changeReason ?? 'Registro periódico de calificación',
          ],
        );
      }

      // 6. Sincronizar alerta temprana en academic_pre_reports
      if (input.hasPreReportAlert) {
        await client.query(
          `INSERT INTO academic_pre_reports (
             school_id, academic_year, enrollment_id, course_assignment_id,
             period_number, partial_score, national_scale_id, observations
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (school_id, academic_year, enrollment_id, course_assignment_id, period_number)
           DO UPDATE SET
             partial_score = EXCLUDED.partial_score,
             national_scale_id = EXCLUDED.national_scale_id,
             observations = EXCLUDED.observations`,
          [
            String(input.schoolId),
            input.academicYear,
            String(input.enrollmentId),
            String(input.courseAssignmentId),
            period.period_number,
            effectiveValue,
            nationalScaleId,
            input.teacherObservations ?? null,
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
      const recVal = Number(row.recovery_score);
      const levVal = Number(row.leveling_score);

      return AcademicGrade.createOrUpdate(BigInt(row.id), {
        schoolId: BigInt(row.school_id),
        academicYear: row.academic_year,
        enrollmentId: BigInt(row.enrollment_id),
        courseAssignmentId: BigInt(row.course_assignment_id),
        periodId: BigInt(row.period_id),
        periodNumber: row.period_number,
        finalScore: GradingScore.create(Number(row.final_score), 0, 100),
        recoveryScore:
          recVal > 0 ? GradingScore.create(recVal, 0, 100) : null,
        levelingScore:
          levVal > 0 ? GradingScore.create(levVal, 0, 100) : null,
        nationalScaleId: row.national_scale_id,
        justifiedAbsences: row.justified_absences,
        unjustifiedAbsences: row.unjustified_absences,
        lateArrivals: row.late_arrivals,
        teacherObservations: row.teacher_observations,
        hasPreReportAlert: row.has_pre_report_alert,
        isLocked: row.is_locked,
        updatedByUserId: BigInt(row.updated_by_user_id),
      });
    });
  }

  async findStudentPeriodBulletin(
    schoolId: bigint,
    academicYear: number,
    enrollmentId: bigint,
    periodId: bigint,
  ): Promise<StudentBulletinGradeSummary[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<BulletinSummaryRow>(
        `SELECT
           ar.name AS area_name,
           sub.name AS subject_name,
           ca.weekly_hours,
           ag.final_score,
           ag.recovery_score,
           ag.leveling_score,
           GREATEST(ag.final_score, ag.recovery_score, ag.leveling_score) AS effective_score,
           ngs.name AS scale_name,
           ngs.abbreviation AS scale_abbreviation,
           ngs.hex_color AS scale_color,
           ag.unjustified_absences,
           ag.has_pre_report_alert
         FROM academic_grades ag
         INNER JOIN course_assignments ca
           ON ca.id = ag.course_assignment_id AND ca.school_id = ag.school_id
         INNER JOIN subjects sub
           ON sub.id = ca.subject_id AND sub.school_id = ag.school_id
         INNER JOIN academic_areas ar
           ON ar.id = sub.academic_area_id AND ar.school_id = ag.school_id
         LEFT JOIN national_grading_scales ngs
           ON ngs.id = ag.national_scale_id
         WHERE ag.school_id = $1
           AND ag.academic_year = $2
           AND ag.enrollment_id = $3
           AND ag.period_id = $4
         ORDER BY ar.display_order ASC, sub.display_order ASC`,
        [
          String(schoolId),
          academicYear,
          String(enrollmentId),
          String(periodId),
        ],
      );

      return res.rows.map((r) => ({
        areaName: r.area_name,
        subjectName: r.subject_name,
        weeklyHours: r.weekly_hours,
        finalScore: Number(r.final_score),
        recoveryScore: Number(r.recovery_score),
        levelingScore: Number(r.leveling_score),
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
