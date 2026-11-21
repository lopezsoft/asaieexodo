export interface PromotionStatusOption {
  readonly id: number;
  readonly statusCode: number;
  readonly gradeGroupId: number | null;
  readonly description: string;
  readonly isManualPromotion: boolean;
}

export interface PromotionRecordView {
  readonly id: number;
  readonly enrollmentId: number;
  readonly studentProfileId: number;
  readonly studentDocumentNumber: string;
  readonly studentFullName: string;
  readonly campusName: string;
  readonly gradeId: number;
  readonly gradeName: string;
  readonly academicGroupId: number;
  readonly groupCode: string;
  readonly academicYear: number;
  readonly promotionStatusId: number;
  readonly promotionStatusCode: number;
  readonly promotionStatusDescription: string;
  readonly actNumber: string | null;
  readonly finalAverage: number;
  readonly recoveryAverage: number;
  readonly passedAreasCount: number;
  readonly failedAreasCount: number;
  readonly failedSubjectsCount: number;
  readonly totalAbsences: number;
  readonly groupRank: number | null;
  readonly isCommissionPromoted: boolean;
  readonly isGraduated: boolean;
  readonly diplomaNumber: string | null;
  readonly graduationFolio: string | null;
  readonly observations: string | null;
  readonly promotionMessages: Record<string, unknown>;
  readonly promotedAt: string | null;
}

export interface FinalSabanaSubjectColumn {
  readonly subjectId: number;
  readonly subjectName: string;
  readonly abbreviation: string | null;
  readonly academicAreaId: number;
  readonly academicAreaName: string;
  readonly weeklyHours: number;
}

export interface FinalSabanaStudentRow {
  readonly enrollmentId: number;
  readonly studentProfileId: number;
  readonly studentDocumentNumber: string;
  readonly studentFullName: string;
  readonly groupCode: string;
  readonly gradeName: string;
  readonly finalAverage: number;
  readonly recoveryAverage: number;
  readonly passedAreasCount: number;
  readonly failedAreasCount: number;
  readonly failedSubjectsCount: number;
  readonly groupRank: number | null;
  readonly promotionStatusDescription: string | null;
  readonly isCommissionPromoted: boolean;
  readonly scoresBySubject: Record<
    number,
    {
      readonly annualScore: number;
      readonly finalRecoveryScore: number | null;
      readonly finalEffectiveScore: number;
      readonly isFailed: boolean;
    }
  >;
}

export interface FinalSabanaReport {
  readonly academicYear: number;
  readonly academicGroupId: number | null;
  readonly subjects: FinalSabanaSubjectColumn[];
  readonly students: FinalSabanaStudentRow[];
}

export interface CloseAcademicYearResult {
  readonly academicYear: number;
  readonly isClosed: boolean;
  readonly periodsUpdated: number;
  readonly nextYearCloned: number | null;
  readonly clonedCounts?: {
    readonly gradingScales: number;
    readonly evaluationDimensions: number;
    readonly evaluationDimensionColumns: number;
    readonly gradingRules: number;
    readonly curriculumStudyPlans: number;
    readonly subjectAreaAssignments: number;
    readonly teacherAcademicYears: number;
    readonly academicPeriods: number;
  };
}

export interface StudentAcademicHistoryYear {
  readonly academicYear: number;
  readonly enrollmentId: number;
  readonly campusName: string;
  readonly shiftName: string;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly enrollmentStatusName: string;
  readonly promotionStatusDescription: string | null;
  readonly finalAverage: number | null;
  readonly isGraduated: boolean;
  readonly actNumber: string | null;
  readonly diplomaNumber: string | null;
  readonly subjects: Array<{
    readonly subjectName: string;
    readonly academicAreaName: string;
    readonly averageScore: number;
    readonly periodsCount: number;
  }>;
}

export interface YearCertificateHeadersRecord {
  readonly academicYear: number;
  readonly isClosed: boolean;
  readonly certificateSettings: Record<string, unknown>;
  readonly graduationActSettings: Record<string, unknown>;
}

export abstract class PromotionRepositoryPort {
  abstract listPromotionStatuses(): Promise<PromotionStatusOption[]>;

  abstract listPromotionRecords(
    schoolId: bigint,
    academicYear: number,
    academicGroupId?: number,
  ): Promise<PromotionRecordView[]>;

  abstract generateFinalBook(
    schoolId: bigint,
    input: {
      academicYear: number;
      academicGroupId?: number;
      actNumber?: string | null;
    },
  ): Promise<{ processedCount: number; records: PromotionRecordView[] }>;

  abstract updatePromotionRecord(
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
  ): Promise<PromotionRecordView>;

  abstract generateFinalRecoveries(
    schoolId: bigint,
    input: {
      academicYear: number;
      academicGroupId?: number;
    },
  ): Promise<{
    eligibleStudentsCount: number;
    generatedRecordsCount: number;
    skippedExistingCount: number;
  }>;

  abstract getFinalSabana(
    schoolId: bigint,
    academicYear: number,
    academicGroupId?: number,
  ): Promise<FinalSabanaReport>;

  abstract applyAdvancePromotion(
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
  ): Promise<PromotionRecordView>;

  abstract enrollReturningStudents(
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
  ): Promise<{ enrolledCount: number; skippedCount: number }>;

  abstract getStudentAcademicHistory(
    schoolId: bigint,
    studentProfileId: bigint,
  ): Promise<StudentAcademicHistoryYear[]>;

  abstract getCertificateHeaders(
    schoolId: bigint,
    academicYear: number,
  ): Promise<YearCertificateHeadersRecord>;

  abstract updateCertificateHeaders(
    schoolId: bigint,
    input: {
      academicYear: number;
      certificateSettings: Record<string, unknown>;
      graduationActSettings: Record<string, unknown>;
    },
  ): Promise<YearCertificateHeadersRecord>;

  abstract setAcademicYearClosedState(
    schoolId: bigint,
    academicYear: number,
    isClosed: boolean,
    options?: {
      cloneToNextYear?: boolean;
    },
  ): Promise<CloseAcademicYearResult>;
}
