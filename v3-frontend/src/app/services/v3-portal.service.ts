import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEnvelope } from './v3-unified-auth.service';

export interface TeacherCourseSummary {
  readonly id: number;
  readonly campusName: string;
  readonly shiftName: string;
  readonly gradeId: number;
  readonly gradeName: string;
  readonly academicGroupId: number;
  readonly groupCode: string;
  readonly subjectId: number;
  readonly subjectName: string;
  readonly academicAreaName: string;
  readonly teacherProfileId: number;
  readonly teacherName: string;
  readonly academicYear: number;
  readonly weeklyHours: number;
  readonly enrolledStudentsCount: number;
}

export interface GradebookStudentRow {
  enrollmentId: number;
  studentDocumentNumber: string;
  studentFullName: string;
  gradeId: number | null;
  conceptualScore: number;
  proceduralScore: number;
  attitudinalScore: number;
  evaluationExamScore: number;
  finalScore: number;
  recoveryScore: number;
  levelingScore: number;
  effectiveScore: number;
  justifiedAbsences: number;
  unjustifiedAbsences: number;
  lateArrivals: number;
  teacherObservations: string | null;
  hasPreReportAlert: boolean;
  isLocked: boolean;
}

export interface CourseGradebookView {
  readonly course: TeacherCourseSummary;
  readonly academicYear: number;
  readonly periodNumber: number;
  readonly periodId: number | null;
  readonly isPeriodClosed: boolean;
  readonly students: GradebookStudentRow[];
}

export interface PreReportRow {
  readonly id: number;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly courseAssignmentId: number;
  readonly periodNumber: number;
  readonly partialScore: number;
  readonly observations: string | null;
  readonly createdAt: string;
}

export interface AchievementStandardRow {
  readonly id: number;
  readonly gradeId: number;
  readonly gradeName: string;
  readonly subjectId: number;
  readonly subjectName: string;
  readonly academicYear: number;
  readonly periodNumber: number;
  readonly code: string | null;
  readonly indicatorType: string;
  readonly description: string;
}

export interface StudentAbsenceRow {
  readonly id: number;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly courseAssignmentId: number | null;
  readonly periodNumber: number;
  readonly absenceDate: string;
  readonly hoursMissed: number;
  readonly isJustified: boolean;
  readonly justificationNotes: string | null;
}

export interface ObserverAnnotationRow {
  readonly id: number;
  readonly studentObserverId: number;
  readonly sectionId: number | null;
  readonly sectionTitle: string | null;
  readonly periodNumber: number;
  readonly annotationType: string;
  readonly severityLevel: 'PRAISE' | 'MILD' | 'SERIOUS' | 'VERY_SERIOUS';
  readonly situationDescription: string;
  readonly studentVersion: string | null;
  readonly pedagogicalCommitment: string | null;
  readonly guardianNotified: boolean;
  readonly annotationDate: string;
  readonly createdByName: string | null;
}

export interface StudentObserverView {
  readonly id: number | null;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly templateId: number | null;
  readonly academicYear: number;
  readonly strengths: string | null;
  readonly difficulties: string | null;
  readonly commitments: string | null;
  readonly annotations: ObserverAnnotationRow[];
}

export interface LessonPlanUnitRow {
  readonly id: number;
  readonly lessonPlanId: number;
  readonly unitNumber: number;
  readonly topicTitle: string;
  readonly contentDescription: string | null;
  readonly pedagogicalActivities: string | null;
  readonly evaluationStrategy: string | null;
  readonly plannedHours: number;
  readonly executionDate: string | null;
}

export interface LessonPlanRow {
  readonly id: number;
  readonly courseAssignmentId: number;
  readonly subjectName: string;
  readonly gradeGroupLabel: string;
  readonly academicYear: number;
  readonly periodNumber: number;
  readonly title: string;
  readonly generalObjective: string | null;
  readonly methodologyNotes: string | null;
  readonly bibliography: string | null;
  readonly observations: string | null;
  readonly units: LessonPlanUnitRow[];
}

export interface VirtualActivityRow {
  readonly id: number;
  readonly courseAssignmentId: number;
  readonly subjectName: string;
  readonly gradeGroupLabel: string;
  readonly teacherName: string;
  readonly periodNumber: number;
  readonly title: string;
  readonly instructions: string;
  readonly resourceUrl: string | null;
  readonly dueDate: string | null;
  readonly isPublished: boolean;
  readonly submissionsCount: number;
  readonly mySubmission?: {
    readonly id: number;
    readonly studentComment: string | null;
    readonly score: number | null;
    readonly teacherFeedback: string | null;
    readonly submittedAt: string;
    readonly gradedAt: string | null;
  } | null;
}

export interface ActivitySubmissionRow {
  readonly id: number;
  readonly virtualActivityId: number;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly studentDocumentNumber: string;
  readonly studentComment: string | null;
  readonly score: number | null;
  readonly teacherFeedback: string | null;
  readonly submittedAt: string;
  readonly gradedAt: string | null;
}

export interface OnlineEvaluationQuestionRow {
  readonly id: number;
  readonly questionTypeId: number;
  readonly questionText: string;
  readonly points: number;
  readonly displayOrder: number;
  readonly options: Array<{
    readonly id: number;
    readonly optionLabel: string | null;
    readonly optionText: string;
    readonly isCorrect?: boolean;
  }>;
}

export interface OnlineEvaluationRow {
  readonly id: number;
  readonly courseAssignmentId: number;
  readonly subjectName: string;
  readonly gradeGroupLabel: string;
  readonly periodNumber: number;
  readonly evaluationType: string;
  readonly title: string;
  readonly description: string | null;
  readonly durationMinutes: number;
  readonly maxAttempts: number;
  readonly availableFrom: string | null;
  readonly availableUntil: string | null;
  readonly isPublished: boolean;
  readonly questions: OnlineEvaluationQuestionRow[];
  readonly myAttemptsCount?: number;
  readonly myBestScore?: number | null;
}

export interface EvaluationAttemptRow {
  readonly id: number;
  readonly onlineEvaluationId: number;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly attemptNumber: number;
  readonly totalScore: number;
  readonly submittedAt: string | null;
}

export interface LiveClassRow {
  readonly id: number;
  readonly courseAssignmentId: number;
  readonly subjectName: string;
  readonly gradeGroupLabel: string;
  readonly teacherName: string;
  readonly title: string;
  readonly meetingUrl: string;
  readonly scheduledStart: string;
  readonly scheduledEnd: string | null;
  readonly isActive: boolean;
  readonly attendancesCount: number;
}

export interface StudentPortalOverview {
  readonly enrollmentId: number | null;
  readonly studentProfileId: number | null;
  readonly studentFullName: string | null;
  readonly documentNumber: string | null;
  readonly campusName: string | null;
  readonly shiftName: string | null;
  readonly gradeName: string | null;
  readonly groupCode: string | null;
  readonly academicYear: number;
  readonly homeroomTeacherName: string | null;
  readonly courses: Array<{
    readonly courseAssignmentId: number;
    readonly subjectName: string;
    readonly academicAreaName: string;
    readonly teacherName: string;
    readonly weeklyHours: number;
  }>;
  readonly pendingActivitiesCount: number;
  readonly availableEvaluationsCount: number;
  readonly upcomingLiveClassesCount: number;
}

export interface StudentPortalGradesView {
  readonly enrollmentId: number | null;
  readonly academicYear: number;
  readonly grades: Array<{
    readonly id: number;
    readonly periodNumber: number;
    readonly subjectName: string;
    readonly academicAreaName: string;
    readonly teacherName: string;
    readonly finalScore: number;
    readonly recoveryScore: number;
    readonly levelingScore: number;
    readonly effectiveScore: number;
    readonly justifiedAbsences: number;
    readonly unjustifiedAbsences: number;
    readonly teacherObservations: string | null;
  }>;
  readonly preReports: Array<{
    readonly periodNumber: number;
    readonly subjectName: string;
    readonly partialScore: number;
    readonly observations: string | null;
  }>;
  readonly observerAnnotations: ObserverAnnotationRow[];
}

/**
 * Servicio HTTP V3 unificado para los Portales Docente (/api/v1/teacher/*)
 * y Estudiantil/Familiar (/api/v1/student/*). Reemplaza 100% de los llamados
 * legacy ExtJS y Socket.IO SQL.
 */
@Injectable({ providedIn: 'root' })
export class V3PortalService {
  private readonly http = inject(HttpClient);
  private readonly teacherUrl = `${environment.APIURL}/teacher`;
  private readonly studentUrl = `${environment.APIURL}/student`;

  // Portal Docente
  listTeacherCourses(academicYear: number): Observable<TeacherCourseSummary[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<TeacherCourseSummary[]>>(`${this.teacherUrl}/courses`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  getCourseGradebook(
    courseAssignmentId: number,
    academicYear: number,
    periodNumber: number,
  ): Observable<CourseGradebookView> {
    const params = new HttpParams()
      .set('academicYear', String(academicYear))
      .set('periodNumber', String(periodNumber));
    return this.http
      .get<ApiEnvelope<CourseGradebookView>>(
        `${this.teacherUrl}/courses/${courseAssignmentId}/gradebook`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  saveGradebookBatch(
    courseAssignmentId: number,
    payload: Record<string, unknown>,
  ): Observable<{ savedCount: number }> {
    return this.http
      .put<ApiEnvelope<{ savedCount: number }>>(
        `${this.teacherUrl}/courses/${courseAssignmentId}/gradebook`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  listPreReports(
    courseAssignmentId: number,
    academicYear: number,
    periodNumber: number,
  ): Observable<PreReportRow[]> {
    const params = new HttpParams()
      .set('academicYear', String(academicYear))
      .set('periodNumber', String(periodNumber));
    return this.http
      .get<ApiEnvelope<PreReportRow[]>>(
        `${this.teacherUrl}/courses/${courseAssignmentId}/pre-reports`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  upsertPreReport(
    courseAssignmentId: number,
    payload: Record<string, unknown>,
  ): Observable<PreReportRow> {
    return this.http
      .post<ApiEnvelope<PreReportRow>>(
        `${this.teacherUrl}/courses/${courseAssignmentId}/pre-reports`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  listAchievements(options: {
    academicYear: number;
    gradeId?: number;
    subjectId?: number;
    periodNumber?: number;
  }): Observable<AchievementStandardRow[]> {
    let params = new HttpParams().set(
      'academicYear',
      String(options.academicYear),
    );
    if (options.gradeId) params = params.set('gradeId', String(options.gradeId));
    if (options.subjectId)
      params = params.set('subjectId', String(options.subjectId));
    if (options.periodNumber)
      params = params.set('periodNumber', String(options.periodNumber));
    return this.http
      .get<ApiEnvelope<AchievementStandardRow[]>>(
        `${this.teacherUrl}/achievements`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  saveAchievement(
    payload: Record<string, unknown>,
  ): Observable<AchievementStandardRow> {
    return this.http
      .post<ApiEnvelope<AchievementStandardRow>>(
        `${this.teacherUrl}/achievements`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteAchievement(id: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.teacherUrl}/achievements/${id}`,
      )
      .pipe(map((r) => r.data));
  }

  importAchievements(
    payload: Record<string, unknown>,
  ): Observable<{ importedCount: number }> {
    return this.http
      .post<ApiEnvelope<{ importedCount: number }>>(
        `${this.teacherUrl}/achievements/import`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  listAbsences(
    courseAssignmentId: number,
    periodNumber: number,
  ): Observable<StudentAbsenceRow[]> {
    const params = new HttpParams()
      .set('courseAssignmentId', String(courseAssignmentId))
      .set('periodNumber', String(periodNumber));
    return this.http
      .get<ApiEnvelope<StudentAbsenceRow[]>>(`${this.teacherUrl}/absences`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  recordAbsence(payload: Record<string, unknown>): Observable<StudentAbsenceRow> {
    return this.http
      .post<ApiEnvelope<StudentAbsenceRow>>(
        `${this.teacherUrl}/absences`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteAbsence(absenceId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.teacherUrl}/absences/${absenceId}`,
      )
      .pipe(map((r) => r.data));
  }

  getStudentObserver(
    enrollmentId: number,
    academicYear: number,
  ): Observable<StudentObserverView> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<StudentObserverView>>(
        `${this.teacherUrl}/observer/${enrollmentId}`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  upsertStudentObserver(
    payload: Record<string, unknown>,
  ): Observable<StudentObserverView> {
    return this.http
      .post<ApiEnvelope<StudentObserverView>>(
        `${this.teacherUrl}/observer`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  addObserverAnnotation(
    observerId: number,
    payload: Record<string, unknown>,
  ): Observable<ObserverAnnotationRow> {
    return this.http
      .post<ApiEnvelope<ObserverAnnotationRow>>(
        `${this.teacherUrl}/observer/${observerId}/annotations`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteObserverAnnotation(annotationId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.teacherUrl}/observer/annotations/${annotationId}`,
      )
      .pipe(map((r) => r.data));
  }

  listLessonPlans(
    academicYear: number,
    courseAssignmentId?: number,
  ): Observable<LessonPlanRow[]> {
    let params = new HttpParams().set('academicYear', String(academicYear));
    if (courseAssignmentId)
      params = params.set('courseAssignmentId', String(courseAssignmentId));
    return this.http
      .get<ApiEnvelope<LessonPlanRow[]>>(`${this.teacherUrl}/lesson-plans`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  createLessonPlan(payload: Record<string, unknown>): Observable<LessonPlanRow> {
    return this.http
      .post<ApiEnvelope<LessonPlanRow>>(
        `${this.teacherUrl}/lesson-plans`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteLessonPlan(planId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.teacherUrl}/lesson-plans/${planId}`,
      )
      .pipe(map((r) => r.data));
  }

  addLessonPlanUnit(
    planId: number,
    payload: Record<string, unknown>,
  ): Observable<LessonPlanUnitRow> {
    return this.http
      .post<ApiEnvelope<LessonPlanUnitRow>>(
        `${this.teacherUrl}/lesson-plans/${planId}/units`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteLessonPlanUnit(unitId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.teacherUrl}/lesson-plans/units/${unitId}`,
      )
      .pipe(map((r) => r.data));
  }

  listTeacherActivities(courseAssignmentId?: number): Observable<VirtualActivityRow[]> {
    let params = new HttpParams();
    if (courseAssignmentId)
      params = params.set('courseAssignmentId', String(courseAssignmentId));
    return this.http
      .get<ApiEnvelope<VirtualActivityRow[]>>(`${this.teacherUrl}/activities`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  createVirtualActivity(
    payload: Record<string, unknown>,
  ): Observable<VirtualActivityRow> {
    return this.http
      .post<ApiEnvelope<VirtualActivityRow>>(
        `${this.teacherUrl}/activities`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteVirtualActivity(activityId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.teacherUrl}/activities/${activityId}`,
      )
      .pipe(map((r) => r.data));
  }

  listActivitySubmissions(activityId: number): Observable<ActivitySubmissionRow[]> {
    return this.http
      .get<ApiEnvelope<ActivitySubmissionRow[]>>(
        `${this.teacherUrl}/activities/${activityId}/submissions`,
      )
      .pipe(map((r) => r.data));
  }

  gradeActivitySubmission(
    submissionId: number,
    payload: { score: number; teacherFeedback?: string | null },
  ): Observable<ActivitySubmissionRow> {
    return this.http
      .patch<ApiEnvelope<ActivitySubmissionRow>>(
        `${this.teacherUrl}/activities/submissions/${submissionId}`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  listTeacherEvaluations(
    courseAssignmentId?: number,
  ): Observable<OnlineEvaluationRow[]> {
    let params = new HttpParams();
    if (courseAssignmentId)
      params = params.set('courseAssignmentId', String(courseAssignmentId));
    return this.http
      .get<ApiEnvelope<OnlineEvaluationRow[]>>(`${this.teacherUrl}/evaluations`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  createOnlineEvaluation(
    payload: Record<string, unknown>,
  ): Observable<OnlineEvaluationRow> {
    return this.http
      .post<ApiEnvelope<OnlineEvaluationRow>>(
        `${this.teacherUrl}/evaluations`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteOnlineEvaluation(evaluationId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.teacherUrl}/evaluations/${evaluationId}`,
      )
      .pipe(map((r) => r.data));
  }

  addEvaluationQuestion(
    evaluationId: number,
    payload: Record<string, unknown>,
  ): Observable<OnlineEvaluationQuestionRow> {
    return this.http
      .post<ApiEnvelope<OnlineEvaluationQuestionRow>>(
        `${this.teacherUrl}/evaluations/${evaluationId}/questions`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  listEvaluationAttempts(evaluationId: number): Observable<EvaluationAttemptRow[]> {
    return this.http
      .get<ApiEnvelope<EvaluationAttemptRow[]>>(
        `${this.teacherUrl}/evaluations/${evaluationId}/attempts`,
      )
      .pipe(map((r) => r.data));
  }

  listTeacherLiveClasses(courseAssignmentId?: number): Observable<LiveClassRow[]> {
    let params = new HttpParams();
    if (courseAssignmentId)
      params = params.set('courseAssignmentId', String(courseAssignmentId));
    return this.http
      .get<ApiEnvelope<LiveClassRow[]>>(`${this.teacherUrl}/live-classes`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  createLiveClass(payload: Record<string, unknown>): Observable<LiveClassRow> {
    return this.http
      .post<ApiEnvelope<LiveClassRow>>(
        `${this.teacherUrl}/live-classes`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteLiveClass(liveClassId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.teacherUrl}/live-classes/${liveClassId}`,
      )
      .pipe(map((r) => r.data));
  }

  // Portal Estudiante / Familia
  getStudentOverview(academicYear: number): Observable<StudentPortalOverview> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<StudentPortalOverview>>(`${this.studentUrl}/overview`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  getStudentGrades(
    academicYear: number,
    periodNumber?: number,
  ): Observable<StudentPortalGradesView> {
    let params = new HttpParams().set('academicYear', String(academicYear));
    if (periodNumber)
      params = params.set('periodNumber', String(periodNumber));
    return this.http
      .get<ApiEnvelope<StudentPortalGradesView>>(`${this.studentUrl}/grades`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  listStudentActivities(academicYear: number): Observable<VirtualActivityRow[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<VirtualActivityRow[]>>(`${this.studentUrl}/activities`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  submitStudentActivity(
    activityId: number,
    studentComment: string,
    academicYear: number,
  ): Observable<{ submissionId: number; submittedAt: string }> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .post<ApiEnvelope<{ submissionId: number; submittedAt: string }>>(
        `${this.studentUrl}/activities/${activityId}/submit`,
        { studentComment },
        { params },
      )
      .pipe(map((r) => r.data));
  }

  listStudentEvaluations(academicYear: number): Observable<OnlineEvaluationRow[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<OnlineEvaluationRow[]>>(`${this.studentUrl}/evaluations`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  submitStudentEvaluation(
    evaluationId: number,
    answers: Array<{ questionId: number; selectedOptionId: number }>,
    academicYear: number,
  ): Observable<{
    attemptId: number;
    attemptNumber: number;
    totalScore: number;
    maxScore: number;
  }> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .post<
        ApiEnvelope<{
          attemptId: number;
          attemptNumber: number;
          totalScore: number;
          maxScore: number;
        }>
      >(
        `${this.studentUrl}/evaluations/${evaluationId}/submit`,
        { answers },
        { params },
      )
      .pipe(map((r) => r.data));
  }

  listStudentLiveClasses(academicYear: number): Observable<LiveClassRow[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<LiveClassRow[]>>(`${this.studentUrl}/live-classes`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  joinStudentLiveClass(
    liveClassId: number,
    academicYear: number,
  ): Observable<{ joinedAt: string; meetingUrl: string }> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .post<ApiEnvelope<{ joinedAt: string; meetingUrl: string }>>(
        `${this.studentUrl}/live-classes/${liveClassId}/join`,
        {},
        { params },
      )
      .pipe(map((r) => r.data));
  }
}
