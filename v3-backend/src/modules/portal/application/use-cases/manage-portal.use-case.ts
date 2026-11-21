import { Injectable } from '@nestjs/common';
import {
  AchievementStandardRow,
  ActivitySubmissionRow,
  CourseGradebookView,
  EvaluationAttemptRow,
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
import {
  AddEvaluationQuestionDto,
  AddLessonPlanUnitDto,
  AddObserverAnnotationDto,
  CreateLessonPlanDto,
  CreateLiveClassDto,
  CreateOnlineEvaluationDto,
  CreateVirtualActivityDto,
  GradeActivitySubmissionDto,
  ImportAchievementsDto,
  RecordStudentAbsenceDto,
  SaveAchievementStandardDto,
  SaveGradebookBatchDto,
  SubmitStudentActivityDto,
  SubmitStudentEvaluationDto,
  UpsertPreReportDto,
  UpsertStudentObserverDto,
} from '../../infrastructure/http/dto/portal.dto';

@Injectable()
export class ManagePortalUseCase {
  constructor(private readonly repository: PortalRepositoryPort) {}

  // Portal Docente
  listTeacherCourses(
    schoolId: bigint,
    userId: bigint,
    role: string,
    academicYear: number,
  ): Promise<TeacherCourseSummary[]> {
    return this.repository.listTeacherCourses(schoolId, userId, role, academicYear);
  }

  getCourseGradebook(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<CourseGradebookView> {
    return this.repository.getCourseGradebook(
      schoolId,
      courseAssignmentId,
      academicYear,
      periodNumber,
    );
  }

  saveGradebookBatch(
    schoolId: bigint,
    userId: bigint,
    courseAssignmentId: bigint,
    dto: SaveGradebookBatchDto,
  ): Promise<{ savedCount: number }> {
    return this.repository.saveGradebookBatch(
      schoolId,
      userId,
      courseAssignmentId,
      dto,
    );
  }

  listPreReports(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<PreReportRow[]> {
    return this.repository.listPreReports(
      schoolId,
      courseAssignmentId,
      academicYear,
      periodNumber,
    );
  }

  upsertPreReport(
    schoolId: bigint,
    courseAssignmentId: bigint,
    dto: UpsertPreReportDto,
  ): Promise<PreReportRow> {
    return this.repository.upsertPreReport(schoolId, courseAssignmentId, dto);
  }

  listAchievements(
    schoolId: bigint,
    options: {
      academicYear: number;
      gradeId?: number;
      subjectId?: number;
      periodNumber?: number;
    },
  ): Promise<AchievementStandardRow[]> {
    return this.repository.listAchievements(schoolId, options);
  }

  saveAchievement(
    schoolId: bigint,
    dto: SaveAchievementStandardDto,
  ): Promise<AchievementStandardRow> {
    return this.repository.saveAchievement(schoolId, dto);
  }

  deleteAchievement(schoolId: bigint, id: bigint): Promise<void> {
    return this.repository.deleteAchievement(schoolId, id);
  }

  importAchievements(
    schoolId: bigint,
    dto: ImportAchievementsDto,
  ): Promise<{ importedCount: number }> {
    return this.repository.importAchievements(schoolId, dto);
  }

  listAbsences(
    schoolId: bigint,
    courseAssignmentId: bigint,
    periodNumber: number,
  ): Promise<StudentAbsenceRow[]> {
    return this.repository.listAbsences(schoolId, courseAssignmentId, periodNumber);
  }

  recordAbsence(
    schoolId: bigint,
    dto: RecordStudentAbsenceDto,
  ): Promise<StudentAbsenceRow> {
    return this.repository.recordAbsence(schoolId, dto);
  }

  deleteAbsence(schoolId: bigint, absenceId: bigint): Promise<void> {
    return this.repository.deleteAbsence(schoolId, absenceId);
  }

  getStudentObserver(
    schoolId: bigint,
    enrollmentId: bigint,
    academicYear: number,
  ): Promise<StudentObserverView> {
    return this.repository.getStudentObserver(schoolId, enrollmentId, academicYear);
  }

  upsertStudentObserver(
    schoolId: bigint,
    dto: UpsertStudentObserverDto,
  ): Promise<StudentObserverView> {
    return this.repository.upsertStudentObserver(schoolId, dto);
  }

  addObserverAnnotation(
    schoolId: bigint,
    observerId: bigint,
    userId: bigint,
    dto: AddObserverAnnotationDto,
  ): Promise<ObserverAnnotationRow> {
    return this.repository.addObserverAnnotation(schoolId, observerId, userId, dto);
  }

  deleteObserverAnnotation(schoolId: bigint, annotationId: bigint): Promise<void> {
    return this.repository.deleteObserverAnnotation(schoolId, annotationId);
  }

  listLessonPlans(
    schoolId: bigint,
    academicYear: number,
    courseAssignmentId?: number,
  ): Promise<LessonPlanRow[]> {
    return this.repository.listLessonPlans(
      schoolId,
      academicYear,
      courseAssignmentId,
    );
  }

  createLessonPlan(
    schoolId: bigint,
    dto: CreateLessonPlanDto,
  ): Promise<LessonPlanRow> {
    return this.repository.createLessonPlan(schoolId, dto);
  }

  deleteLessonPlan(schoolId: bigint, planId: bigint): Promise<void> {
    return this.repository.deleteLessonPlan(schoolId, planId);
  }

  addLessonPlanUnit(
    schoolId: bigint,
    planId: bigint,
    dto: AddLessonPlanUnitDto,
  ): Promise<LessonPlanUnitRow> {
    return this.repository.addLessonPlanUnit(schoolId, planId, dto);
  }

  deleteLessonPlanUnit(schoolId: bigint, unitId: bigint): Promise<void> {
    return this.repository.deleteLessonPlanUnit(schoolId, unitId);
  }

  listTeacherActivities(
    schoolId: bigint,
    courseAssignmentId?: number,
  ): Promise<VirtualActivityRow[]> {
    return this.repository.listTeacherActivities(schoolId, courseAssignmentId);
  }

  createVirtualActivity(
    schoolId: bigint,
    dto: CreateVirtualActivityDto,
  ): Promise<VirtualActivityRow> {
    return this.repository.createVirtualActivity(schoolId, dto);
  }

  deleteVirtualActivity(schoolId: bigint, activityId: bigint): Promise<void> {
    return this.repository.deleteVirtualActivity(schoolId, activityId);
  }

  listActivitySubmissions(
    schoolId: bigint,
    activityId: bigint,
  ): Promise<ActivitySubmissionRow[]> {
    return this.repository.listActivitySubmissions(schoolId, activityId);
  }

  gradeActivitySubmission(
    schoolId: bigint,
    submissionId: bigint,
    dto: GradeActivitySubmissionDto,
  ): Promise<ActivitySubmissionRow> {
    return this.repository.gradeActivitySubmission(schoolId, submissionId, dto);
  }

  listTeacherEvaluations(
    schoolId: bigint,
    courseAssignmentId?: number,
  ): Promise<OnlineEvaluationRow[]> {
    return this.repository.listTeacherEvaluations(schoolId, courseAssignmentId);
  }

  createOnlineEvaluation(
    schoolId: bigint,
    dto: CreateOnlineEvaluationDto,
  ): Promise<OnlineEvaluationRow> {
    return this.repository.createOnlineEvaluation(schoolId, dto);
  }

  deleteOnlineEvaluation(
    schoolId: bigint,
    evaluationId: bigint,
  ): Promise<void> {
    return this.repository.deleteOnlineEvaluation(schoolId, evaluationId);
  }

  addEvaluationQuestion(
    schoolId: bigint,
    evaluationId: bigint,
    dto: AddEvaluationQuestionDto,
  ): Promise<OnlineEvaluationQuestionRow> {
    return this.repository.addEvaluationQuestion(schoolId, evaluationId, dto);
  }

  deleteEvaluationQuestion(
    schoolId: bigint,
    questionId: bigint,
  ): Promise<void> {
    return this.repository.deleteEvaluationQuestion(schoolId, questionId);
  }

  listEvaluationAttempts(
    schoolId: bigint,
    evaluationId: bigint,
  ): Promise<EvaluationAttemptRow[]> {
    return this.repository.listEvaluationAttempts(schoolId, evaluationId);
  }

  listTeacherLiveClasses(
    schoolId: bigint,
    courseAssignmentId?: number,
  ): Promise<LiveClassRow[]> {
    return this.repository.listTeacherLiveClasses(schoolId, courseAssignmentId);
  }

  createLiveClass(
    schoolId: bigint,
    dto: CreateLiveClassDto,
  ): Promise<LiveClassRow> {
    return this.repository.createLiveClass(schoolId, dto);
  }

  deleteLiveClass(schoolId: bigint, liveClassId: bigint): Promise<void> {
    return this.repository.deleteLiveClass(schoolId, liveClassId);
  }

  // Portal Estudiante / Familia
  getStudentOverview(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<StudentPortalOverview> {
    return this.repository.getStudentOverview(schoolId, userId, academicYear);
  }

  getStudentGrades(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    periodNumber?: number,
  ): Promise<StudentPortalGradesView> {
    return this.repository.getStudentGrades(
      schoolId,
      userId,
      academicYear,
      periodNumber,
    );
  }

  listStudentActivities(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<VirtualActivityRow[]> {
    return this.repository.listStudentActivities(schoolId, userId, academicYear);
  }

  submitStudentActivity(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    activityId: bigint,
    dto: SubmitStudentActivityDto,
  ): Promise<{ submissionId: number; submittedAt: string }> {
    return this.repository.submitStudentActivity(
      schoolId,
      userId,
      academicYear,
      activityId,
      dto,
    );
  }

  listStudentEvaluations(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<OnlineEvaluationRow[]> {
    return this.repository.listStudentEvaluations(schoolId, userId, academicYear);
  }

  submitStudentEvaluation(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    evaluationId: bigint,
    dto: SubmitStudentEvaluationDto,
  ): Promise<{
    attemptId: number;
    attemptNumber: number;
    totalScore: number;
    maxScore: number;
  }> {
    return this.repository.submitStudentEvaluation(
      schoolId,
      userId,
      academicYear,
      evaluationId,
      dto,
    );
  }

  listStudentLiveClasses(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<LiveClassRow[]> {
    return this.repository.listStudentLiveClasses(schoolId, userId, academicYear);
  }

  joinStudentLiveClass(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    liveClassId: bigint,
  ): Promise<{ joinedAt: string; meetingUrl: string }> {
    return this.repository.joinStudentLiveClass(
      schoolId,
      userId,
      academicYear,
      liveClassId,
    );
  }
}
