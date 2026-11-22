import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { V3CatalogsService } from './v3-catalogs.service';
import { ApiEnvelope } from './v3-unified-auth.service';

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
  readonly promotionMessages?: Record<string, unknown>;
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

/**
 * Servicio HTTP V3 para el Módulo de Promoción, Libro Final, Promoción Anticipada,
 * Matrícula de Estudiantes Antiguos, Historial Académico y Cierre de Año Lectivo.
 */
@Injectable({ providedIn: 'root' })
export class V3PromotionService {
  private readonly http = inject(HttpClient);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly baseUrl = `${environment.APIURL}/promotion`;

  listStatuses(): Observable<PromotionStatusOption[]> {
    return this.http
      .get<ApiEnvelope<PromotionStatusOption[]>>(`${this.baseUrl}/statuses`)
      .pipe(map((r) => r.data));
  }

  listRecords(
    academicYear: number,
    academicGroupId?: number,
  ): Observable<PromotionRecordView[]> {
    let params = new HttpParams().set('academicYear', String(academicYear));
    if (academicGroupId) {
      params = params.set('academicGroupId', String(academicGroupId));
    }
    return this.http
      .get<ApiEnvelope<PromotionRecordView[]>>(`${this.baseUrl}/records`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  generateFinalBook(payload: {
    academicYear: number;
    academicGroupId?: number;
    actNumber?: string | null;
  }): Observable<{ processedCount: number; records: PromotionRecordView[] }> {
    return this.http
      .post<ApiEnvelope<{ processedCount: number; records: PromotionRecordView[] }>>(
        `${this.baseUrl}/generate-final-book`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  updateRecord(
    recordId: number,
    payload: Record<string, unknown>,
  ): Observable<PromotionRecordView> {
    return this.http
      .patch<ApiEnvelope<PromotionRecordView>>(
        `${this.baseUrl}/records/${recordId}`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  applyAdvancePromotion(
    payload: Record<string, unknown>,
  ): Observable<PromotionRecordView> {
    return this.http
      .post<ApiEnvelope<PromotionRecordView>>(`${this.baseUrl}/advance`, payload)
      .pipe(map((r) => r.data));
  }

  enrollReturningStudents(payload: {
    fromYear: number;
    toYear: number;
    enrollmentIds: number[];
    targetCampusId: number;
    targetShiftId: number;
    targetGradeId: number;
    targetGroupId: number;
  }): Observable<{ enrolledCount: number; skippedCount: number }> {
    return this.http
      .post<ApiEnvelope<{ enrolledCount: number; skippedCount: number }>>(
        `${this.baseUrl}/enroll-returning`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  getAcademicHistory(
    studentProfileId: number,
  ): Observable<StudentAcademicHistoryYear[]> {
    return this.http
      .get<ApiEnvelope<StudentAcademicHistoryYear[]>>(
        `${this.baseUrl}/academic-history/${studentProfileId}`,
      )
      .pipe(map((r) => r.data));
  }

  getCertificateHeaders(
    academicYear: number,
  ): Observable<YearCertificateHeadersRecord> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<YearCertificateHeadersRecord>>(
        `${this.baseUrl}/certificate-headers`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  updateCertificateHeaders(payload: {
    academicYear: number;
    certificateSettings: Record<string, unknown>;
    graduationActSettings: Record<string, unknown>;
  }): Observable<YearCertificateHeadersRecord> {
    return this.http
      .patch<ApiEnvelope<YearCertificateHeadersRecord>>(
        `${this.baseUrl}/certificate-headers`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  generateFinalRecoveries(payload: {
    academicYear: number;
    academicGroupId?: number;
  }): Observable<{
    eligibleStudentsCount: number;
    generatedRecordsCount: number;
    skippedExistingCount: number;
  }> {
    return this.http
      .post<
        ApiEnvelope<{
          eligibleStudentsCount: number;
          generatedRecordsCount: number;
          skippedExistingCount: number;
        }>
      >(`${this.baseUrl}/final-recoveries/generate`, payload)
      .pipe(map((r) => r.data));
  }

  getFinalSabana(
    academicYear: number,
    academicGroupId?: number,
  ): Observable<FinalSabanaReport> {
    let params = new HttpParams().set('academicYear', String(academicYear));
    if (academicGroupId) {
      params = params.set('academicGroupId', String(academicGroupId));
    }
    return this.http
      .get<ApiEnvelope<FinalSabanaReport>>(`${this.baseUrl}/final-sabana`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  setYearClosedState(
    academicYear: number,
    isClosed: boolean,
    cloneToNextYear = true,
  ): Observable<CloseAcademicYearResult> {
    return this.http
      .post<ApiEnvelope<CloseAcademicYearResult>>(`${this.baseUrl}/close-year`, {
        academicYear,
        isClosed,
        cloneToNextYear,
      })
      .pipe(
        map((r) => r.data),
        tap(() => this.catalogsService.notifySchoolContextChanged()),
      );
  }
}
