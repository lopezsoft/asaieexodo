export interface TeacherPeriodSummary {
  readonly id: number;
  readonly periodNumber: number;
  readonly name: string;
  readonly gradeGroupId: number | null;
  readonly gradeGroupName: string | null;
  readonly academicYear: number;
  readonly weightPercentage: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly gradingOpenDate: string | null;
  readonly gradingCloseDate: string | null;
  readonly recoveryOpenDate: string | null;
  readonly recoveryCloseDate: string | null;
  readonly isActive: boolean;
  readonly isClosed: boolean;
}

export interface TeacherSelfProfile {
  readonly id: number;
  readonly documentNumber: string;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly secondLastName: string | null;
  readonly fullName: string;
  readonly address: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly signatureUrl: string | null;
}

export interface TeacherGradebookColumnRow {
  readonly id: number;
  readonly courseAssignmentId: number;
  readonly dimensionId: number;
  readonly dimensionName: string;
  readonly dimensionWeight: number;
  readonly periodNumber: number;
  readonly columnNumber: number;
  readonly description: string;
  readonly weightPercentage: number;
  readonly activityDate: string | null;
}

export interface GradeAchievementAssignedRow {
  readonly id: number;
  readonly academicGradeId: number;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly achievementStandardId: number;
  readonly code: string | null;
  readonly indicatorType: string;
  readonly description: string;
  readonly nationalScaleName: string | null;
}

export interface TeacherLevelingCandidateRow {
  readonly enrollmentId: number;
  readonly courseAssignmentId: number;
  readonly studentDocumentNumber: string;
  readonly studentFullName: string;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly subjectName: string;
  readonly academicAreaName: string;
  readonly campusName: string;
  readonly periodNumber: number;
  readonly previousScore: number;
  readonly recoveryScore: number;
  readonly recoveryDate: string | null;
  readonly actNumber: string | null;
  readonly observations: string | null;
}

export interface TeacherLevelingListView {
  readonly minPassingScore: number;
  readonly maxRecoveryScore: number;
  readonly rows: TeacherLevelingCandidateRow[];
}

export interface StudentTrackingFormatRow {
  readonly studentProfileId: number;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly studentDocumentNumber: string;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly shiftName: string;
  readonly observations: string;
  readonly pv: boolean;
  readonly tv: boolean;
  readonly gw: boolean;
  readonly gf: boolean;
  readonly otherAccess: boolean;
  readonly ee: boolean;
  readonly internet: boolean;
  readonly tvService: boolean;
  readonly mobileData: boolean;
}

export interface ObserverExtendedData {
  readonly studentProfileId: number;
  readonly enrollmentId: number;
  readonly observerModel5: Record<string, unknown>;
  readonly observerModel3: Record<
    string,
    { p1?: string; p2?: string; p3?: string; p4?: string }
  >;
}

export abstract class TeacherExtendedRepositoryPort {
  abstract listTeacherPeriods(
    schoolId: bigint,
    academicYear: number,
  ): Promise<TeacherPeriodSummary[]>;

  abstract getTeacherSelfProfile(
    schoolId: bigint,
    userId: bigint,
  ): Promise<TeacherSelfProfile | null>;

  abstract updateTeacherSelfProfile(
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
  ): Promise<TeacherSelfProfile>;

  abstract listCourseColumns(
    schoolId: bigint,
    courseAssignmentId: bigint,
    periodNumber: number,
  ): Promise<TeacherGradebookColumnRow[]>;

  abstract upsertCourseColumn(
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
  ): Promise<TeacherGradebookColumnRow>;

  abstract deleteCourseColumn(schoolId: bigint, columnId: bigint): Promise<void>;

  abstract listCourseGradeItems(
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
  >;

  abstract saveGradeItemsBatch(
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
    userId?: bigint,
  ): Promise<{ savedCount: number }>;

  abstract createAchievementsMultiScale(
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
  ): Promise<{ createdCount: number }>;

  abstract listCourseAssignedAchievements(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
  ): Promise<GradeAchievementAssignedRow[]>;

  abstract assignAchievementsBatch(
    schoolId: bigint,
    input: {
      academicYear: number;
      academicGradeIds: number[];
      achievementStandardIds: number[];
    },
  ): Promise<{ assignedCount: number }>;

  abstract unassignAchievement(
    schoolId: bigint,
    academicYear: number,
    academicScoreId: bigint,
    achievementStandardId: bigint,
  ): Promise<void>;

  abstract syncCourseAchievements(
    schoolId: bigint,
    courseAssignmentId: bigint,
    input: { academicYear: number; periodNumber: number },
  ): Promise<{ syncedCount: number }>;

  abstract listPeriodicLevelings(
    schoolId: bigint,
    courseAssignmentId: bigint,
    academicYear: number,
    periodNumber: number,
    filterMode?: 'FAILED' | 'LEVELED' | 'ALL',
  ): Promise<TeacherLevelingListView>;

  abstract listFinalLevelings(
    schoolId: bigint,
    userId: bigint,
    role: string,
    academicYear: number,
  ): Promise<TeacherLevelingListView>;

  abstract saveLevelingsBatch(
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
    userId?: bigint,
  ): Promise<{ savedCount: number }>;

  abstract getObserverExtendedData(
    schoolId: bigint,
    enrollmentId: bigint,
  ): Promise<ObserverExtendedData>;

  abstract saveObserverExtendedData(
    schoolId: bigint,
    enrollmentId: bigint,
    input: {
      observerModel5?: Record<string, unknown>;
      observerModel3?: Record<
        string,
        { p1?: string; p2?: string; p3?: string; p4?: string }
      >;
    },
  ): Promise<ObserverExtendedData>;

  abstract listTrackingFormat(
    schoolId: bigint,
    academicGroupId: bigint,
    academicYear: number,
  ): Promise<StudentTrackingFormatRow[]>;

  abstract saveTrackingFormatBatch(
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
  ): Promise<{ savedCount: number }>;
}
