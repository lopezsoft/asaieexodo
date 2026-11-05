import { Injectable } from '@nestjs/common';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import { AcademicGrade } from '../../domain/entities/academic-grade.entity';
import {
  AcademicGradeRepositoryPort,
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
  academic_period_id: string;
  final_score: string;
  remedial_score: string;
  justified_absences: number;
  unjustified_absences: number;
  tardies: number;
  pre_report_observation: string | null;
  has_pre_report_alert: boolean;
  updated_by_user_id: string;
}

interface BulletinSummaryRow {
  area_name: string;
  subject_name: string;
  weekly_hours: number;
  final_score: string;
  remedial_score: string;
  effective_score: string;
  scale_name: string | null;
  unjustified_absences: number;
}

@Injectable()
export class PostgresAcademicGradeRepository
  implements AcademicGradeRepositoryPort
{
  constructor(private readonly db: PostgresRlsService) {}

  async upsertGrade(input: SaveAcademicGradeInput): Promise<AcademicGrade> {
    return this.db.withTenantTransaction(input.schoolId, async (client) => {
      const res = await client.query<GradeRow>(
        `INSERT INTO academic_grades (
           school_id, academic_year, enrollment_id, course_assignment_id,
           academic_period_id, final_score, remedial_score,
           justified_absences, unjustified_absences, tardies,
           pre_report_observation, has_pre_report_alert, updated_by_user_id
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (school_id, academic_year, enrollment_id, course_assignment_id, academic_period_id)
         DO UPDATE SET
           final_score = EXCLUDED.final_score,
           remedial_score = EXCLUDED.remedial_score,
           justified_absences = EXCLUDED.justified_absences,
           unjustified_absences = EXCLUDED.unjustified_absences,
           tardies = EXCLUDED.tardies,
           pre_report_observation = EXCLUDED.pre_report_observation,
           has_pre_report_alert = EXCLUDED.has_pre_report_alert,
           updated_by_user_id = EXCLUDED.updated_by_user_id,
           updated_at = NOW()
         RETURNING id, school_id, academic_year, enrollment_id, course_assignment_id,
                   academic_period_id, final_score, remedial_score,
                   justified_absences, unjustified_absences, tardies,
                   pre_report_observation, has_pre_report_alert, updated_by_user_id`,
        [
          String(input.schoolId),
          input.academicYear,
          String(input.enrollmentId),
          String(input.courseAssignmentId),
          String(input.academicPeriodId),
          input.finalScore,
          input.remedialScore,
          input.justifiedAbsences,
          input.unjustifiedAbsences,
          input.tardies,
          input.preReportObservation ?? null,
          input.hasPreReportAlert ?? false,
          String(input.updatedByUserId),
        ],
      );

      const row = res.rows[0];
      return AcademicGrade.createOrUpdate(BigInt(row.id), {
        schoolId: BigInt(row.school_id),
        academicYear: row.academic_year,
        enrollmentId: BigInt(row.enrollment_id),
        courseAssignmentId: BigInt(row.course_assignment_id),
        academicPeriodId: BigInt(row.academic_period_id),
        finalScore: GradingScore.create(Number(row.final_score), 0, 5),
        remedialScore: GradingScore.create(Number(row.remedial_score), 0, 5),
        justifiedAbsences: row.justified_absences,
        unjustifiedAbsences: row.unjustified_absences,
        tardies: row.tardies,
        preReportObservation: row.pre_report_observation,
        hasPreReportAlert: row.has_pre_report_alert,
        updatedByUserId: BigInt(row.updated_by_user_id),
      });
    });
  }

  async findStudentPeriodBulletin(
    schoolId: bigint,
    academicYear: number,
    enrollmentId: bigint,
    academicPeriodId: bigint,
  ): Promise<StudentBulletinGradeSummary[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<BulletinSummaryRow>(
        `SELECT
           ar.name AS area_name,
           sub.name AS subject_name,
           ca.weekly_hours,
           ag.final_score,
           ag.remedial_score,
           ag.effective_score,
           gs.name AS scale_name,
           ag.unjustified_absences
         FROM academic_grades ag
         INNER JOIN course_assignments ca
           ON ca.id = ag.course_assignment_id AND ca.school_id = ag.school_id
         INNER JOIN subjects sub
           ON sub.id = ca.subject_id AND sub.school_id = ag.school_id
         INNER JOIN academic_areas ar
           ON ar.id = sub.academic_area_id AND ar.school_id = ag.school_id
         LEFT JOIN grading_scales gs
           ON gs.id = ag.grading_scale_id AND gs.school_id = ag.school_id
         WHERE ag.school_id = $1
           AND ag.academic_year = $2
           AND ag.enrollment_id = $3
           AND ag.academic_period_id = $4
         ORDER BY ar.display_order ASC, sub.display_order ASC`,
        [
          String(schoolId),
          academicYear,
          String(enrollmentId),
          String(academicPeriodId),
        ],
      );

      return res.rows.map((r) => ({
        areaName: r.area_name,
        subjectName: r.subject_name,
        weeklyHours: r.weekly_hours,
        finalScore: Number(r.final_score),
        remedialScore: Number(r.remedial_score),
        effectiveScore: Number(r.effective_score),
        scaleName: r.scale_name,
        unjustifiedAbsences: r.unjustified_absences,
      }));
    });
  }
}
