import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEnvelope } from './v3-unified-auth.service';

export interface YearlyTotalPoint {
  readonly year: number;
  readonly total: number;
}

export interface DashboardStatisticsResponse {
  readonly academicYear: number;
  readonly schoolSummary: {
    readonly id: number;
    readonly name: string;
    readonly shortName: string | null;
    readonly daneCode: string | null;
    readonly isActive: boolean;
    readonly subscriptionLockDate: string;
    readonly logoUrl: string | null;
  };
  readonly kpis: {
    readonly registeredStudents: number;
    readonly retiredStudents: number;
    readonly activeTeachers: number;
    readonly totalCampuses: number;
    readonly totalGroups: number;
    readonly activeStaff: number;
  };
  readonly series: {
    readonly registeredByYear: YearlyTotalPoint[];
    readonly retiredByYear: YearlyTotalPoint[];
    readonly teachersByYear: YearlyTotalPoint[];
  };
}

export interface SchoolProfileRecord {
  readonly id: number;
  readonly publicUuid: string;
  readonly countryId: number;
  readonly departmentId: number | null;
  readonly cityId: number | null;
  readonly cityName: string | null;
  readonly calendarId: number | null;
  readonly sectorId: number | null;
  readonly institutionTypeId: number | null;
  readonly daneCode: string | null;
  readonly taxId: string | null;
  readonly name: string;
  readonly shortName: string | null;
  readonly resolutionText: string | null;
  readonly headerLine1: string | null;
  readonly headerLine2: string | null;
  readonly footerText: string | null;
  readonly directorName: string | null;
  readonly directorDocument: string | null;
  readonly directorSignatureUrl: string | null;
  readonly secretaryName: string | null;
  readonly secretaryDocument: string | null;
  readonly secretarySignatureUrl: string | null;
  readonly address: string | null;
  readonly suburb: string | null;
  readonly phones: string | null;
  readonly email: string | null;
  readonly website: string | null;
  readonly logoUrl: string | null;
  readonly shieldUrl: string | null;
  readonly subscriptionLockDate: string;
  readonly isActive: boolean;
  readonly updatedAt: string;
}

export interface CampusRecord {
  readonly id: number;
  readonly schoolId: number;
  readonly cityId: number | null;
  readonly cityName: string | null;
  readonly departmentId: number | null;
  readonly countryId: number | null;
  readonly zoneId: number | null;
  readonly zoneName: string | null;
  readonly daneCode: string | null;
  readonly consecutiveCode: string | null;
  readonly name: string;
  readonly address: string | null;
  readonly phones: string | null;
  readonly email: string | null;
  readonly isMainCampus: boolean;
  readonly isActive: boolean;
  readonly shiftsCount: number;
  readonly levelsCount: number;
  readonly createdAt: string;
}

export interface CampusShiftRecord {
  readonly id: number;
  readonly campusId: number;
  readonly shiftId: number;
  readonly shiftCode: number;
  readonly shiftName: string;
  readonly isActive: boolean;
}

export interface CampusEducationLevelRecord {
  readonly id: number;
  readonly campusId: number;
  readonly educationLevelId: number;
  readonly levelCode: string;
  readonly levelName: string;
  readonly isActive: boolean;
}

export interface TeacherProfileRecord {
  readonly id: number;
  readonly schoolId: number;
  readonly userId: number | null;
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
  readonly address: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly academicDegreeId: number | null;
  readonly academicDegreeName: string | null;
  readonly payScaleId: number | null;
  readonly payScaleName: string | null;
  readonly teachingAreaId: number | null;
  readonly teachingAreaName: string | null;
  readonly technicalAreaId: number | null;
  readonly appointmentTypeId: number | null;
  readonly positionId: number | null;
  readonly workplaceLocationId: number | null;
  readonly signatureUrl: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface AdministrativeStaffRecord {
  readonly id: number;
  readonly schoolId: number;
  readonly userId: number | null;
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
  readonly phone: string | null;
  readonly email: string | null;
  readonly hierarchyLevelId: number | null;
  readonly hierarchyLevelName: string | null;
  readonly careerTypeId: number | null;
  readonly careerTypeName: string | null;
  readonly appointmentTypeId: number | null;
  readonly appointmentTypeName: string | null;
  readonly workplaceLocationId: number | null;
  readonly isActive: boolean;
  readonly createdAt: string;
}

export interface GroupManagerRecord {
  readonly id: number;
  readonly schoolId: number;
  readonly campusId: number;
  readonly campusName: string;
  readonly shiftId: number;
  readonly shiftName: string;
  readonly gradeId: number;
  readonly gradeCode: string;
  readonly gradeName: string;
  readonly homeroomTeacherId: number | null;
  readonly homeroomTeacherName: string | null;
  readonly studyMethodologyId: number | null;
  readonly academicYear: number;
  readonly groupCode: string;
  readonly name: string;
  readonly maxCapacity: number;
  readonly isActive: boolean;
}

export interface CloudFileRecord {
  readonly id: string;
  readonly fileUuid: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly storageKey: string;
  readonly publicUrl: string | null;
  readonly category: string;
  readonly description: string | null;
  readonly createdAt: string;
}

export interface PaginatedRecords<TItem> {
  readonly items: TItem[];
  readonly total: number;
}

@Injectable({
  providedIn: 'root',
})
export class V3AdministrationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.APIURL}/admin`;

  // Dashboard Ejecutivo
  getDashboardStatistics(
    academicYear: number,
  ): Observable<DashboardStatisticsResponse> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<DashboardStatisticsResponse>>(
        `${this.baseUrl}/dashboard/statistics`,
        { params },
      )
      .pipe(map((res) => res.data));
  }

  // Datos del Plantel
  getSchoolProfile(): Observable<SchoolProfileRecord> {
    return this.http
      .get<ApiEnvelope<SchoolProfileRecord>>(`${this.baseUrl}/school`)
      .pipe(map((res) => res.data));
  }

  updateSchoolProfile(
    payload: Record<string, unknown>,
  ): Observable<SchoolProfileRecord> {
    return this.http
      .patch<ApiEnvelope<SchoolProfileRecord>>(
        `${this.baseUrl}/school`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  // Sedes Educativas
  listCampuses(): Observable<CampusRecord[]> {
    return this.http
      .get<ApiEnvelope<CampusRecord[]>>(`${this.baseUrl}/campuses`)
      .pipe(map((res) => res.data));
  }

  createCampus(payload: Record<string, unknown>): Observable<CampusRecord> {
    return this.http
      .post<ApiEnvelope<CampusRecord>>(`${this.baseUrl}/campuses`, payload)
      .pipe(map((res) => res.data));
  }

  updateCampus(
    campusId: number,
    payload: Record<string, unknown>,
  ): Observable<CampusRecord> {
    return this.http
      .patch<ApiEnvelope<CampusRecord>>(
        `${this.baseUrl}/campuses/${campusId}`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  deleteCampus(campusId: number): Observable<{ deleted: boolean; id: number }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean; id: number }>>(
        `${this.baseUrl}/campuses/${campusId}`,
      )
      .pipe(map((res) => res.data));
  }

  listCampusShifts(campusId: number): Observable<CampusShiftRecord[]> {
    return this.http
      .get<ApiEnvelope<CampusShiftRecord[]>>(
        `${this.baseUrl}/campuses/${campusId}/shifts`,
      )
      .pipe(map((res) => res.data));
  }

  assignCampusShift(
    campusId: number,
    shiftId: number,
  ): Observable<CampusShiftRecord> {
    return this.http
      .post<ApiEnvelope<CampusShiftRecord>>(
        `${this.baseUrl}/campuses/${campusId}/shifts`,
        { shiftId },
      )
      .pipe(map((res) => res.data));
  }

  removeCampusShift(
    campusId: number,
    assignmentId: number,
  ): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/campuses/${campusId}/shifts/${assignmentId}`,
      )
      .pipe(map((res) => res.data));
  }

  listCampusEducationLevels(
    campusId: number,
  ): Observable<CampusEducationLevelRecord[]> {
    return this.http
      .get<ApiEnvelope<CampusEducationLevelRecord[]>>(
        `${this.baseUrl}/campuses/${campusId}/education-levels`,
      )
      .pipe(map((res) => res.data));
  }

  assignCampusEducationLevel(
    campusId: number,
    educationLevelId: number,
  ): Observable<CampusEducationLevelRecord> {
    return this.http
      .post<ApiEnvelope<CampusEducationLevelRecord>>(
        `${this.baseUrl}/campuses/${campusId}/education-levels`,
        { educationLevelId },
      )
      .pipe(map((res) => res.data));
  }

  removeCampusEducationLevel(
    campusId: number,
    assignmentId: number,
  ): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/campuses/${campusId}/education-levels/${assignmentId}`,
      )
      .pipe(map((res) => res.data));
  }

  // Personal Docente
  listTeachers(options?: {
    search?: string;
    onlyActive?: boolean;
    limit?: number;
    offset?: number;
  }): Observable<PaginatedRecords<TeacherProfileRecord>> {
    let params = new HttpParams()
      .set('limit', String(options?.limit ?? 200))
      .set('offset', String(options?.offset ?? 0));
    if (options?.search?.trim()) {
      params = params.set('search', options.search.trim());
    }
    if (options?.onlyActive) {
      params = params.set('onlyActive', 'true');
    }
    return this.http
      .get<ApiEnvelope<PaginatedRecords<TeacherProfileRecord>>>(
        `${this.baseUrl}/teachers`,
        { params },
      )
      .pipe(map((res) => res.data));
  }

  createTeacher(
    payload: Record<string, unknown>,
  ): Observable<TeacherProfileRecord> {
    return this.http
      .post<ApiEnvelope<TeacherProfileRecord>>(
        `${this.baseUrl}/teachers`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  updateTeacher(
    teacherId: number,
    payload: Record<string, unknown>,
  ): Observable<TeacherProfileRecord> {
    return this.http
      .patch<ApiEnvelope<TeacherProfileRecord>>(
        `${this.baseUrl}/teachers/${teacherId}`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  deleteTeacher(teacherId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/teachers/${teacherId}`,
      )
      .pipe(map((res) => res.data));
  }

  // Personal Administrativo
  listAdministrativeStaff(options?: {
    search?: string;
    onlyActive?: boolean;
    limit?: number;
    offset?: number;
  }): Observable<PaginatedRecords<AdministrativeStaffRecord>> {
    let params = new HttpParams()
      .set('limit', String(options?.limit ?? 200))
      .set('offset', String(options?.offset ?? 0));
    if (options?.search?.trim()) {
      params = params.set('search', options.search.trim());
    }
    if (options?.onlyActive) {
      params = params.set('onlyActive', 'true');
    }
    return this.http
      .get<ApiEnvelope<PaginatedRecords<AdministrativeStaffRecord>>>(
        `${this.baseUrl}/staff`,
        { params },
      )
      .pipe(map((res) => res.data));
  }

  createAdministrativeStaff(
    payload: Record<string, unknown>,
  ): Observable<AdministrativeStaffRecord> {
    return this.http
      .post<ApiEnvelope<AdministrativeStaffRecord>>(
        `${this.baseUrl}/staff`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  updateAdministrativeStaff(
    staffId: number,
    payload: Record<string, unknown>,
  ): Observable<AdministrativeStaffRecord> {
    return this.http
      .patch<ApiEnvelope<AdministrativeStaffRecord>>(
        `${this.baseUrl}/staff/${staffId}`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  deleteAdministrativeStaff(staffId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/staff/${staffId}`,
      )
      .pipe(map((res) => res.data));
  }

  // Directores de Grupo
  listGroupManagers(academicYear: number): Observable<GroupManagerRecord[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<GroupManagerRecord[]>>(
        `${this.baseUrl}/group-managers`,
        { params },
      )
      .pipe(map((res) => res.data));
  }

  upsertGroupManager(
    payload: Record<string, unknown>,
  ): Observable<GroupManagerRecord> {
    return this.http
      .post<ApiEnvelope<GroupManagerRecord>>(
        `${this.baseUrl}/group-managers`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  updateGroupManager(
    groupId: number,
    payload: Record<string, unknown>,
  ): Observable<GroupManagerRecord> {
    return this.http
      .patch<ApiEnvelope<GroupManagerRecord>>(
        `${this.baseUrl}/group-managers/${groupId}`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  deleteGroupManager(groupId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/group-managers/${groupId}`,
      )
      .pipe(map((res) => res.data));
  }

  // Archivos S3 (reemplazo de FilesView.js de ExtJS)
  listSchoolFiles(category?: string): Observable<CloudFileRecord[]> {
    let params = new HttpParams().set('limit', '100');
    if (category) {
      params = params.set('category', category);
    }
    return this.http
      .get<ApiEnvelope<CloudFileRecord[]>>(
        `${environment.APIURL}/storage/files`,
        { params },
      )
      .pipe(map((res) => res.data));
  }

  uploadSchoolFileMultipart(
    file: File,
    category: string,
    description?: string,
  ): Observable<CloudFileRecord> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('category', category);
    if (description?.trim()) {
      formData.append('description', description.trim());
    }
    return this.http
      .post<ApiEnvelope<CloudFileRecord>>(
        `${environment.APIURL}/storage/files/upload-multipart`,
        formData,
      )
      .pipe(map((res) => res.data));
  }

  getFileDownloadUrl(
    fileId: string,
  ): Observable<{ downloadUrl: string; expiresInSeconds: number }> {
    return this.http
      .get<ApiEnvelope<{ downloadUrl: string; expiresInSeconds: number }>>(
        `${environment.APIURL}/storage/files/${fileId}/presigned-url`,
      )
      .pipe(map((res) => res.data));
  }

  deleteSchoolFile(fileId: string): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${environment.APIURL}/storage/files/${fileId}`,
      )
      .pipe(map((res) => res.data));
  }

  // Reportes JasperReports (cola BullMQ)
  enqueueJasperReport(payload: {
    templateName: string;
    outputFormat: 'pdf' | 'xlsx' | 'docx';
    parameters?: Record<string, string | number | boolean>;
  }): Observable<{ jobId: string; queue: string; status: string }> {
    return this.http
      .post<ApiEnvelope<{ jobId: string; queue: string; status: string }>>(
        `${environment.APIURL}/reports/enqueue`,
        payload,
      )
      .pipe(map((res) => res.data));
  }
}
