import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEnvelope } from './v3-unified-auth.service';

export interface AcademicAreaRecord {
  readonly id: number;
  readonly name: string;
  readonly abbreviation: string | null;
  readonly failsSchoolYear: boolean;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface SubjectRecord {
  readonly id: number;
  readonly academicAreaId: number;
  readonly academicAreaName: string;
  readonly name: string;
  readonly abbreviation: string | null;
  readonly isElective: boolean;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface StudyPlanRecord {
  readonly id: number;
  readonly campusId: number | null;
  readonly campusName: string | null;
  readonly gradeId: number;
  readonly gradeName: string;
  readonly subjectId: number;
  readonly subjectName: string;
  readonly academicAreaName: string;
  readonly academicYear: number;
  readonly weeklyHours: number;
  readonly areaWeightPercentage: number;
  readonly isActive: boolean;
}

export interface CourseAssignmentRecord {
  readonly id: number;
  readonly campusId: number;
  readonly campusName: string;
  readonly shiftId: number;
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
  readonly areaWeightPercentage: number;
  readonly isActive: boolean;
}

export interface StudentProfileRecord {
  readonly id: number;
  readonly documentTypeId: number | null;
  readonly documentTypeCode: string | null;
  readonly documentNumber: string;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly secondLastName: string | null;
  readonly fullName: string;
  readonly genderId: number | null;
  readonly birthDate: string | null;
  readonly bloodType: string | null;
  readonly address: string | null;
  readonly suburb: string | null;
  readonly zoneId: number | null;
  readonly socioeconomicStratum: string | null;
  readonly sisbenScore: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly isActive: boolean;
}

export interface FamilyProfileRecord {
  readonly id: number;
  readonly documentTypeId: number | null;
  readonly documentNumber: string;
  readonly fullName: string;
  readonly phone: string | null;
  readonly mobilePhone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly occupation: string | null;
  readonly isActive: boolean;
}

export interface StudentFamilyLinkRecord {
  readonly id: number;
  readonly studentProfileId: number;
  readonly familyProfileId: number;
  readonly familyFullName: string;
  readonly familyDocumentNumber: string;
  readonly familyPhone: string | null;
  readonly relationshipTypeId: number;
  readonly relationshipName: string;
  readonly isPrimaryGuardian: boolean;
  readonly isFinancialResponsible: boolean;
}

export interface EnrollmentRecord {
  readonly id: number;
  readonly studentProfileId: number;
  readonly studentDocumentNumber: string;
  readonly studentFullName: string;
  readonly campusId: number;
  readonly campusName: string;
  readonly shiftId: number;
  readonly shiftName: string;
  readonly gradeId: number;
  readonly gradeName: string;
  readonly academicGroupId: number;
  readonly groupCode: string;
  readonly enrollmentStatusId: number;
  readonly enrollmentStatusName: string;
  readonly academicYear: number;
  readonly registrationNumber: string | null;
  readonly folioNumber: string | null;
  readonly enrollmentDate: string;
  readonly withdrawalDate: string | null;
  readonly isRepeatingGrade: boolean;
  readonly isNewStudent: boolean;
  readonly observations: string | null;
}

export interface EnrollmentNoveltyRecord {
  readonly id: number;
  readonly enrollmentId: number;
  readonly enrollmentStatusId: number;
  readonly enrollmentStatusName: string;
  readonly noveltyDate: string;
  readonly reason: string;
  readonly createdAt: string;
}

export interface ReportedCourseSummary {
  readonly courseAssignmentId: number;
  readonly teacherName: string;
  readonly subjectName: string;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly campusName: string;
  readonly enrolledStudents: number;
  readonly gradedStudents: number;
  readonly completionPercentage: number;
}

export interface EnrollmentGradeRow {
  readonly id: number;
  readonly academicYear: number;
  readonly enrollmentId: number;
  readonly courseAssignmentId: number;
  readonly subjectName: string;
  readonly teacherName: string;
  readonly periodId: number;
  readonly periodNumber: number;
  readonly finalScore: number;
  readonly recoveryScore: number;
  readonly levelingScore: number;
  readonly effectiveScore: number;
  readonly justifiedAbsences: number;
  readonly unjustifiedAbsences: number;
  readonly isLocked: boolean;
}

export interface PeriodRecoveryRecord {
  readonly id: number;
  readonly academicYear: number;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly courseAssignmentId: number;
  readonly subjectName: string;
  readonly periodNumber: number;
  readonly actNumber: string | null;
  readonly previousScore: number;
  readonly recoveryScore: number;
  readonly recoveryType: string;
  readonly recoveryDate: string;
  readonly observations: string | null;
}

export interface HonorRollRecord {
  readonly id: number;
  readonly academicYear: number;
  readonly enrollmentId: number;
  readonly studentFullName: string;
  readonly studentDocumentNumber: string;
  readonly academicGroupId: number;
  readonly gradeName: string;
  readonly groupCode: string;
  readonly campusName: string;
  readonly periodNumber: number;
  readonly averageScore: number;
  readonly groupRank: number;
  readonly gradeRank: number | null;
  readonly failedSubjectsCount: number;
  readonly isHonorRoll: boolean;
}

export interface EnqueueReportResponse {
  readonly success: boolean;
  readonly jobId: string;
  readonly queue: string;
  readonly status: string;
}

export interface ReportJobStatusResponse {
  readonly success: boolean;
  readonly jobId: string;
  readonly state: string;
  readonly result: Record<string, unknown> | null;
  readonly downloadUrl: string | null;
}

/**
 * Servicio HTTP V3 para el Módulo Académico (Plan curricular, Carga académica,
 * Inscripciones, Matrículas, Familias, Control de Notas, Nivelaciones, Cuadro de Honor
 * y Centro de Reportes JasperReports).
 */
@Injectable({ providedIn: 'root' })
export class V3AcademicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.APIURL}/academic`;
  private readonly reportsUrl = `${environment.APIURL}/reports`;

  // Áreas y asignaturas
  listAreas(): Observable<AcademicAreaRecord[]> {
    return this.http
      .get<ApiEnvelope<AcademicAreaRecord[]>>(`${this.baseUrl}/areas`)
      .pipe(map((r) => r.data));
  }

  saveArea(
    payload: Record<string, unknown>,
    areaId?: number,
  ): Observable<AcademicAreaRecord> {
    const req$ = areaId
      ? this.http.patch<ApiEnvelope<AcademicAreaRecord>>(
          `${this.baseUrl}/areas/${areaId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<AcademicAreaRecord>>(
          `${this.baseUrl}/areas`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteArea(areaId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(`${this.baseUrl}/areas/${areaId}`)
      .pipe(map((r) => r.data));
  }

  listSubjects(): Observable<SubjectRecord[]> {
    return this.http
      .get<ApiEnvelope<SubjectRecord[]>>(`${this.baseUrl}/subjects`)
      .pipe(map((r) => r.data));
  }

  saveSubject(
    payload: Record<string, unknown>,
    subjectId?: number,
  ): Observable<SubjectRecord> {
    const req$ = subjectId
      ? this.http.patch<ApiEnvelope<SubjectRecord>>(
          `${this.baseUrl}/subjects/${subjectId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<SubjectRecord>>(
          `${this.baseUrl}/subjects`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteSubject(subjectId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/subjects/${subjectId}`,
      )
      .pipe(map((r) => r.data));
  }

  // Plan de estudios y carga académica
  listStudyPlans(academicYear: number): Observable<StudyPlanRecord[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<StudyPlanRecord[]>>(`${this.baseUrl}/study-plans`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  upsertStudyPlan(payload: Record<string, unknown>): Observable<StudyPlanRecord> {
    return this.http
      .post<ApiEnvelope<StudyPlanRecord>>(`${this.baseUrl}/study-plans`, payload)
      .pipe(map((r) => r.data));
  }

  deleteStudyPlan(planId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/study-plans/${planId}`,
      )
      .pipe(map((r) => r.data));
  }

  listCourseAssignments(
    academicYear: number,
  ): Observable<CourseAssignmentRecord[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<CourseAssignmentRecord[]>>(
        `${this.baseUrl}/course-assignments`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  saveCourseAssignment(
    payload: Record<string, unknown>,
    assignmentId?: number,
  ): Observable<CourseAssignmentRecord> {
    const req$ = assignmentId
      ? this.http.patch<ApiEnvelope<CourseAssignmentRecord>>(
          `${this.baseUrl}/course-assignments/${assignmentId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<CourseAssignmentRecord>>(
          `${this.baseUrl}/course-assignments`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteCourseAssignment(assignmentId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/course-assignments/${assignmentId}`,
      )
      .pipe(map((r) => r.data));
  }

  reassignTeacherCourses(payload: {
    academicYear: number;
    fromTeacherId: number;
    toTeacherId: number;
  }): Observable<{ updatedCount: number }> {
    return this.http
      .post<ApiEnvelope<{ updatedCount: number }>>(
        `${this.baseUrl}/course-assignments/reassign-teacher`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  // Estudiantes, familias y matrículas
  listStudents(search?: string, limit = 150): Observable<StudentProfileRecord[]> {
    let params = new HttpParams().set('limit', String(limit));
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http
      .get<ApiEnvelope<StudentProfileRecord[]>>(`${this.baseUrl}/students`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  saveStudent(
    payload: Record<string, unknown>,
    studentId?: number,
  ): Observable<StudentProfileRecord> {
    const req$ = studentId
      ? this.http.patch<ApiEnvelope<StudentProfileRecord>>(
          `${this.baseUrl}/students/${studentId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<StudentProfileRecord>>(
          `${this.baseUrl}/students`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteStudent(studentId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/students/${studentId}`,
      )
      .pipe(map((r) => r.data));
  }

  listFamilies(search?: string): Observable<FamilyProfileRecord[]> {
    let params = new HttpParams();
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http
      .get<ApiEnvelope<FamilyProfileRecord[]>>(`${this.baseUrl}/families`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  saveFamily(payload: Record<string, unknown>): Observable<FamilyProfileRecord> {
    return this.http
      .post<ApiEnvelope<FamilyProfileRecord>>(`${this.baseUrl}/families`, payload)
      .pipe(map((r) => r.data));
  }

  listStudentFamilies(studentId: number): Observable<StudentFamilyLinkRecord[]> {
    return this.http
      .get<ApiEnvelope<StudentFamilyLinkRecord[]>>(
        `${this.baseUrl}/students/${studentId}/families`,
      )
      .pipe(map((r) => r.data));
  }

  linkStudentFamily(
    studentId: number,
    payload: Record<string, unknown>,
  ): Observable<StudentFamilyLinkRecord> {
    return this.http
      .post<ApiEnvelope<StudentFamilyLinkRecord>>(
        `${this.baseUrl}/students/${studentId}/families`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  unlinkStudentFamily(
    studentId: number,
    linkId: number,
  ): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/students/${studentId}/families/${linkId}`,
      )
      .pipe(map((r) => r.data));
  }

  listEnrollments(
    academicYear: number,
    academicGroupId?: number,
    search?: string,
  ): Observable<EnrollmentRecord[]> {
    let params = new HttpParams().set('academicYear', String(academicYear));
    if (academicGroupId) {
      params = params.set('academicGroupId', String(academicGroupId));
    }
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http
      .get<ApiEnvelope<EnrollmentRecord[]>>(`${this.baseUrl}/enrollments`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  saveEnrollment(payload: Record<string, unknown>): Observable<EnrollmentRecord> {
    return this.http
      .post<ApiEnvelope<EnrollmentRecord>>(`${this.baseUrl}/enrollments`, payload)
      .pipe(map((r) => r.data));
  }

  moveEnrollments(payload: {
    enrollmentIds: number[];
    targetCampusId: number;
    targetShiftId: number;
    targetGradeId: number;
    targetGroupId: number;
  }): Observable<{ movedCount: number }> {
    return this.http
      .post<ApiEnvelope<{ movedCount: number }>>(
        `${this.baseUrl}/enrollments/move`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  listEnrollmentNovelties(
    enrollmentId: number,
  ): Observable<EnrollmentNoveltyRecord[]> {
    return this.http
      .get<ApiEnvelope<EnrollmentNoveltyRecord[]>>(
        `${this.baseUrl}/enrollments/${enrollmentId}/novelties`,
      )
      .pipe(map((r) => r.data));
  }

  recordEnrollmentNovelty(
    enrollmentId: number,
    payload: { enrollmentStatusId: number; noveltyDate?: string; reason: string },
  ): Observable<EnrollmentNoveltyRecord> {
    return this.http
      .post<ApiEnvelope<EnrollmentNoveltyRecord>>(
        `${this.baseUrl}/enrollments/${enrollmentId}/novelties`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  // Control de notas, transferencias, nivelaciones, cuadro de honor y logros
  listReportedGradesSummary(
    academicYear: number,
    periodNumber: number,
  ): Observable<ReportedCourseSummary[]> {
    const params = new HttpParams()
      .set('academicYear', String(academicYear))
      .set('periodNumber', String(periodNumber));
    return this.http
      .get<ApiEnvelope<ReportedCourseSummary[]>>(
        `${this.baseUrl}/grades/reported-summary`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  listEnrollmentGrades(
    enrollmentId: number,
    academicYear: number,
    periodNumber?: number,
  ): Observable<EnrollmentGradeRow[]> {
    let params = new HttpParams().set('academicYear', String(academicYear));
    if (periodNumber) {
      params = params.set('periodNumber', String(periodNumber));
    }
    return this.http
      .get<ApiEnvelope<EnrollmentGradeRow[]>>(
        `${this.baseUrl}/grades/by-enrollment/${enrollmentId}`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  adminUpdateGradeScore(
    gradeId: number,
    payload: {
      academicYear: number;
      finalScore: number;
      recoveryScore?: number;
      levelingScore?: number;
      isLocked?: boolean;
      reason?: string;
    },
  ): Observable<EnrollmentGradeRow> {
    return this.http
      .patch<ApiEnvelope<EnrollmentGradeRow>>(
        `${this.baseUrl}/grades/${gradeId}`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  transferStudentGrades(payload: {
    academicYear: number;
    enrollmentId: number;
    fromCourseAssignmentId: number;
    toCourseAssignmentId: number;
  }): Observable<{ transferredCount: number }> {
    return this.http
      .post<ApiEnvelope<{ transferredCount: number }>>(
        `${this.baseUrl}/grades/transfer`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  listPeriodRecoveries(
    academicYear: number,
    periodNumber?: number,
  ): Observable<PeriodRecoveryRecord[]> {
    let params = new HttpParams().set('academicYear', String(academicYear));
    if (periodNumber) {
      params = params.set('periodNumber', String(periodNumber));
    }
    return this.http
      .get<ApiEnvelope<PeriodRecoveryRecord[]>>(`${this.baseUrl}/recoveries`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  savePeriodRecovery(
    payload: Record<string, unknown>,
  ): Observable<PeriodRecoveryRecord> {
    return this.http
      .post<ApiEnvelope<PeriodRecoveryRecord>>(
        `${this.baseUrl}/recoveries`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  listHonorRoll(
    academicYear: number,
    periodNumber: number,
  ): Observable<HonorRollRecord[]> {
    const params = new HttpParams()
      .set('academicYear', String(academicYear))
      .set('periodNumber', String(periodNumber));
    return this.http
      .get<ApiEnvelope<HonorRollRecord[]>>(`${this.baseUrl}/honor-roll`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  calculateHonorRoll(
    academicYear: number,
    periodNumber: number,
  ): Observable<HonorRollRecord[]> {
    return this.http
      .post<ApiEnvelope<HonorRollRecord[]>>(
        `${this.baseUrl}/honor-roll/calculate`,
        { academicYear, periodNumber },
      )
      .pipe(map((r) => r.data));
  }

  uppercaseAchievements(
    academicYear: number,
  ): Observable<{ updatedCount: number }> {
    return this.http
      .post<ApiEnvelope<{ updatedCount: number }>>(
        `${this.baseUrl}/achievements/uppercase`,
        { academicYear },
      )
      .pipe(map((r) => r.data));
  }

  // Motor de reportes JasperReports (BullMQ + S3)
  enqueueJasperReport(payload: {
    templateName: string;
    outputFormat: 'pdf' | 'xlsx' | 'docx' | 'csv' | 'html';
    parameters?: Record<string, string | number | boolean>;
  }): Observable<EnqueueReportResponse> {
    return this.http.post<EnqueueReportResponse>(
      `${this.reportsUrl}/enqueue`,
      payload,
    );
  }

  getReportJobStatus(jobId: string): Observable<ReportJobStatusResponse> {
    return this.http.get<ReportJobStatusResponse>(
      `${this.reportsUrl}/jobs/${encodeURIComponent(jobId)}`,
    );
  }
}
