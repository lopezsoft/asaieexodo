import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
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

/**
 * Servicio HTTP V3 para el Módulo de Promoción, Libro Final, Promoción Anticipada,
 * Matrícula de Estudiantes Antiguos, Historial Académico y Cierre de Año Lectivo.
 */
@Injectable({ providedIn: 'root' })
export class V3PromotionService {
  private readonly http = inject(HttpClient);
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

  setYearClosedState(
    academicYear: number,
    isClosed: boolean,
  ): Observable<{ academicYear: number; isClosed: boolean; periodsUpdated: number }> {
    return this.http
      .post<
        ApiEnvelope<{
          academicYear: number;
          isClosed: boolean;
          periodsUpdated: number;
        }>
      >(`${this.baseUrl}/close-year`, { academicYear, isClosed })
      .pipe(map((r) => r.data));
  }
}
