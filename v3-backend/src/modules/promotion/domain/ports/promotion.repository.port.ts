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
  readonly failedAreasCount: number;
  readonly failedSubjectsCount: number;
  readonly totalAbsences: number;
  readonly groupRank: number | null;
  readonly isGraduated: boolean;
  readonly diplomaNumber: string | null;
  readonly graduationFolio: string | null;
  readonly observations: string | null;
  readonly promotedAt: string | null;
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
      isGraduated?: boolean;
      diplomaNumber?: string | null;
      graduationFolio?: string | null;
      observations?: string | null;
    },
  ): Promise<PromotionRecordView>;

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
  ): Promise<{ academicYear: number; isClosed: boolean; periodsUpdated: number }>;
}
