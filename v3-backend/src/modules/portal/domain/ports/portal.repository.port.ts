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
  readonly enrollmentId: number;
  readonly studentDocumentNumber: string;
  readonly studentFullName: string;
  readonly gradeId: number | null;
  readonly conceptualScore: number;
  readonly proceduralScore: number;
  readonly attitudinalScore: number;
  readonly evaluationExamScore: number;
  readonly finalScore: number;
  readonly recoveryScore: number;
  readonly levelingScore: number;
  readonly effectiveScore: number;
  readonly justifiedAbsences: number;
  readonly unjustifiedAbsences: number;
  readonly lateArrivals: number;
  readonly teacherObservations: string | null;
  readonly hasPreReportAlert: boolean;
  readonly isLocked: boolean;
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

export abstract class PortalRepositoryPort {
  // Portal Docente
  abstract listTeacherCourses(
    schoolId: bigint,
    userId: bigint,
    role: string,
    academicYear: number,
  ): Promise<TeacherCourseSummary[]>;

  abstract getCourseGradebook(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<CourseGradebookView>;

  abstract saveGradebookBatch(
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
  ): Promise<{ savedCount: number }>;

  abstract listPreReports(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<PreReportRow[]>;

  abstract upsertPreReport(
    schoolId: bigint,
    courseAssignmentId: bigint,
    input: {
      academicYear: number;
      enrollmentId: number;
      periodNumber: number;
      partialScore: number;
      observations?: string | null;
    },
  ): Promise<PreReportRow>;

  abstract listAchievements(
    schoolId: bigint,
    options: {
      academicYear: number;
      gradeId?: number;
      subjectId?: number;
      periodNumber?: number;
    },
  ): Promise<AchievementStandardRow[]>;

  abstract saveAchievement(
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
  ): Promise<AchievementStandardRow>;

  abstract deleteAchievement(schoolId: bigint, id: bigint): Promise<void>;

  abstract importAchievements(
    schoolId: bigint,
    input: { fromYear: number; toYear: number; gradeId?: number; subjectId?: number },
  ): Promise<{ importedCount: number }>;

  abstract listAbsences(
    schoolId: bigint,
    courseAssignmentId: bigint,
    periodNumber: number,
  ): Promise<StudentAbsenceRow[]>;

  abstract recordAbsence(
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
  ): Promise<StudentAbsenceRow>;

  abstract deleteAbsence(schoolId: bigint, absenceId: bigint): Promise<void>;

  abstract getStudentObserver(
    schoolId: bigint,
    enrollmentId: bigint,
    academicYear: number,
  ): Promise<StudentObserverView>;

  abstract upsertStudentObserver(
    schoolId: bigint,
    input: {
      enrollmentId: number;
      academicYear: number;
      templateId?: number | null;
      strengths?: string | null;
      difficulties?: string | null;
      commitments?: string | null;
    },
  ): Promise<StudentObserverView>;

  abstract addObserverAnnotation(
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
  ): Promise<ObserverAnnotationRow>;

  abstract deleteObserverAnnotation(
    schoolId: bigint,
    annotationId: bigint,
  ): Promise<void>;

  abstract listLessonPlans(
    schoolId: bigint,
    academicYear: number,
    courseAssignmentId?: number,
  ): Promise<LessonPlanRow[]>;

  abstract createLessonPlan(
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
  ): Promise<LessonPlanRow>;

  abstract deleteLessonPlan(schoolId: bigint, planId: bigint): Promise<void>;

  abstract addLessonPlanUnit(
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
  ): Promise<LessonPlanUnitRow>;

  abstract deleteLessonPlanUnit(schoolId: bigint, unitId: bigint): Promise<void>;

  abstract listTeacherActivities(
    schoolId: bigint,
    courseAssignmentId?: number,
  ): Promise<VirtualActivityRow[]>;

  abstract createVirtualActivity(
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
  ): Promise<VirtualActivityRow>;

  abstract deleteVirtualActivity(
    schoolId: bigint,
    activityId: bigint,
  ): Promise<void>;

  abstract listActivitySubmissions(
    schoolId: bigint,
    activityId: bigint,
  ): Promise<ActivitySubmissionRow[]>;

  abstract gradeActivitySubmission(
    schoolId: bigint,
    submissionId: bigint,
    input: { score: number; teacherFeedback?: string | null },
  ): Promise<ActivitySubmissionRow>;

  abstract listTeacherEvaluations(
    schoolId: bigint,
    courseAssignmentId?: number,
  ): Promise<OnlineEvaluationRow[]>;

  abstract createOnlineEvaluation(
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
  ): Promise<OnlineEvaluationRow>;

  abstract deleteOnlineEvaluation(
    schoolId: bigint,
    evaluationId: bigint,
  ): Promise<void>;

  abstract addEvaluationQuestion(
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
  ): Promise<OnlineEvaluationQuestionRow>;

  abstract deleteEvaluationQuestion(
    schoolId: bigint,
    questionId: bigint,
  ): Promise<void>;

  abstract listEvaluationAttempts(
    schoolId: bigint,
    evaluationId: bigint,
  ): Promise<EvaluationAttemptRow[]>;

  abstract listTeacherLiveClasses(
    schoolId: bigint,
    courseAssignmentId?: number,
  ): Promise<LiveClassRow[]>;

  abstract createLiveClass(
    schoolId: bigint,
    input: {
      courseAssignmentId: number;
      title: string;
      meetingUrl: string;
      scheduledStart: string;
      scheduledEnd?: string | null;
    },
  ): Promise<LiveClassRow>;

  abstract deleteLiveClass(schoolId: bigint, liveClassId: bigint): Promise<void>;

  // Portal Estudiante / Familia
  abstract getStudentOverview(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<StudentPortalOverview>;

  abstract getStudentGrades(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    periodNumber?: number,
  ): Promise<StudentPortalGradesView>;

  abstract listStudentActivities(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<VirtualActivityRow[]>;

  abstract submitStudentActivity(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    activityId: bigint,
    input: { studentComment: string },
  ): Promise<{ submissionId: number; submittedAt: string }>;

  abstract listStudentEvaluations(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<OnlineEvaluationRow[]>;

  abstract submitStudentEvaluation(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    evaluationId: bigint,
    input: { answers: Array<{ questionId: number; selectedOptionId: number }> },
  ): Promise<{ attemptId: number; attemptNumber: number; totalScore: number; maxScore: number }>;

  abstract listStudentLiveClasses(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
  ): Promise<LiveClassRow[]>;

  abstract joinStudentLiveClass(
    schoolId: bigint,
    userId: bigint,
    academicYear: number,
    liveClassId: bigint,
  ): Promise<{ joinedAt: string; meetingUrl: string }>;
}
