import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PoolClient } from 'pg';
import { ResourceNotFoundException } from '../../../../shared/domain/exceptions/resource-not-found.exception';
import { PostgresRlsService } from '../../../../shared/infrastructure/database/postgres-rls.service';
import {
  AchievementStandardRow,
  ActivitySubmissionRow,
  CourseGradebookView,
  EvaluationAttemptRow,
  GradebookStudentRow,
  LessonPlanRow,
  LessonPlanUnitRow,
  LiveClassRow,
  ObserverAnnotationRow,
  OnlineEvaluationQuestionRow,
  OnlineEvaluationRow,
  PortalRepositoryPort,
  PreReportRow,
  StudentAbsenceRow,
  StudentObserverView,
  StudentPortalGradesView,
  StudentPortalOverview,
  TeacherCourseSummary,
  VirtualActivityRow,
} from '../../domain/ports/portal.repository.port';

@Injectable()
export class PostgresPortalRepository extends PortalRepositoryPort {
  constructor(private readonly db: PostgresRlsService) {
    super();
  }

  // =========================================================================
  // PORTAL DOCENTE
  // =========================================================================

  async listTeacherCourses(
    schoolId: bigint,
    userId: bigint,
    role: string,
    academicYear: number,
  ): Promise<TeacherCourseSummary[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [schoolId.toString(), academicYear];
      let teacherFilter = '';
      if (role === 'TEACHER') {
        params.push(userId.toString());
        teacherFilter = `AND tp.user_id = $${params.length}`;
      }

      const res = await client.query<{
        id: string;
        campus_name: string;
        shift_name: string;
        grade_id: string;
        grade_name: string;
        academic_group_id: string;
        group_code: string;
        subject_id: string;
        subject_name: string;
        area_name: string;
        teacher_profile_id: string;
        teacher_name: string;
        academic_year: number;
        weekly_hours: number;
        enrolled_count: string;
      }>(
        `SELECT ca.id,
                c.name AS campus_name,
                ss.name AS shift_name,
                ca.grade_id,
                g.name AS grade_name,
                ca.academic_group_id,
                ag.group_code,
                ca.subject_id,
                s.name AS subject_name,
                COALESCE(aa.name, 'Sin área') AS area_name,
                ca.teacher_profile_id,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.middle_name, tp.last_name, tp.second_last_name)) AS teacher_name,
                ca.academic_year,
                ca.weekly_hours,
                (SELECT COUNT(*)::text
                   FROM student_enrollments se
                  WHERE se.school_id = ca.school_id
                    AND se.academic_group_id = ca.academic_group_id
                    AND se.academic_year = ca.academic_year) AS enrolled_count
           FROM course_assignments ca
           INNER JOIN campuses c ON c.school_id = ca.school_id AND c.id = ca.campus_id
           INNER JOIN school_shifts ss ON ss.school_id = ca.school_id AND ss.id = ca.shift_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           LEFT JOIN subject_area_assignments saa
             ON saa.school_id = ca.school_id
            AND saa.academic_year = ca.academic_year
            AND saa.subject_id = s.id
           LEFT JOIN academic_areas aa
             ON aa.school_id = s.school_id
            AND aa.id = COALESCE(saa.academic_area_id, s.academic_area_id)
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
          WHERE ca.school_id = $1
            AND ca.academic_year = $2
            AND ca.is_active = TRUE
            ${teacherFilter}
          ORDER BY g.display_order, ag.group_code, s.name`,
        params,
      );

      return res.rows.map((r) => ({
        id: Number(r.id),
        campusName: r.campus_name,
        shiftName: r.shift_name,
        gradeId: Number(r.grade_id),
        gradeName: r.grade_name,
        academicGroupId: Number(r.academic_group_id),
        groupCode: r.group_code,
        subjectId: Number(r.subject_id),
        subjectName: r.subject_name,
        academicAreaName: r.area_name,
        teacherProfileId: Number(r.teacher_profile_id),
        teacherName: r.teacher_name,
        academicYear: Number(r.academic_year),
        weeklyHours: Number(r.weekly_hours),
        enrolledStudentsCount: Number(r.enrolled_count),
      }));
    });
  }

  async getCourseGradebook(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<CourseGradebookView> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const courseRes = await client.query<{
        id: string;
        campus_name: string;
        shift_name: string;
        grade_id: string;
        grade_name: string;
        academic_group_id: string;
        group_code: string;
        subject_id: string;
        subject_name: string;
        area_name: string;
        teacher_profile_id: string;
        teacher_name: string;
        academic_year: number;
        weekly_hours: number;
      }>(
        `SELECT ca.id, c.name AS campus_name, ss.name AS shift_name, ca.grade_id, g.name AS grade_name,
                ca.academic_group_id, ag.group_code, ca.subject_id, s.name AS subject_name,
                COALESCE(aa.name, 'Sin área') AS area_name, ca.teacher_profile_id,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.middle_name, tp.last_name, tp.second_last_name)) AS teacher_name,
                ca.academic_year, ca.weekly_hours
           FROM course_assignments ca
           INNER JOIN campuses c ON c.school_id = ca.school_id AND c.id = ca.campus_id
           INNER JOIN school_shifts ss ON ss.school_id = ca.school_id AND ss.id = ca.shift_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           LEFT JOIN subject_area_assignments saa
             ON saa.school_id = ca.school_id
            AND saa.academic_year = ca.academic_year
            AND saa.subject_id = s.id
           LEFT JOIN academic_areas aa
             ON aa.school_id = s.school_id
            AND aa.id = COALESCE(saa.academic_area_id, s.academic_area_id)
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
          WHERE ca.school_id = $1 AND ca.id = $2`,
        [schoolId.toString(), courseAssignmentId.toString()],
      );
      if (courseRes.rowCount === 0) {
        throw new ResourceNotFoundException(
          'CourseAssignment',
          courseAssignmentId.toString(),
        );
      }
      const c = courseRes.rows[0];

      const periodRes = await client.query<{ id: string; is_closed: boolean }>(
        `SELECT id, is_closed
           FROM academic_periods
          WHERE school_id = $1 AND academic_year = $2 AND period_number = $3
          ORDER BY grade_group_id NULLS LAST
          LIMIT 1`,
        [schoolId.toString(), academicYear, periodNumber],
      );

      const studentsRes = await client.query<{
        enrollment_id: string;
        document_number: string;
        full_name: string;
        grade_id: string | null;
        final_score: string | null;
        lost_score: string | null;
        recovery_score: string | null;
        effective_score: string | null;
        justified_absences: number | null;
        unjustified_absences: number | null;
        late_arrivals: number | null;
        pre_report_obs: string | null;
        has_pre_report_alert: boolean | null;
      }>(
        `SELECT se.id AS enrollment_id,
                sp.document_number,
                TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
                gr.id AS grade_id,
                gr.final_score,
                gr.lost_score,
                gr.recovery_score,
                GREATEST(COALESCE(gr.recovery_score, 0), gr.final_score) AS effective_score,
                gr.justified_absences,
                gr.unjustified_absences,
                gr.late_arrivals,
                pr.observations AS pre_report_obs,
                (pr.id IS NOT NULL AND pr.is_active) AS has_pre_report_alert
           FROM student_enrollments se
           INNER JOIN student_profiles sp
             ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
           LEFT JOIN academic_scores gr
             ON gr.school_id = se.school_id
            AND gr.academic_year = se.academic_year
            AND gr.enrollment_id = se.id
            AND gr.course_assignment_id = $3
            AND gr.period_number = $4
           LEFT JOIN academic_pre_reports pr
             ON pr.school_id = se.school_id
            AND pr.academic_year = se.academic_year
            AND pr.enrollment_id = se.id
            AND pr.course_assignment_id = $3
            AND pr.period_number = $4
          WHERE se.school_id = $1
            AND se.academic_group_id = $2
            AND se.academic_year = $5
          ORDER BY sp.last_name, sp.second_last_name, sp.first_name`,
        [
          schoolId.toString(),
          c.academic_group_id,
          courseAssignmentId.toString(),
          periodNumber,
          academicYear,
        ],
      );

      const isClosed = Boolean(periodRes.rows[0]?.is_closed);
      const students: GradebookStudentRow[] = studentsRes.rows.map((r) => ({
        enrollmentId: Number(r.enrollment_id),
        studentDocumentNumber: r.document_number,
        studentFullName: r.full_name,
        gradeId: r.grade_id ? Number(r.grade_id) : null,
        conceptualScore: 0,
        proceduralScore: 0,
        attitudinalScore: 0,
        evaluationExamScore: 0,
        finalScore: Number(r.final_score ?? 0),
        recoveryScore: Number(r.recovery_score ?? 0),
        levelingScore: Number(r.lost_score ?? 0),
        effectiveScore: Number(r.effective_score ?? 0),
        justifiedAbsences: Number(r.justified_absences ?? 0),
        unjustifiedAbsences: Number(r.unjustified_absences ?? 0),
        lateArrivals: Number(r.late_arrivals ?? 0),
        teacherObservations: r.pre_report_obs,
        hasPreReportAlert: Boolean(r.has_pre_report_alert),
        isLocked: isClosed,
      }));

      return {
        course: {
          id: Number(c.id),
          campusName: c.campus_name,
          shiftName: c.shift_name,
          gradeId: Number(c.grade_id),
          gradeName: c.grade_name,
          academicGroupId: Number(c.academic_group_id),
          groupCode: c.group_code,
          subjectId: Number(c.subject_id),
          subjectName: c.subject_name,
          academicAreaName: c.area_name,
          teacherProfileId: Number(c.teacher_profile_id),
          teacherName: c.teacher_name,
          academicYear: Number(c.academic_year),
          weeklyHours: Number(c.weekly_hours),
          enrolledStudentsCount: students.length,
        },
        academicYear,
        periodNumber,
        periodId: periodRes.rows[0] ? Number(periodRes.rows[0].id) : null,
        isPeriodClosed: Boolean(periodRes.rows[0]?.is_closed),
        students,
      };
    });
  }

  async saveGradebookBatch(
    schoolId: bigint,
    userId: bigint,
    courseAssignmentId: bigint,
    input: {
      academicYear: number;
      periodNumber: number;
      rows: Array<{
        enrollmentId: number;
        conceptualScore?: number;
        proceduralScore?: number;
        attitudinalScore?: number;
        evaluationExamScore?: number;
        finalScore: number;
        recoveryScore?: number;
        levelingScore?: number;
        justifiedAbsences?: number;
        unjustifiedAbsences?: number;
        lateArrivals?: number;
        teacherObservations?: string | null;
        hasPreReportAlert?: boolean;
      }>;
    },
  ): Promise<{ savedCount: number }> {
    return this.db.withTenantTransaction(
      schoolId,
      async (client) => {
        const courseMetaRes = await client.query<{
          grade_group_id: string | null;
          decimals_count: number | null;
        }>(
          `SELECT g.grade_group_id, agr.decimals_count
             FROM course_assignments ca
             INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
             LEFT JOIN academic_grading_rules agr
               ON agr.school_id = ca.school_id
              AND agr.academic_year = $3
              AND agr.grade_group_id = g.grade_group_id
            WHERE ca.school_id = $1 AND ca.id = $2
            LIMIT 1`,
          [schoolId.toString(), courseAssignmentId.toString(), input.academicYear],
        );
        const gradeGroupId = courseMetaRes.rows[0]?.grade_group_id ?? null;
        const decimalsCount = courseMetaRes.rows[0]?.decimals_count ?? 2;

        const periodRes = await client.query<{ id: string; is_closed: boolean }>(
          `SELECT id, is_closed
             FROM academic_periods
            WHERE school_id = $1 AND academic_year = $2 AND period_number = $3
              AND (grade_group_id IS NULL OR grade_group_id = $4::bigint)
            ORDER BY (grade_group_id IS NOT NULL AND grade_group_id = $4::bigint) DESC, grade_group_id NULLS LAST
            LIMIT 1`,
          [schoolId.toString(), input.academicYear, input.periodNumber, gradeGroupId],
        );
        if (periodRes.rowCount === 0) {
          throw new BadRequestException(
            `No existe un periodo académico configurado para el año ${input.academicYear} periodo ${input.periodNumber}.`,
          );
        }
        if (periodRes.rows[0].is_closed) {
          throw new ForbiddenException(
            `El periodo ${input.periodNumber} del año ${input.academicYear} se encuentra cerrado.`,
          );
        }

        let savedCount = 0;
        for (const row of input.rows) {
          const prevRes = await client.query<{
            final_score: string;
            recovery_score: string | null;
          }>(
            `SELECT final_score, recovery_score
               FROM academic_scores
              WHERE school_id = $1
                AND academic_year = $2
                AND enrollment_id = $3
                AND period_number = $4
                AND course_assignment_id = $5`,
            [
              schoolId.toString(),
              input.academicYear,
              row.enrollmentId,
              input.periodNumber,
              courseAssignmentId.toString(),
            ],
          );

          const recScore =
            row.recoveryScore !== undefined && row.recoveryScore > 0
              ? row.recoveryScore
              : null;
          const prevRec = prevRes.rows[0]?.recovery_score
            ? Number(prevRes.rows[0].recovery_score)
            : 0;
          const effectiveForScale = Math.max(
            row.finalScore,
            recScore ?? prevRec,
          );

          // Nota: los UPDATE se auditan automáticamente mediante el trigger antifraude PG17
          await client.query(
            `INSERT INTO academic_scores (
               school_id, academic_year, enrollment_id, course_assignment_id,
               period_number, final_score, recovery_score, is_leveled, leveled_at,
               national_scale_id, justified_absences, unjustified_absences, late_arrivals
             )
             VALUES (
               $1,$2,$3,$4,$5,$6,$7,$8,$9::date,
               fn_siee_resolve_scale($1::bigint, $2::smallint, $13::bigint, $14::numeric, $15::smallint),
               $10,$11,$12
             )
             ON CONFLICT (school_id, academic_year, enrollment_id, period_number, course_assignment_id)
             DO UPDATE SET
               final_score = EXCLUDED.final_score,
               recovery_score = COALESCE(EXCLUDED.recovery_score, academic_scores.recovery_score),
               is_leveled = CASE WHEN EXCLUDED.is_leveled THEN TRUE ELSE academic_scores.is_leveled END,
               leveled_at = COALESCE(EXCLUDED.leveled_at, academic_scores.leveled_at),
               national_scale_id = fn_siee_resolve_scale(
                 $1::bigint,
                 $2::smallint,
                 $13::bigint,
                 GREATEST(COALESCE(COALESCE(EXCLUDED.recovery_score, academic_scores.recovery_score), 0), EXCLUDED.final_score),
                 $15::smallint
               ),
               justified_absences = EXCLUDED.justified_absences,
               unjustified_absences = EXCLUDED.unjustified_absences,
               late_arrivals = EXCLUDED.late_arrivals,
               updated_at = NOW()`,
            [
              schoolId.toString(),
              input.academicYear,
              row.enrollmentId,
              courseAssignmentId.toString(),
              input.periodNumber,
              row.finalScore,
              recScore,
              recScore !== null,
              recScore !== null ? new Date().toISOString().slice(0, 10) : null,
              row.justifiedAbsences ?? 0,
              row.unjustifiedAbsences ?? 0,
              row.lateArrivals ?? 0,
              gradeGroupId,
              effectiveForScale,
              decimalsCount,
            ],
          );

          // Auditar INSERT inicial (los UPDATE los captura automáticamente el trigger PG17)
          if (prevRes.rowCount === 0) {
            await client.query(
              `INSERT INTO academic_score_audit_logs (
                 school_id, academic_year, enrollment_id, course_assignment_id,
                 period_number, previous_score, new_score, changed_by_user_id, change_reason, snapshot_data
               )
               VALUES ($1,$2,$3,$4,$5,NULL,$6,$7,'Registro inicial desde planilla docente V3',$8::jsonb)`,
              [
                schoolId.toString(),
                input.academicYear,
                row.enrollmentId,
                courseAssignmentId.toString(),
                input.periodNumber,
                row.finalScore,
                userId.toString(),
                JSON.stringify({
                  operation: 'INSERT',
                  newFinalScore: row.finalScore,
                  newRecoveryScore: recScore,
                }),
              ],
            );
          }

          // Sincronizar alertas/observaciones de preinforme cuando sean suministradas
          if (
            row.hasPreReportAlert === true ||
            (row.teacherObservations && row.teacherObservations.trim().length > 0)
          ) {
            await client.query(
              `INSERT INTO academic_pre_reports (
                 school_id, academic_year, enrollment_id, course_assignment_id,
                 period_number, partial_score, observations, is_active
               )
               VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
               ON CONFLICT (school_id, academic_year, enrollment_id, course_assignment_id, period_number)
               DO UPDATE SET
                 partial_score = EXCLUDED.partial_score,
                 observations = COALESCE(EXCLUDED.observations, academic_pre_reports.observations),
                 is_active = TRUE`,
              [
                schoolId.toString(),
                input.academicYear,
                row.enrollmentId,
                courseAssignmentId.toString(),
                input.periodNumber,
                effectiveForScale,
                row.teacherObservations?.trim() || null,
              ],
            );
          } else if (row.hasPreReportAlert === false) {
            await client.query(
              `UPDATE academic_pre_reports
                  SET is_active = FALSE
                WHERE school_id = $1
                  AND academic_year = $2
                  AND enrollment_id = $3
                  AND course_assignment_id = $4
                  AND period_number = $5`,
              [
                schoolId.toString(),
                input.academicYear,
                row.enrollmentId,
                courseAssignmentId.toString(),
                input.periodNumber,
              ],
            );
          }
          savedCount += 1;
        }

        return { savedCount };
      },
      {
        userId,
        changeReason: 'Actualización desde planilla docente V3',
      },
    );
  }

  async listPreReports(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<PreReportRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        enrollment_id: string;
        full_name: string;
        course_assignment_id: string;
        period_number: number;
        partial_score: string;
        observations: string | null;
        created_at: string;
      }>(
        `SELECT pr.id, pr.enrollment_id,
                TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
                pr.course_assignment_id, pr.period_number, pr.partial_score, pr.observations, pr.created_at::text
           FROM academic_pre_reports pr
           INNER JOIN student_enrollments se ON se.school_id = pr.school_id AND se.id = pr.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
          WHERE pr.school_id = $1 AND pr.course_assignment_id = $2
            AND pr.academic_year = $3 AND pr.period_number = $4
          ORDER BY full_name`,
        [
          schoolId.toString(),
          courseAssignmentId.toString(),
          academicYear,
          periodNumber,
        ],
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        enrollmentId: Number(r.enrollment_id),
        studentFullName: r.full_name,
        courseAssignmentId: Number(r.course_assignment_id),
        periodNumber: Number(r.period_number),
        partialScore: Number(r.partial_score),
        observations: r.observations,
        createdAt: r.created_at,
      }));
    });
  }

  async upsertPreReport(
    schoolId: bigint,
    courseAssignmentId: bigint,
    input: {
      academicYear: number;
      enrollmentId: number;
      periodNumber: number;
      partialScore: number;
      observations?: string | null;
    },
  ): Promise<PreReportRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{ id: string; created_at: string }>(
        `INSERT INTO academic_pre_reports (
           school_id, academic_year, enrollment_id, course_assignment_id,
           period_number, partial_score, observations
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (school_id, academic_year, enrollment_id, course_assignment_id, period_number)
         DO UPDATE SET
           partial_score = EXCLUDED.partial_score,
           observations = EXCLUDED.observations
         RETURNING id, created_at::text`,
        [
          schoolId.toString(),
          input.academicYear,
          input.enrollmentId,
          courseAssignmentId.toString(),
          input.periodNumber,
          input.partialScore,
          input.observations ?? null,
        ],
      );
      const nameRes = await client.query<{ full_name: string }>(
        `SELECT TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name
           FROM student_enrollments se
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
          WHERE se.school_id = $1 AND se.id = $2`,
        [schoolId.toString(), input.enrollmentId],
      );
      return {
        id: Number(res.rows[0].id),
        enrollmentId: input.enrollmentId,
        studentFullName: nameRes.rows[0]?.full_name ?? '',
        courseAssignmentId: Number(courseAssignmentId),
        periodNumber: input.periodNumber,
        partialScore: input.partialScore,
        observations: input.observations ?? null,
        createdAt: res.rows[0].created_at,
      };
    });
  }

  async listAchievements(
    schoolId: bigint,
    options: {
      academicYear: number;
      gradeId?: number;
      subjectId?: number;
      periodNumber?: number;
    },
  ): Promise<AchievementStandardRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [schoolId.toString(), options.academicYear];
      const clauses: string[] = [];
      if (options.gradeId) {
        params.push(options.gradeId);
        clauses.push(`AND a.grade_id = $${params.length}`);
      }
      if (options.subjectId) {
        params.push(options.subjectId);
        clauses.push(`AND a.subject_id = $${params.length}`);
      }
      if (options.periodNumber) {
        params.push(options.periodNumber);
        clauses.push(`AND a.period_number = $${params.length}`);
      }

      const res = await client.query<{
        id: string;
        grade_id: string;
        grade_name: string;
        subject_id: string;
        subject_name: string;
        academic_year: number;
        period_number: number;
        code: string | null;
        indicator_type: string;
        description: string;
      }>(
        `SELECT a.id, a.grade_id, g.name AS grade_name, a.subject_id, s.name AS subject_name,
                a.academic_year, a.period_number, a.code, a.indicator_type, a.description
           FROM achievement_standards a
           INNER JOIN grades g ON g.school_id = a.school_id AND g.id = a.grade_id
           INNER JOIN subjects s ON s.school_id = a.school_id AND s.id = a.subject_id
          WHERE a.school_id = $1 AND a.academic_year = $2 AND a.is_active = TRUE
            ${clauses.join(' ')}
          ORDER BY a.period_number, a.id DESC`,
        params,
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        gradeId: Number(r.grade_id),
        gradeName: r.grade_name,
        subjectId: Number(r.subject_id),
        subjectName: r.subject_name,
        academicYear: Number(r.academic_year),
        periodNumber: Number(r.period_number),
        code: r.code,
        indicatorType: r.indicator_type,
        description: r.description,
      }));
    });
  }

  async saveAchievement(
    schoolId: bigint,
    input: {
      gradeId: number;
      subjectId: number;
      academicYear: number;
      periodNumber: number;
      code?: string | null;
      indicatorType?: string;
      description: string;
    },
  ): Promise<AchievementStandardRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const ins = await client.query<{ id: string }>(
        `INSERT INTO achievement_standards (
           school_id, grade_id, subject_id, academic_year, period_number,
           code, indicator_type, description
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id`,
        [
          schoolId.toString(),
          input.gradeId,
          input.subjectId,
          input.academicYear,
          input.periodNumber,
          input.code ?? null,
          input.indicatorType ?? 'ACHIEVEMENT',
          input.description.trim(),
        ],
      );
      const res = await client.query<{
        grade_name: string;
        subject_name: string;
      }>(
        `SELECT g.name AS grade_name, s.name AS subject_name
           FROM grades g, subjects s
          WHERE g.school_id = $1 AND g.id = $2
            AND s.school_id = $1 AND s.id = $3`,
        [schoolId.toString(), input.gradeId, input.subjectId],
      );
      return {
        id: Number(ins.rows[0].id),
        gradeId: input.gradeId,
        gradeName: res.rows[0]?.grade_name ?? '',
        subjectId: input.subjectId,
        subjectName: res.rows[0]?.subject_name ?? '',
        academicYear: input.academicYear,
        periodNumber: input.periodNumber,
        code: input.code ?? null,
        indicatorType: input.indicatorType ?? 'ACHIEVEMENT',
        description: input.description.trim(),
      };
    });
  }

  async deleteAchievement(schoolId: bigint, id: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM achievement_standards WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), id.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('AchievementStandard', id.toString());
      }
    });
  }

  async importAchievements(
    schoolId: bigint,
    input: { fromYear: number; toYear: number; gradeId?: number; subjectId?: number },
  ): Promise<{ importedCount: number }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [schoolId.toString(), input.fromYear, input.toYear];
      const clauses: string[] = [];
      if (input.gradeId) {
        params.push(input.gradeId);
        clauses.push(`AND grade_id = $${params.length}`);
      }
      if (input.subjectId) {
        params.push(input.subjectId);
        clauses.push(`AND subject_id = $${params.length}`);
      }
      const res = await client.query(
        `INSERT INTO achievement_standards (
           school_id, grade_id, subject_id, dimension_id, national_scale_id,
           academic_year, period_number, code, indicator_type, description
         )
         SELECT school_id, grade_id, subject_id, dimension_id, national_scale_id,
                $3, period_number, code, indicator_type, description
           FROM achievement_standards
          WHERE school_id = $1 AND academic_year = $2 AND is_active = TRUE
            ${clauses.join(' ')}`,
        params,
      );
      return { importedCount: res.rowCount ?? 0 };
    });
  }

  async listAbsences(
    schoolId: bigint,
    courseAssignmentId: bigint,
    periodNumber: number,
  ): Promise<StudentAbsenceRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        enrollment_id: string;
        full_name: string;
        course_assignment_id: string | null;
        period_number: number;
        absence_date: string;
        hours_missed: number;
        is_justified: boolean;
        justification_notes: string | null;
      }>(
        `SELECT a.id, a.enrollment_id,
                TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                a.course_assignment_id, a.period_number, a.absence_date::text,
                a.hours_missed, a.is_justified, a.justification_notes
           FROM student_absences a
           INNER JOIN student_enrollments se ON se.school_id = a.school_id AND se.id = a.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
          WHERE a.school_id = $1 AND a.course_assignment_id = $2 AND a.period_number = $3
          ORDER BY a.absence_date DESC, a.id DESC`,
        [schoolId.toString(), courseAssignmentId.toString(), periodNumber],
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        enrollmentId: Number(r.enrollment_id),
        studentFullName: r.full_name,
        courseAssignmentId: r.course_assignment_id
          ? Number(r.course_assignment_id)
          : null,
        periodNumber: Number(r.period_number),
        absenceDate: r.absence_date,
        hoursMissed: Number(r.hours_missed),
        isJustified: r.is_justified,
        justificationNotes: r.justification_notes,
      }));
    });
  }

  async recordAbsence(
    schoolId: bigint,
    input: {
      enrollmentId: number;
      courseAssignmentId?: number | null;
      periodNumber: number;
      absenceDate: string;
      hoursMissed: number;
      isJustified?: boolean;
      justificationNotes?: string | null;
    },
  ): Promise<StudentAbsenceRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const ins = await client.query<{ id: string }>(
        `INSERT INTO student_absences (
           school_id, enrollment_id, course_assignment_id, period_number,
           absence_date, hours_missed, is_justified, justification_notes
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id`,
        [
          schoolId.toString(),
          input.enrollmentId,
          input.courseAssignmentId ?? null,
          input.periodNumber,
          input.absenceDate,
          input.hoursMissed,
          input.isJustified ?? false,
          input.justificationNotes ?? null,
        ],
      );
      const nameRes = await client.query<{ full_name: string }>(
        `SELECT TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name
           FROM student_enrollments se
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
          WHERE se.school_id = $1 AND se.id = $2`,
        [schoolId.toString(), input.enrollmentId],
      );
      return {
        id: Number(ins.rows[0].id),
        enrollmentId: input.enrollmentId,
        studentFullName: nameRes.rows[0]?.full_name ?? '',
        courseAssignmentId: input.courseAssignmentId ?? null,
        periodNumber: input.periodNumber,
        absenceDate: input.absenceDate,
        hoursMissed: input.hoursMissed,
        isJustified: input.isJustified ?? false,
        justificationNotes: input.justificationNotes ?? null,
      };
    });
  }

  async deleteAbsence(schoolId: bigint, absenceId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM student_absences WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), absenceId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('StudentAbsence', absenceId.toString());
      }
    });
  }

  async getStudentObserver(
    schoolId: bigint,
    enrollmentId: bigint,
    academicYear: number,
  ): Promise<StudentObserverView> {
    return this.db.withTenantTransaction(schoolId, async (client) =>
      this.fetchObserverInTx(client, schoolId, enrollmentId, academicYear),
    );
  }

  async upsertStudentObserver(
    schoolId: bigint,
    input: {
      enrollmentId: number;
      academicYear: number;
      templateId?: number | null;
      strengths?: string | null;
      difficulties?: string | null;
      commitments?: string | null;
    },
  ): Promise<StudentObserverView> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      await client.query(
        `INSERT INTO student_observers (
           school_id, enrollment_id, template_id, academic_year,
           strengths, difficulties, commitments
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (school_id, enrollment_id) DO UPDATE SET
           template_id = COALESCE(EXCLUDED.template_id, student_observers.template_id),
           strengths = EXCLUDED.strengths,
           difficulties = EXCLUDED.difficulties,
           commitments = EXCLUDED.commitments`,
        [
          schoolId.toString(),
          input.enrollmentId,
          input.templateId ?? null,
          input.academicYear,
          input.strengths ?? null,
          input.difficulties ?? null,
          input.commitments ?? null,
        ],
      );
      return this.fetchObserverInTx(
        client,
        schoolId,
        BigInt(input.enrollmentId),
        input.academicYear,
      );
    });
  }

  async addObserverAnnotation(
    schoolId: bigint,
    observerId: bigint,
    userId: bigint,
    input: {
      sectionId?: number | null;
      periodNumber: number;
      annotationType?: string;
      severityLevel?: 'PRAISE' | 'MILD' | 'SERIOUS' | 'VERY_SERIOUS';
      situationDescription: string;
      studentVersion?: string | null;
      pedagogicalCommitment?: string | null;
      guardianNotified?: boolean;
      annotationDate?: string;
    },
  ): Promise<ObserverAnnotationRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const ins = await client.query<{ id: string; annotation_date: string }>(
        `INSERT INTO observer_annotations (
           school_id, student_observer_id, section_id, created_by_user_id,
           period_number, annotation_type, severity_level, situation_description,
           student_version, pedagogical_commitment, guardian_notified, annotation_date
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, COALESCE($12::date, CURRENT_DATE))
         RETURNING id, annotation_date::text`,
        [
          schoolId.toString(),
          observerId.toString(),
          input.sectionId ?? null,
          userId.toString(),
          input.periodNumber,
          input.annotationType ?? 'COEXISTENCE',
          input.severityLevel ?? 'MILD',
          input.situationDescription.trim(),
          input.studentVersion ?? null,
          input.pedagogicalCommitment ?? null,
          input.guardianNotified ?? false,
          input.annotationDate ?? null,
        ],
      );
      return {
        id: Number(ins.rows[0].id),
        studentObserverId: Number(observerId),
        sectionId: input.sectionId ?? null,
        sectionTitle: null,
        periodNumber: input.periodNumber,
        annotationType: input.annotationType ?? 'COEXISTENCE',
        severityLevel: input.severityLevel ?? 'MILD',
        situationDescription: input.situationDescription.trim(),
        studentVersion: input.studentVersion ?? null,
        pedagogicalCommitment: input.pedagogicalCommitment ?? null,
        guardianNotified: input.guardianNotified ?? false,
        annotationDate: ins.rows[0].annotation_date,
        createdByName: null,
      };
    });
  }

  async deleteObserverAnnotation(
    schoolId: bigint,
    annotationId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM observer_annotations WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), annotationId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException(
          'ObserverAnnotation',
          annotationId.toString(),
        );
      }
    });
  }

  async listLessonPlans(
    schoolId: bigint,
    academicYear: number,
    courseAssignmentId?: number,
  ): Promise<LessonPlanRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [schoolId.toString(), academicYear];
      let clause = '';
      if (courseAssignmentId) {
        params.push(courseAssignmentId);
        clause = `AND lp.course_assignment_id = $${params.length}`;
      }
      const plansRes = await client.query<{
        id: string;
        course_assignment_id: string;
        subject_name: string;
        grade_group: string;
        academic_year: number;
        period_number: number;
        title: string;
        general_objective: string | null;
        methodology_notes: string | null;
        bibliography: string | null;
        observations: string | null;
      }>(
        `SELECT lp.id, lp.course_assignment_id, s.name AS subject_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                lp.academic_year, lp.period_number, lp.title, lp.general_objective,
                lp.methodology_notes, lp.bibliography, lp.observations
           FROM lesson_plans lp
           INNER JOIN course_assignments ca ON ca.school_id = lp.school_id AND ca.id = lp.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
          WHERE lp.school_id = $1 AND lp.academic_year = $2 ${clause}
          ORDER BY lp.period_number, lp.id DESC`,
        params,
      );

      const unitsRes = await client.query<{
        id: string;
        lesson_plan_id: string;
        unit_number: number;
        topic_title: string;
        content_description: string | null;
        pedagogical_activities: string | null;
        evaluation_strategy: string | null;
        planned_hours: number;
        execution_date: string | null;
      }>(
        `SELECT u.id, u.lesson_plan_id, u.unit_number, u.topic_title, u.content_description,
                u.pedagogical_activities, u.evaluation_strategy, u.planned_hours, u.execution_date::text
           FROM lesson_plan_units u
           INNER JOIN lesson_plans lp ON lp.school_id = u.school_id AND lp.id = u.lesson_plan_id
          WHERE lp.school_id = $1 AND lp.academic_year = $2
          ORDER BY u.unit_number, u.id`,
        [schoolId.toString(), academicYear],
      );

      const unitsByPlan = new Map<number, LessonPlanUnitRow[]>();
      for (const u of unitsRes.rows) {
        const pid = Number(u.lesson_plan_id);
        const list = unitsByPlan.get(pid) ?? [];
        list.push({
          id: Number(u.id),
          lessonPlanId: pid,
          unitNumber: Number(u.unit_number),
          topicTitle: u.topic_title,
          contentDescription: u.content_description,
          pedagogicalActivities: u.pedagogical_activities,
          evaluationStrategy: u.evaluation_strategy,
          plannedHours: Number(u.planned_hours ?? 2),
          executionDate: u.execution_date,
        });
        unitsByPlan.set(pid, list);
      }

      return plansRes.rows.map((p) => ({
        id: Number(p.id),
        courseAssignmentId: Number(p.course_assignment_id),
        subjectName: p.subject_name,
        gradeGroupLabel: p.grade_group,
        academicYear: Number(p.academic_year),
        periodNumber: Number(p.period_number),
        title: p.title,
        generalObjective: p.general_objective,
        methodologyNotes: p.methodology_notes,
        bibliography: p.bibliography,
        observations: p.observations,
        units: unitsByPlan.get(Number(p.id)) ?? [],
      }));
    });
  }

  async createLessonPlan(
    schoolId: bigint,
    input: {
      courseAssignmentId: number;
      academicYear: number;
      periodNumber: number;
      title: string;
      generalObjective?: string | null;
      methodologyNotes?: string | null;
      bibliography?: string | null;
      observations?: string | null;
    },
  ): Promise<LessonPlanRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const ins = await client.query<{ id: string }>(
        `INSERT INTO lesson_plans (
           school_id, course_assignment_id, academic_year, period_number,
           title, general_objective, methodology_notes, bibliography, observations
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id`,
        [
          schoolId.toString(),
          input.courseAssignmentId,
          input.academicYear,
          input.periodNumber,
          input.title.trim(),
          input.generalObjective ?? null,
          input.methodologyNotes ?? null,
          input.bibliography ?? null,
          input.observations ?? null,
        ],
      );
      return {
        id: Number(ins.rows[0].id),
        courseAssignmentId: input.courseAssignmentId,
        subjectName: '',
        gradeGroupLabel: '',
        academicYear: input.academicYear,
        periodNumber: input.periodNumber,
        title: input.title.trim(),
        generalObjective: input.generalObjective ?? null,
        methodologyNotes: input.methodologyNotes ?? null,
        bibliography: input.bibliography ?? null,
        observations: input.observations ?? null,
        units: [],
      };
    });
  }

  async deleteLessonPlan(schoolId: bigint, planId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM lesson_plans WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), planId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('LessonPlan', planId.toString());
      }
    });
  }

  async addLessonPlanUnit(
    schoolId: bigint,
    planId: bigint,
    input: {
      unitNumber?: number;
      topicTitle: string;
      contentDescription?: string | null;
      pedagogicalActivities?: string | null;
      evaluationStrategy?: string | null;
      plannedHours?: number;
      executionDate?: string | null;
    },
  ): Promise<LessonPlanUnitRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const ins = await client.query<{ id: string }>(
        `INSERT INTO lesson_plan_units (
           school_id, lesson_plan_id, unit_number, topic_title,
           content_description, pedagogical_activities, evaluation_strategy,
           planned_hours, execution_date
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id`,
        [
          schoolId.toString(),
          planId.toString(),
          input.unitNumber ?? 1,
          input.topicTitle.trim(),
          input.contentDescription ?? null,
          input.pedagogicalActivities ?? null,
          input.evaluationStrategy ?? null,
          input.plannedHours ?? 2,
          input.executionDate ?? null,
        ],
      );
      return {
        id: Number(ins.rows[0].id),
        lessonPlanId: Number(planId),
        unitNumber: input.unitNumber ?? 1,
        topicTitle: input.topicTitle.trim(),
        contentDescription: input.contentDescription ?? null,
        pedagogicalActivities: input.pedagogicalActivities ?? null,
        evaluationStrategy: input.evaluationStrategy ?? null,
        plannedHours: input.plannedHours ?? 2,
        executionDate: input.executionDate ?? null,
      };
    });
  }

  async deleteLessonPlanUnit(schoolId: bigint, unitId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM lesson_plan_units WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), unitId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('LessonPlanUnit', unitId.toString());
      }
    });
  }

  async listTeacherActivities(
    schoolId: bigint,
    courseAssignmentId?: number,
  ): Promise<VirtualActivityRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [schoolId.toString()];
      let clause = '';
      if (courseAssignmentId) {
        params.push(courseAssignmentId);
        clause = `AND va.course_assignment_id = $${params.length}`;
      }
      const res = await client.query<{
        id: string;
        course_assignment_id: string;
        subject_name: string;
        grade_group: string;
        teacher_name: string;
        period_number: number;
        title: string;
        instructions: string;
        resource_url: string | null;
        due_date: string | null;
        is_published: boolean;
        submissions_count: string;
      }>(
        `SELECT va.id, va.course_assignment_id, s.name AS subject_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name,
                va.period_number, va.title, va.instructions, va.resource_url,
                va.due_date::text, va.is_published,
                (SELECT COUNT(*)::text FROM virtual_activity_submissions vas
                  WHERE vas.school_id = va.school_id AND vas.virtual_activity_id = va.id) AS submissions_count
           FROM virtual_activities va
           INNER JOIN course_assignments ca ON ca.school_id = va.school_id AND ca.id = va.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
          WHERE va.school_id = $1 ${clause}
          ORDER BY va.created_at DESC`,
        params,
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        courseAssignmentId: Number(r.course_assignment_id),
        subjectName: r.subject_name,
        gradeGroupLabel: r.grade_group,
        teacherName: r.teacher_name,
        periodNumber: Number(r.period_number),
        title: r.title,
        instructions: r.instructions,
        resourceUrl: r.resource_url,
        dueDate: r.due_date,
        isPublished: r.is_published,
        submissionsCount: Number(r.submissions_count),
      }));
    });
  }

  async createVirtualActivity(
    schoolId: bigint,
    input: {
      courseAssignmentId: number;
      periodNumber: number;
      title: string;
      instructions: string;
      resourceUrl?: string | null;
      dueDate?: string | null;
      isPublished?: boolean;
    },
  ): Promise<VirtualActivityRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const ins = await client.query<{ id: string }>(
        `INSERT INTO virtual_activities (
           school_id, course_assignment_id, period_number, title,
           instructions, resource_url, due_date, is_published
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id`,
        [
          schoolId.toString(),
          input.courseAssignmentId,
          input.periodNumber,
          input.title.trim(),
          input.instructions.trim(),
          input.resourceUrl ?? null,
          input.dueDate ?? null,
          input.isPublished ?? true,
        ],
      );
      return {
        id: Number(ins.rows[0].id),
        courseAssignmentId: input.courseAssignmentId,
        subjectName: '',
        gradeGroupLabel: '',
        teacherName: '',
        periodNumber: input.periodNumber,
        title: input.title.trim(),
        instructions: input.instructions.trim(),
        resourceUrl: input.resourceUrl ?? null,
        dueDate: input.dueDate ?? null,
        isPublished: input.isPublished ?? true,
        submissionsCount: 0,
      };
    });
  }

  async deleteVirtualActivity(
    schoolId: bigint,
    activityId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM virtual_activities WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), activityId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException(
          'VirtualActivity',
          activityId.toString(),
        );
      }
    });
  }

  async listActivitySubmissions(
    schoolId: bigint,
    activityId: bigint,
  ): Promise<ActivitySubmissionRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        virtual_activity_id: string;
        enrollment_id: string;
        full_name: string;
        document_number: string;
        student_comment: string | null;
        score: string | null;
        teacher_feedback: string | null;
        submitted_at: string;
        graded_at: string | null;
      }>(
        `SELECT vas.id, vas.virtual_activity_id, vas.enrollment_id,
                TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                sp.document_number, vas.student_comment, vas.score,
                vas.teacher_feedback, vas.submitted_at::text, vas.graded_at::text
           FROM virtual_activity_submissions vas
           INNER JOIN student_enrollments se ON se.school_id = vas.school_id AND se.id = vas.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
          WHERE vas.school_id = $1 AND vas.virtual_activity_id = $2
          ORDER BY vas.submitted_at DESC`,
        [schoolId.toString(), activityId.toString()],
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        virtualActivityId: Number(r.virtual_activity_id),
        enrollmentId: Number(r.enrollment_id),
        studentFullName: r.full_name,
        studentDocumentNumber: r.document_number,
        studentComment: r.student_comment,
        score: r.score !== null ? Number(r.score) : null,
        teacherFeedback: r.teacher_feedback,
        submittedAt: r.submitted_at,
        gradedAt: r.graded_at,
      }));
    });
  }

  async gradeActivitySubmission(
    schoolId: bigint,
    submissionId: bigint,
    input: { score: number; teacherFeedback?: string | null },
  ): Promise<ActivitySubmissionRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        virtual_activity_id: string;
        enrollment_id: string;
        student_comment: string | null;
        submitted_at: string;
        graded_at: string;
      }>(
        `UPDATE virtual_activity_submissions
            SET score = $3, teacher_feedback = $4, graded_at = NOW()
          WHERE school_id = $1 AND id = $2
          RETURNING id, virtual_activity_id, enrollment_id, student_comment, submitted_at::text, graded_at::text`,
        [
          schoolId.toString(),
          submissionId.toString(),
          input.score,
          input.teacherFeedback ?? null,
        ],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException(
          'ActivitySubmission',
          submissionId.toString(),
        );
      }
      const r = res.rows[0];
      return {
        id: Number(r.id),
        virtualActivityId: Number(r.virtual_activity_id),
        enrollmentId: Number(r.enrollment_id),
        studentFullName: '',
        studentDocumentNumber: '',
        studentComment: r.student_comment,
        score: input.score,
        teacherFeedback: input.teacherFeedback ?? null,
        submittedAt: r.submitted_at,
        gradedAt: r.graded_at,
      };
    });
  }

  async listTeacherEvaluations(
    schoolId: bigint,
    courseAssignmentId?: number,
  ): Promise<OnlineEvaluationRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [schoolId.toString()];
      let clause = '';
      if (courseAssignmentId) {
        params.push(courseAssignmentId);
        clause = `AND oe.course_assignment_id = $${params.length}`;
      }
      const evalsRes = await client.query<{
        id: string;
        course_assignment_id: string;
        subject_name: string;
        grade_group: string;
        period_number: number;
        evaluation_type: string;
        title: string;
        description: string | null;
        duration_minutes: number;
        max_attempts: number;
        available_from: string | null;
        available_until: string | null;
        is_published: boolean;
      }>(
        `SELECT oe.id, oe.course_assignment_id, s.name AS subject_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                oe.period_number, oe.evaluation_type, oe.title, oe.description,
                oe.duration_minutes, oe.max_attempts,
                oe.available_from::text, oe.available_until::text, oe.is_published
           FROM online_evaluations oe
           INNER JOIN course_assignments ca ON ca.school_id = oe.school_id AND ca.id = oe.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
          WHERE oe.school_id = $1 ${clause}
          ORDER BY oe.created_at DESC`,
        params,
      );

      const rows: OnlineEvaluationRow[] = [];
      for (const ev of evalsRes.rows) {
        const questions = await this.fetchEvaluationQuestionsInTx(
          client,
          schoolId,
          Number(ev.id),
          true,
        );
        rows.push({
          id: Number(ev.id),
          courseAssignmentId: Number(ev.course_assignment_id),
          subjectName: ev.subject_name,
          gradeGroupLabel: ev.grade_group,
          periodNumber: Number(ev.period_number),
          evaluationType: ev.evaluation_type,
          title: ev.title,
          description: ev.description,
          durationMinutes: Number(ev.duration_minutes),
          maxAttempts: Number(ev.max_attempts),
          availableFrom: ev.available_from,
          availableUntil: ev.available_until,
          isPublished: ev.is_published,
          questions,
        });
      }
      return rows;
    });
  }

  async createOnlineEvaluation(
    schoolId: bigint,
    input: {
      courseAssignmentId: number;
      periodNumber: number;
      evaluationType?: string;
      title: string;
      description?: string | null;
      durationMinutes?: number;
      maxAttempts?: number;
      availableFrom?: string | null;
      availableUntil?: string | null;
      isPublished?: boolean;
    },
  ): Promise<OnlineEvaluationRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const ins = await client.query<{ id: string }>(
        `INSERT INTO online_evaluations (
           school_id, course_assignment_id, period_number, evaluation_type,
           title, description, duration_minutes, max_attempts,
           available_from, available_until, is_published
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          schoolId.toString(),
          input.courseAssignmentId,
          input.periodNumber,
          input.evaluationType ?? 'EXAM',
          input.title.trim(),
          input.description ?? null,
          input.durationMinutes ?? 60,
          input.maxAttempts ?? 1,
          input.availableFrom ?? null,
          input.availableUntil ?? null,
          input.isPublished ?? true,
        ],
      );
      return {
        id: Number(ins.rows[0].id),
        courseAssignmentId: input.courseAssignmentId,
        subjectName: '',
        gradeGroupLabel: '',
        periodNumber: input.periodNumber,
        evaluationType: input.evaluationType ?? 'EXAM',
        title: input.title.trim(),
        description: input.description ?? null,
        durationMinutes: input.durationMinutes ?? 60,
        maxAttempts: input.maxAttempts ?? 1,
        availableFrom: input.availableFrom ?? null,
        availableUntil: input.availableUntil ?? null,
        isPublished: input.isPublished ?? true,
        questions: [],
      };
    });
  }

  async deleteOnlineEvaluation(
    schoolId: bigint,
    evaluationId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM online_evaluations WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), evaluationId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException(
          'OnlineEvaluation',
          evaluationId.toString(),
        );
      }
    });
  }

  async addEvaluationQuestion(
    schoolId: bigint,
    evaluationId: bigint,
    input: {
      questionTypeId?: number;
      questionText: string;
      points?: number;
      displayOrder?: number;
      options: Array<{
        optionLabel?: string | null;
        optionText: string;
        isCorrect: boolean;
      }>;
    },
  ): Promise<OnlineEvaluationQuestionRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const qRes = await client.query<{ id: string }>(
        `INSERT INTO online_evaluation_questions (
           school_id, online_evaluation_id, question_type_id, question_text,
           points, display_order
         )
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [
          schoolId.toString(),
          evaluationId.toString(),
          input.questionTypeId ?? 2,
          input.questionText.trim(),
          input.points ?? 1,
          input.displayOrder ?? 1,
        ],
      );
      const qId = Number(qRes.rows[0].id);
      const savedOptions: OnlineEvaluationQuestionRow['options'] = [];

      for (let idx = 0; idx < input.options.length; idx += 1) {
        const opt = input.options[idx];
        const label = opt.optionLabel ?? String.fromCharCode(65 + idx);
        const oRes = await client.query<{ id: string }>(
          `INSERT INTO online_evaluation_options (
             school_id, question_id, option_label, option_text, is_correct
           )
           VALUES ($1,$2,$3,$4,$5)
           RETURNING id`,
          [
            schoolId.toString(),
            qId,
            label,
            opt.optionText.trim(),
            opt.isCorrect,
          ],
        );
        savedOptions.push({
          id: Number(oRes.rows[0].id),
          optionLabel: label,
          optionText: opt.optionText.trim(),
          isCorrect: opt.isCorrect,
        });
      }

      return {
        id: qId,
        questionTypeId: input.questionTypeId ?? 2,
        questionText: input.questionText.trim(),
        points: input.points ?? 1,
        displayOrder: input.displayOrder ?? 1,
        options: savedOptions,
      };
    });
  }

  async deleteEvaluationQuestion(
    schoolId: bigint,
    questionId: bigint,
  ): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM online_evaluation_questions WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), questionId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException(
          'EvaluationQuestion',
          questionId.toString(),
        );
      }
    });
  }

  async listEvaluationAttempts(
    schoolId: bigint,
    evaluationId: bigint,
  ): Promise<EvaluationAttemptRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query<{
        id: string;
        online_evaluation_id: string;
        enrollment_id: string;
        full_name: string;
        attempt_number: number;
        total_score: string;
        submitted_at: string | null;
      }>(
        `SELECT a.id, a.online_evaluation_id, a.enrollment_id,
                TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name)) AS full_name,
                a.attempt_number, a.total_score, a.submitted_at::text
           FROM online_evaluation_attempts a
           INNER JOIN student_enrollments se ON se.school_id = a.school_id AND se.id = a.enrollment_id
           INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
          WHERE a.school_id = $1 AND a.online_evaluation_id = $2
          ORDER BY a.submitted_at DESC NULLS LAST`,
        [schoolId.toString(), evaluationId.toString()],
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        onlineEvaluationId: Number(r.online_evaluation_id),
        enrollmentId: Number(r.enrollment_id),
        studentFullName: r.full_name,
        attemptNumber: Number(r.attempt_number),
        totalScore: Number(r.total_score),
        submittedAt: r.submitted_at,
      }));
    });
  }

  async listTeacherLiveClasses(
    schoolId: bigint,
    courseAssignmentId?: number,
  ): Promise<LiveClassRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const params: unknown[] = [schoolId.toString()];
      let clause = '';
      if (courseAssignmentId) {
        params.push(courseAssignmentId);
        clause = `AND lc.course_assignment_id = $${params.length}`;
      }
      const res = await client.query<{
        id: string;
        course_assignment_id: string;
        subject_name: string;
        grade_group: string;
        teacher_name: string;
        title: string;
        meeting_url: string;
        scheduled_start: string;
        scheduled_end: string | null;
        is_active: boolean;
        attendances_count: string;
      }>(
        `SELECT lc.id, lc.course_assignment_id, s.name AS subject_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name,
                lc.title, lc.meeting_url, lc.scheduled_start::text, lc.scheduled_end::text,
                lc.is_active,
                (SELECT COUNT(*)::text FROM live_class_attendances lca
                  WHERE lca.school_id = lc.school_id AND lca.live_class_id = lc.id) AS attendances_count
           FROM live_classes lc
           INNER JOIN course_assignments ca ON ca.school_id = lc.school_id AND ca.id = lc.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
          WHERE lc.school_id = $1 ${clause}
          ORDER BY lc.scheduled_start DESC`,
        params,
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        courseAssignmentId: Number(r.course_assignment_id),
        subjectName: r.subject_name,
        gradeGroupLabel: r.grade_group,
        teacherName: r.teacher_name,
        title: r.title,
        meetingUrl: r.meeting_url,
        scheduledStart: r.scheduled_start,
        scheduledEnd: r.scheduled_end,
        isActive: r.is_active,
        attendancesCount: Number(r.attendances_count),
      }));
    });
  }

  async createLiveClass(
    schoolId: bigint,
    input: {
      courseAssignmentId: number;
      title: string;
      meetingUrl: string;
      scheduledStart: string;
      scheduledEnd?: string | null;
    },
  ): Promise<LiveClassRow> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const ins = await client.query<{ id: string }>(
        `INSERT INTO live_classes (
           school_id, course_assignment_id, title, meeting_url,
           scheduled_start, scheduled_end
         )
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [
          schoolId.toString(),
          input.courseAssignmentId,
          input.title.trim(),
          input.meetingUrl.trim(),
          input.scheduledStart,
          input.scheduledEnd ?? null,
        ],
      );
      return {
        id: Number(ins.rows[0].id),
        courseAssignmentId: input.courseAssignmentId,
        subjectName: '',
        gradeGroupLabel: '',
        teacherName: '',
        title: input.title.trim(),
        meetingUrl: input.meetingUrl.trim(),
        scheduledStart: input.scheduledStart,
        scheduledEnd: input.scheduledEnd ?? null,
        isActive: true,
        attendancesCount: 0,
      };
    });
  }

  async deleteLiveClass(schoolId: bigint, liveClassId: bigint): Promise<void> {
    await this.db.withTenantTransaction(schoolId, async (client) => {
      const res = await client.query(
        `DELETE FROM live_classes WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), liveClassId.toString()],
      );
      if (res.rowCount === 0) {
        throw new ResourceNotFoundException('LiveClass', liveClassId.toString());
      }
    });
  }

  // =========================================================================
  // PORTAL ESTUDIANTE Y FAMILIA (Cero SQL desde cliente, aislamiento RLS)
  // =========================================================================

  async getStudentOverview(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<StudentPortalOverview> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const enr = await this.resolveStudentEnrollmentInTx(
        client,
        schoolId,
        userId,
        academicYear,
      );
      if (!enr) {
        return {
          enrollmentId: null,
          studentProfileId: null,
          studentFullName: null,
          documentNumber: null,
          campusName: null,
          shiftName: null,
          gradeName: null,
          groupCode: null,
          academicYear,
          homeroomTeacherName: null,
          courses: [],
          pendingActivitiesCount: 0,
          availableEvaluationsCount: 0,
          upcomingLiveClassesCount: 0,
        };
      }

      const coursesRes = await client.query<{
        id: string;
        subject_name: string;
        area_name: string;
        teacher_name: string;
        weekly_hours: number;
      }>(
        `SELECT ca.id, s.name AS subject_name, COALESCE(aa.name, 'Sin área') AS area_name,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name,
                ca.weekly_hours
           FROM course_assignments ca
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           LEFT JOIN subject_area_assignments saa
             ON saa.school_id = ca.school_id
            AND saa.academic_year = ca.academic_year
            AND saa.subject_id = s.id
           LEFT JOIN academic_areas aa
             ON aa.school_id = s.school_id
            AND aa.id = COALESCE(saa.academic_area_id, s.academic_area_id)
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
          WHERE ca.school_id = $1 AND ca.academic_group_id = $2
            AND ca.academic_year = $3 AND ca.is_active = TRUE
          ORDER BY COALESCE(aa.name, 'Sin área'), s.name`,
        [schoolId.toString(), enr.academicGroupId, academicYear],
      );

      const countsRes = await client.query<{
        acts: string;
        evals: string;
        lives: string;
      }>(
        `SELECT
           (SELECT COUNT(*)::text
              FROM virtual_activities va
              INNER JOIN course_assignments ca ON ca.school_id = va.school_id AND ca.id = va.course_assignment_id
             WHERE va.school_id = $1 AND ca.academic_group_id = $2
               AND ca.academic_year = $3 AND va.is_published = TRUE) AS acts,
           (SELECT COUNT(*)::text
              FROM online_evaluations oe
              INNER JOIN course_assignments ca ON ca.school_id = oe.school_id AND ca.id = oe.course_assignment_id
             WHERE oe.school_id = $1 AND ca.academic_group_id = $2
               AND ca.academic_year = $3 AND oe.is_published = TRUE) AS evals,
           (SELECT COUNT(*)::text
              FROM live_classes lc
              INNER JOIN course_assignments ca ON ca.school_id = lc.school_id AND ca.id = lc.course_assignment_id
             WHERE lc.school_id = $1 AND ca.academic_group_id = $2
               AND ca.academic_year = $3 AND lc.is_active = TRUE) AS lives`,
        [schoolId.toString(), enr.academicGroupId, academicYear],
      );

      return {
        enrollmentId: enr.enrollmentId,
        studentProfileId: enr.studentProfileId,
        studentFullName: enr.fullName,
        documentNumber: enr.documentNumber,
        campusName: enr.campusName,
        shiftName: enr.shiftName,
        gradeName: enr.gradeName,
        groupCode: enr.groupCode,
        academicYear,
        homeroomTeacherName: enr.homeroomTeacherName,
        courses: coursesRes.rows.map((c) => ({
          courseAssignmentId: Number(c.id),
          subjectName: c.subject_name,
          academicAreaName: c.area_name,
          teacherName: c.teacher_name,
          weeklyHours: Number(c.weekly_hours),
        })),
        pendingActivitiesCount: Number(countsRes.rows[0]?.acts ?? 0),
        availableEvaluationsCount: Number(countsRes.rows[0]?.evals ?? 0),
        upcomingLiveClassesCount: Number(countsRes.rows[0]?.lives ?? 0),
      };
    });
  }

  async getStudentGrades(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    periodNumber?: number,
  ): Promise<StudentPortalGradesView> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const enr = await this.resolveStudentEnrollmentInTx(
        client,
        schoolId,
        userId,
        academicYear,
      );
      if (!enr) {
        return {
          enrollmentId: null,
          academicYear,
          grades: [],
          preReports: [],
          observerAnnotations: [],
        };
      }
      if (!enr.accessControls.canViewScores) {
        throw new ForbiddenException(
          'El acceso a la consulta de calificaciones se encuentra restringido temporalmente para esta matrícula.',
        );
      }

      const params: unknown[] = [schoolId.toString(), academicYear, enr.enrollmentId];
      let periodClause = '';
      if (periodNumber) {
        params.push(periodNumber);
        periodClause = `AND gr.period_number = $${params.length}`;
      }

      const gradesRes = await client.query<{
        id: string;
        period_number: number;
        subject_name: string;
        area_name: string;
        teacher_name: string;
        final_score: string;
        lost_score: string | null;
        recovery_score: string | null;
        effective_score: string;
        justified_absences: number;
        unjustified_absences: number;
        pre_report_obs: string | null;
      }>(
        `SELECT gr.id, gr.period_number, s.name AS subject_name,
                COALESCE(aa.name, 'Sin área') AS area_name,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name,
                gr.final_score, gr.lost_score, gr.recovery_score,
                GREATEST(COALESCE(gr.recovery_score, 0), gr.final_score) AS effective_score,
                gr.justified_absences, gr.unjustified_absences,
                pr.observations AS pre_report_obs
           FROM academic_scores gr
           INNER JOIN course_assignments ca ON ca.school_id = gr.school_id AND ca.id = gr.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           LEFT JOIN subject_area_assignments saa
             ON saa.school_id = gr.school_id
            AND saa.academic_year = gr.academic_year
            AND saa.subject_id = s.id
           LEFT JOIN academic_areas aa
             ON aa.school_id = s.school_id
            AND aa.id = COALESCE(saa.academic_area_id, s.academic_area_id)
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
           LEFT JOIN academic_pre_reports pr
             ON pr.school_id = gr.school_id
            AND pr.academic_year = gr.academic_year
            AND pr.enrollment_id = gr.enrollment_id
            AND pr.course_assignment_id = gr.course_assignment_id
            AND pr.period_number = gr.period_number
          WHERE gr.school_id = $1 AND gr.academic_year = $2 AND gr.enrollment_id = $3
            ${periodClause}
          ORDER BY gr.period_number, COALESCE(aa.name, 'Sin área'), s.name`,
        params,
      );

      const preRes = await client.query<{
        period_number: number;
        subject_name: string;
        partial_score: string | null;
        observations: string | null;
      }>(
        `SELECT pr.period_number, s.name AS subject_name, pr.partial_score, pr.observations
           FROM academic_pre_reports pr
           INNER JOIN course_assignments ca ON ca.school_id = pr.school_id AND ca.id = pr.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
          WHERE pr.school_id = $1 AND pr.academic_year = $2 AND pr.enrollment_id = $3
          ORDER BY pr.period_number DESC`,
        [schoolId.toString(), academicYear, enr.enrollmentId],
      );

      const observer = await this.fetchObserverInTx(
        client,
        schoolId,
        BigInt(enr.enrollmentId),
        academicYear,
      );

      return {
        enrollmentId: enr.enrollmentId,
        academicYear,
        grades: gradesRes.rows.map((g) => ({
          id: Number(g.id),
          periodNumber: Number(g.period_number),
          subjectName: g.subject_name,
          academicAreaName: g.area_name,
          teacherName: g.teacher_name,
          finalScore: Number(g.final_score),
          recoveryScore: Number(g.recovery_score ?? 0),
          levelingScore: Number(g.lost_score ?? 0),
          effectiveScore: Number(g.effective_score),
          justifiedAbsences: Number(g.justified_absences),
          unjustifiedAbsences: Number(g.unjustified_absences),
          teacherObservations: g.pre_report_obs,
        })),
        preReports: preRes.rows.map((p) => ({
          periodNumber: Number(p.period_number),
          subjectName: p.subject_name,
          partialScore: Number(p.partial_score ?? 0),
          observations: p.observations,
        })),
        observerAnnotations: observer.annotations,
      };
    });
  }

  async listStudentActivities(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<VirtualActivityRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const enr = await this.resolveStudentEnrollmentInTx(
        client,
        schoolId,
        userId,
        academicYear,
      );
      if (!enr || !enr.accessControls.canViewActivities) return [];

      const res = await client.query<{
        id: string;
        course_assignment_id: string;
        subject_name: string;
        grade_group: string;
        teacher_name: string;
        period_number: number;
        title: string;
        instructions: string;
        resource_url: string | null;
        due_date: string | null;
        is_published: boolean;
        sub_id: string | null;
        student_comment: string | null;
        score: string | null;
        teacher_feedback: string | null;
        submitted_at: string | null;
        graded_at: string | null;
      }>(
        `SELECT va.id, va.course_assignment_id, s.name AS subject_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name,
                va.period_number, va.title, va.instructions, va.resource_url,
                va.due_date::text, va.is_published,
                vas.id AS sub_id, vas.student_comment, vas.score,
                vas.teacher_feedback, vas.submitted_at::text, vas.graded_at::text
           FROM virtual_activities va
           INNER JOIN course_assignments ca ON ca.school_id = va.school_id AND ca.id = va.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
           LEFT JOIN virtual_activity_submissions vas
             ON vas.school_id = va.school_id
            AND vas.virtual_activity_id = va.id
            AND vas.enrollment_id = $4
          WHERE va.school_id = $1
            AND ca.academic_group_id = $2
            AND ca.academic_year = $3
            AND va.is_published = TRUE
          ORDER BY va.due_date NULLS LAST, va.created_at DESC`,
        [schoolId.toString(), enr.academicGroupId, academicYear, enr.enrollmentId],
      );

      return res.rows.map((r) => ({
        id: Number(r.id),
        courseAssignmentId: Number(r.course_assignment_id),
        subjectName: r.subject_name,
        gradeGroupLabel: r.grade_group,
        teacherName: r.teacher_name,
        periodNumber: Number(r.period_number),
        title: r.title,
        instructions: r.instructions,
        resourceUrl: r.resource_url,
        dueDate: r.due_date,
        isPublished: r.is_published,
        submissionsCount: r.sub_id ? 1 : 0,
        mySubmission: r.sub_id
          ? {
              id: Number(r.sub_id),
              studentComment: r.student_comment,
              score: r.score !== null ? Number(r.score) : null,
              teacherFeedback: r.teacher_feedback,
              submittedAt: r.submitted_at ?? '',
              gradedAt: r.graded_at,
            }
          : null,
      }));
    });
  }

  async submitStudentActivity(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    activityId: bigint,
    input: { studentComment: string },
  ): Promise<{ submissionId: number; submittedAt: string }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const enr = await this.resolveStudentEnrollmentInTx(
        client,
        schoolId,
        userId,
        academicYear,
      );
      if (!enr) {
        throw new ForbiddenException(
          'No se encontró una matrícula activa para enviar la actividad.',
        );
      }
      if (!enr.accessControls.canViewActivities) {
        throw new ForbiddenException(
          'El acceso a actividades académicas está restringido para esta matrícula.',
        );
      }

      const res = await client.query<{ id: string; submitted_at: string }>(
        `INSERT INTO virtual_activity_submissions (
           school_id, virtual_activity_id, enrollment_id, student_comment
         )
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (school_id, virtual_activity_id, enrollment_id) DO UPDATE SET
           student_comment = EXCLUDED.student_comment,
           submitted_at = NOW()
         RETURNING id, submitted_at::text`,
        [
          schoolId.toString(),
          activityId.toString(),
          enr.enrollmentId,
          input.studentComment.trim(),
        ],
      );
      return {
        submissionId: Number(res.rows[0].id),
        submittedAt: res.rows[0].submitted_at,
      };
    });
  }

  async listStudentEvaluations(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<OnlineEvaluationRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const enr = await this.resolveStudentEnrollmentInTx(
        client,
        schoolId,
        userId,
        academicYear,
      );
      if (!enr || !enr.accessControls.canTakeEvaluations) return [];

      const evalsRes = await client.query<{
        id: string;
        course_assignment_id: string;
        subject_name: string;
        grade_group: string;
        period_number: number;
        evaluation_type: string;
        title: string;
        description: string | null;
        duration_minutes: number;
        max_attempts: number;
        available_from: string | null;
        available_until: string | null;
        is_published: boolean;
        attempts_count: string;
        best_score: string | null;
      }>(
        `SELECT oe.id, oe.course_assignment_id, s.name AS subject_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                oe.period_number, oe.evaluation_type, oe.title, oe.description,
                oe.duration_minutes, oe.max_attempts,
                oe.available_from::text, oe.available_until::text, oe.is_published,
                (SELECT COUNT(*)::text FROM online_evaluation_attempts a
                  WHERE a.school_id = oe.school_id AND a.online_evaluation_id = oe.id AND a.enrollment_id = $4) AS attempts_count,
                (SELECT MAX(a.total_score)::text FROM online_evaluation_attempts a
                  WHERE a.school_id = oe.school_id AND a.online_evaluation_id = oe.id AND a.enrollment_id = $4) AS best_score
           FROM online_evaluations oe
           INNER JOIN course_assignments ca ON ca.school_id = oe.school_id AND ca.id = oe.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
          WHERE oe.school_id = $1 AND ca.academic_group_id = $2
            AND ca.academic_year = $3 AND oe.is_published = TRUE
          ORDER BY oe.created_at DESC`,
        [schoolId.toString(), enr.academicGroupId, academicYear, enr.enrollmentId],
      );

      const rows: OnlineEvaluationRow[] = [];
      for (const ev of evalsRes.rows) {
        // NUNCA enviar is_correct al estudiante (seguridad anti-trampa)
        const questions = await this.fetchEvaluationQuestionsInTx(
          client,
          schoolId,
          Number(ev.id),
          false,
        );
        rows.push({
          id: Number(ev.id),
          courseAssignmentId: Number(ev.course_assignment_id),
          subjectName: ev.subject_name,
          gradeGroupLabel: ev.grade_group,
          periodNumber: Number(ev.period_number),
          evaluationType: ev.evaluation_type,
          title: ev.title,
          description: ev.description,
          durationMinutes: Number(ev.duration_minutes),
          maxAttempts: Number(ev.max_attempts),
          availableFrom: ev.available_from,
          availableUntil: ev.available_until,
          isPublished: ev.is_published,
          questions,
          myAttemptsCount: Number(ev.attempts_count),
          myBestScore: ev.best_score !== null ? Number(ev.best_score) : null,
        });
      }
      return rows;
    });
  }

  async submitStudentEvaluation(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    evaluationId: bigint,
    input: { answers: Array<{ questionId: number; selectedOptionId: number }> },
  ): Promise<{
    attemptId: number;
    attemptNumber: number;
    totalScore: number;
    maxScore: number;
  }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const enr = await this.resolveStudentEnrollmentInTx(
        client,
        schoolId,
        userId,
        academicYear,
      );
      if (!enr) {
        throw new ForbiddenException(
          'No se encontró una matrícula activa para presentar evaluaciones.',
        );
      }
      if (!enr.accessControls.canTakeEvaluations) {
        throw new ForbiddenException(
          'El acceso a evaluaciones en línea se encuentra restringido para esta matrícula.',
        );
      }

      const evalRes = await client.query<{
        max_attempts: number;
        is_published: boolean;
      }>(
        `SELECT max_attempts, is_published
           FROM online_evaluations
          WHERE school_id = $1 AND id = $2`,
        [schoolId.toString(), evaluationId.toString()],
      );
      if (evalRes.rowCount === 0 || !evalRes.rows[0].is_published) {
        throw new ResourceNotFoundException(
          'OnlineEvaluation',
          evaluationId.toString(),
        );
      }

      const prevCountRes = await client.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total
           FROM online_evaluation_attempts
          WHERE school_id = $1 AND online_evaluation_id = $2 AND enrollment_id = $3`,
        [schoolId.toString(), evaluationId.toString(), enr.enrollmentId],
      );
      const attemptNumber = Number(prevCountRes.rows[0]?.total ?? 0) + 1;
      if (attemptNumber > Number(evalRes.rows[0].max_attempts)) {
        throw new ForbiddenException(
          'Has alcanzado el número máximo de intentos permitidos para esta evaluación.',
        );
      }

      // Calificación 100% en servidor usando respuestas correctas en BD
      const qRes = await client.query<{
        question_id: string;
        points: string;
        correct_option_id: string | null;
      }>(
        `SELECT q.id AS question_id, q.points,
                (SELECT o.id FROM online_evaluation_options o
                  WHERE o.school_id = q.school_id AND o.question_id = q.id AND o.is_correct = TRUE
                  LIMIT 1) AS correct_option_id
           FROM online_evaluation_questions q
          WHERE q.school_id = $1 AND q.online_evaluation_id = $2`,
        [schoolId.toString(), evaluationId.toString()],
      );

      let maxScore = 0;
      let totalScore = 0;
      const answerMap = new Map<number, number>();
      for (const a of input.answers) {
        answerMap.set(a.questionId, a.selectedOptionId);
      }

      for (const q of qRes.rows) {
        const pts = Number(q.points);
        maxScore += pts;
        const chosen = answerMap.get(Number(q.question_id));
        if (q.correct_option_id && chosen === Number(q.correct_option_id)) {
          totalScore += pts;
        }
      }

      const ins = await client.query<{ id: string }>(
        `INSERT INTO online_evaluation_attempts (
           school_id, online_evaluation_id, enrollment_id, attempt_number,
           total_score, answers_payload, submitted_at
         )
         VALUES ($1,$2,$3,$4,$5,$6::jsonb, NOW())
         RETURNING id`,
        [
          schoolId.toString(),
          evaluationId.toString(),
          enr.enrollmentId,
          attemptNumber,
          Number(totalScore.toFixed(2)),
          JSON.stringify(input.answers),
        ],
      );

      return {
        attemptId: Number(ins.rows[0].id),
        attemptNumber,
        totalScore: Number(totalScore.toFixed(2)),
        maxScore: Number(maxScore.toFixed(2)),
      };
    });
  }

  async listStudentLiveClasses(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<LiveClassRow[]> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const enr = await this.resolveStudentEnrollmentInTx(
        client,
        schoolId,
        userId,
        academicYear,
      );
      if (!enr || !enr.accessControls.canJoinLiveClasses) return [];

      const res = await client.query<{
        id: string;
        course_assignment_id: string;
        subject_name: string;
        grade_group: string;
        teacher_name: string;
        title: string;
        meeting_url: string;
        scheduled_start: string;
        scheduled_end: string | null;
        is_active: boolean;
      }>(
        `SELECT lc.id, lc.course_assignment_id, s.name AS subject_name,
                CONCAT(g.name, '-', ag.group_code) AS grade_group,
                TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS teacher_name,
                lc.title, lc.meeting_url, lc.scheduled_start::text, lc.scheduled_end::text,
                lc.is_active
           FROM live_classes lc
           INNER JOIN course_assignments ca ON ca.school_id = lc.school_id AND ca.id = lc.course_assignment_id
           INNER JOIN subjects s ON s.school_id = ca.school_id AND s.id = ca.subject_id
           INNER JOIN grades g ON g.school_id = ca.school_id AND g.id = ca.grade_id
           INNER JOIN academic_groups ag ON ag.school_id = ca.school_id AND ag.id = ca.academic_group_id
           INNER JOIN teacher_profiles tp ON tp.school_id = ca.school_id AND tp.id = ca.teacher_profile_id
          WHERE lc.school_id = $1 AND ca.academic_group_id = $2
            AND ca.academic_year = $3 AND lc.is_active = TRUE
          ORDER BY lc.scheduled_start DESC`,
        [schoolId.toString(), enr.academicGroupId, academicYear],
      );
      return res.rows.map((r) => ({
        id: Number(r.id),
        courseAssignmentId: Number(r.course_assignment_id),
        subjectName: r.subject_name,
        gradeGroupLabel: r.grade_group,
        teacherName: r.teacher_name,
        title: r.title,
        meetingUrl: r.meeting_url,
        scheduledStart: r.scheduled_start,
        scheduledEnd: r.scheduled_end,
        isActive: r.is_active,
        attendancesCount: 0,
      }));
    });
  }

  async joinStudentLiveClass(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    liveClassId: bigint,
  ): Promise<{ joinedAt: string; meetingUrl: string }> {
    return this.db.withTenantTransaction(schoolId, async (client) => {
      const enr = await this.resolveStudentEnrollmentInTx(
        client,
        schoolId,
        userId,
        academicYear,
      );
      if (enr && !enr.accessControls.canJoinLiveClasses) {
        throw new ForbiddenException(
          'El acceso a clases en vivo se encuentra restringido para esta matrícula.',
        );
      }
      const classRes = await client.query<{ meeting_url: string }>(
        `SELECT meeting_url FROM live_classes WHERE school_id = $1 AND id = $2 AND is_active = TRUE`,
        [schoolId.toString(), liveClassId.toString()],
      );
      if (classRes.rowCount === 0) {
        throw new ResourceNotFoundException('LiveClass', liveClassId.toString());
      }
      let joinedAt = new Date().toISOString();
      if (enr) {
        const attRes = await client.query<{ joined_at: string }>(
          `INSERT INTO live_class_attendances (school_id, live_class_id, enrollment_id)
           VALUES ($1,$2,$3)
           ON CONFLICT (school_id, live_class_id, enrollment_id) DO UPDATE SET joined_at = NOW()
           RETURNING joined_at::text`,
          [schoolId.toString(), liveClassId.toString(), enr.enrollmentId],
        );
        joinedAt = attRes.rows[0].joined_at;
      }
      return { joinedAt, meetingUrl: classRes.rows[0].meeting_url };
    });
  }

  // =========================================================================
  // HELPERS TRANSACCIONALES INTERNOS
  // =========================================================================

  private async fetchObserverInTx(
    client: PoolClient,
    schoolId: bigint,
    enrollmentId: bigint,
    academicYear: number,
  ): Promise<StudentObserverView> {
    const enrRes = await client.query<{
      full_name: string;
      grade_name: string;
      group_code: string;
    }>(
      `SELECT TRIM(CONCAT_WS(' ', sp.last_name, sp.second_last_name, sp.first_name, sp.middle_name)) AS full_name,
              g.name AS grade_name, ag.group_code
         FROM student_enrollments se
         INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
         INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
        WHERE se.school_id = $1 AND se.id = $2`,
      [schoolId.toString(), enrollmentId.toString()],
    );
    if (enrRes.rowCount === 0) {
      throw new ResourceNotFoundException(
        'StudentEnrollment',
        enrollmentId.toString(),
      );
    }

    const obsRes = await client.query<{
      id: string;
      template_id: string | null;
      strengths: string | null;
      difficulties: string | null;
      commitments: string | null;
    }>(
      `SELECT id, template_id, strengths, difficulties, commitments
         FROM student_observers
        WHERE school_id = $1 AND enrollment_id = $2`,
      [schoolId.toString(), enrollmentId.toString()],
    );

    const obs = obsRes.rows[0];
    let annotations: ObserverAnnotationRow[] = [];

    if (obs) {
      const annRes = await client.query<{
        id: string;
        student_observer_id: string;
        section_id: string | null;
        section_title: string | null;
        period_number: number;
        annotation_type: string;
        severity_level: 'PRAISE' | 'MILD' | 'SERIOUS' | 'VERY_SERIOUS';
        situation_description: string;
        student_version: string | null;
        pedagogical_commitment: string | null;
        guardian_notified: boolean;
        annotation_date: string;
        created_by_name: string | null;
      }>(
        `SELECT oa.id, oa.student_observer_id, oa.section_id,
                ots.title AS section_title, oa.period_number, oa.annotation_type,
                oa.severity_level, oa.situation_description, oa.student_version,
                oa.pedagogical_commitment, oa.guardian_notified,
                oa.annotation_date::text,
                TRIM(CONCAT_WS(' ', u.first_name, u.last_name)) AS created_by_name
           FROM observer_annotations oa
           LEFT JOIN observer_template_sections ots
             ON ots.school_id = oa.school_id AND ots.id = oa.section_id
           LEFT JOIN users u ON u.id = oa.created_by_user_id
          WHERE oa.school_id = $1 AND oa.student_observer_id = $2
          ORDER BY oa.annotation_date DESC, oa.id DESC`,
        [schoolId.toString(), obs.id],
      );
      annotations = annRes.rows.map((a) => ({
        id: Number(a.id),
        studentObserverId: Number(a.student_observer_id),
        sectionId: a.section_id ? Number(a.section_id) : null,
        sectionTitle: a.section_title,
        periodNumber: Number(a.period_number),
        annotationType: a.annotation_type,
        severityLevel: a.severity_level,
        situationDescription: a.situation_description,
        studentVersion: a.student_version,
        pedagogicalCommitment: a.pedagogical_commitment,
        guardianNotified: a.guardian_notified,
        annotationDate: a.annotation_date,
        createdByName: a.created_by_name,
      }));
    }

    return {
      id: obs ? Number(obs.id) : null,
      enrollmentId: Number(enrollmentId),
      studentFullName: enrRes.rows[0].full_name,
      gradeName: enrRes.rows[0].grade_name,
      groupCode: enrRes.rows[0].group_code,
      templateId: obs?.template_id ? Number(obs.template_id) : null,
      academicYear,
      strengths: obs?.strengths ?? null,
      difficulties: obs?.difficulties ?? null,
      commitments: obs?.commitments ?? null,
      annotations,
    };
  }

  private async fetchEvaluationQuestionsInTx(
    client: PoolClient,
    schoolId: bigint,
    evaluationId: number,
    includeCorrectAnswer: boolean,
  ): Promise<OnlineEvaluationQuestionRow[]> {
    const qRes = await client.query<{
      id: string;
      question_type_id: number;
      question_text: string;
      points: string;
      display_order: number;
    }>(
      `SELECT id, question_type_id, question_text, points, display_order
         FROM online_evaluation_questions
        WHERE school_id = $1 AND online_evaluation_id = $2
        ORDER BY display_order, id`,
      [schoolId.toString(), evaluationId],
    );

    const result: OnlineEvaluationQuestionRow[] = [];
    for (const q of qRes.rows) {
      const oRes = await client.query<{
        id: string;
        option_label: string | null;
        option_text: string;
        is_correct: boolean;
      }>(
        `SELECT id, option_label, option_text, is_correct
           FROM online_evaluation_options
          WHERE school_id = $1 AND question_id = $2
          ORDER BY id`,
        [schoolId.toString(), q.id],
      );
      result.push({
        id: Number(q.id),
        questionTypeId: Number(q.question_type_id),
        questionText: q.question_text,
        points: Number(q.points),
        displayOrder: Number(q.display_order),
        options: oRes.rows.map((o) => ({
          id: Number(o.id),
          optionLabel: o.option_label,
          optionText: o.option_text,
          ...(includeCorrectAnswer ? { isCorrect: o.is_correct } : {}),
        })),
      });
    }
    return result;
  }

  private async resolveStudentEnrollmentInTx(
    client: PoolClient,
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<{
    enrollmentId: number;
    studentProfileId: number;
    academicGroupId: number;
    fullName: string;
    documentNumber: string;
    campusName: string;
    shiftName: string;
    gradeName: string;
    groupCode: string;
    homeroomTeacherName: string | null;
    accessControls: {
      canViewScores: boolean;
      canViewReportCards: boolean;
      canViewCertificates: boolean;
      canTakeEvaluations: boolean;
      canViewActivities: boolean;
      canJoinLiveClasses: boolean;
      canViewLevelings: boolean;
    };
  } | null> {
    const res = await client.query<{
      enrollment_id: string;
      student_profile_id: string;
      academic_group_id: string;
      full_name: string;
      document_number: string;
      campus_name: string;
      shift_name: string;
      grade_name: string;
      group_code: string;
      homeroom_teacher_name: string | null;
      can_view_scores: boolean | null;
      can_view_report_cards: boolean | null;
      can_view_certificates: boolean | null;
      can_take_evaluations: boolean | null;
      can_view_activities: boolean | null;
      can_join_live_classes: boolean | null;
      can_view_levelings: boolean | null;
    }>(
      `SELECT se.id AS enrollment_id,
              sp.id AS student_profile_id,
              se.academic_group_id,
              TRIM(CONCAT_WS(' ', sp.first_name, sp.middle_name, sp.last_name, sp.second_last_name)) AS full_name,
              sp.document_number,
              c.name AS campus_name,
              ss.name AS shift_name,
              g.name AS grade_name,
              ag.group_code,
              TRIM(CONCAT_WS(' ', tp.first_name, tp.last_name)) AS homeroom_teacher_name,
              ac.can_view_scores,
              ac.can_view_report_cards,
              ac.can_view_certificates,
              ac.can_take_evaluations,
              ac.can_view_activities,
              ac.can_join_live_classes,
              ac.can_view_levelings
         FROM student_enrollments se
         INNER JOIN student_profiles sp ON sp.school_id = se.school_id AND sp.id = se.student_profile_id
         INNER JOIN campuses c ON c.school_id = se.school_id AND c.id = se.campus_id
         INNER JOIN school_shifts ss ON ss.school_id = se.school_id AND ss.id = se.shift_id
         INNER JOIN grades g ON g.school_id = se.school_id AND g.id = se.grade_id
         INNER JOIN academic_groups ag ON ag.school_id = se.school_id AND ag.id = se.academic_group_id
         LEFT JOIN teacher_profiles tp ON tp.school_id = ag.school_id AND tp.id = ag.homeroom_teacher_id
         LEFT JOIN student_enrollment_access_controls ac
           ON ac.school_id = se.school_id AND ac.enrollment_id = se.id
        WHERE se.school_id = $1
          AND se.academic_year = $3
          AND (
            sp.user_id = $2
            OR EXISTS (
              SELECT 1
                FROM student_family_links sfl
                INNER JOIN family_profiles fp
                  ON fp.school_id = sfl.school_id AND fp.id = sfl.family_profile_id
               WHERE sfl.school_id = sp.school_id
                 AND sfl.student_profile_id = sp.id
                 AND fp.user_id = $2
            )
          )
        ORDER BY (se.enrollment_status_id = 2) DESC, se.id DESC
        LIMIT 1`,
      [schoolId.toString(), userId.toString(), academicYear],
    );

    if (res.rowCount === 0) return null;
    const r = res.rows[0];
    return {
      enrollmentId: Number(r.enrollment_id),
      studentProfileId: Number(r.student_profile_id),
      academicGroupId: Number(r.academic_group_id),
      fullName: r.full_name,
      documentNumber: r.document_number,
      campusName: r.campus_name,
      shiftName: r.shift_name,
      gradeName: r.grade_name,
      groupCode: r.group_code,
      homeroomTeacherName: r.homeroom_teacher_name || null,
      accessControls: {
        canViewScores: r.can_view_scores ?? true,
        canViewReportCards: r.can_view_report_cards ?? true,
        canViewCertificates: r.can_view_certificates ?? true,
        canTakeEvaluations: r.can_take_evaluations ?? true,
        canViewActivities: r.can_view_activities ?? true,
        canJoinLiveClasses: r.can_join_live_classes ?? true,
        canViewLevelings: r.can_view_levelings ?? true,
      },
    };
  }
}
