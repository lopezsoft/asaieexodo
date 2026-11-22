import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { V3CatalogsService } from './v3-catalogs.service';
import { ApiEnvelope } from './v3-unified-auth.service';

export interface AcademicYearRecord {
  readonly id: number;
  readonly year: number;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly onlineEnrollmentClosedAt: string | null;
  readonly isOnlineEnrollmentOpen: boolean;
  readonly isClosed: boolean;
  readonly reportCardSettings: Record<string, unknown>;
  readonly certificateSettings: Record<string, unknown>;
  readonly graduationActSettings: Record<string, unknown>;
}

export interface GradingRuleRecord {
  readonly id: number;
  readonly academicYear: number;
  readonly gradeGroupId: number;
  readonly gradeGroupName: string;
  readonly decimalsCount: number;
  readonly minPassingScore: number;
  readonly maxRecoveryScore: number;
  readonly roundingThresholdScore: number;
  readonly roundingTargetScore: number;
  readonly minAreaAverage: number;
  readonly failedAreasLimit: number;
  readonly failsAfterRecovery: boolean;
  readonly failsAfterRecoveryMode: number;
  readonly failsAreaIfAnySubjectFails: boolean;
  readonly failsYearByMandatoryArea: boolean;
  readonly promotionMode: number;
  readonly academicYearMode: number;
  readonly usesWeightedAreas: boolean;
  readonly ranksByAreaAverage: boolean;
  readonly enforcesRecoveryDates: boolean;
  readonly absenceFailPercentage: number;
  readonly roundsPeriodScore: boolean;
  readonly roundsFinalScore: boolean;
  readonly studentsPerBook: number;
  readonly promotionDate: string | null;
}

export interface SchoolShiftRecord {
  readonly id: number;
  readonly shiftCode: number;
  readonly name: string;
  readonly isActive: boolean;
}

export interface EducationLevelRecord {
  readonly id: number;
  readonly levelCode: string;
  readonly name: string;
  readonly abbreviation: string | null;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface GradeGroupRecord {
  readonly id: number;
  readonly name: string;
  readonly isCycleEnd: boolean;
}

export interface GradeRecord {
  readonly id: number;
  readonly educationLevelId: number;
  readonly educationLevelName: string;
  readonly gradeGroupId: number | null;
  readonly gradeGroupName: string | null;
  readonly gradeCode: string;
  readonly name: string;
  readonly displayOrder: number;
  readonly nextGradeCode: string | null;
  readonly isActive: boolean;
}

export interface AcademicPeriodRecord {
  readonly id: number;
  readonly gradeGroupId: number | null;
  readonly gradeGroupName: string | null;
  readonly academicYear: number;
  readonly periodNumber: number;
  readonly name: string;
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

export interface NationalGradingScaleItem {
  readonly id: number;
  readonly name: string;
  readonly abbreviation: string | null;
  readonly description: string | null;
  readonly reportMessage: string | null;
  readonly hexColor: string;
}

export interface GradingScaleRecord {
  readonly id: number;
  readonly gradeGroupId: number | null;
  readonly gradeGroupName: string | null;
  readonly nationalScaleId: number;
  readonly nationalScaleName: string;
  readonly nationalScaleAbbreviation: string | null;
  readonly academicYear: number;
  readonly minScore: number;
  readonly maxScore: number;
  readonly rankOrder: string | null;
  readonly isFailing: boolean;
  readonly isGradable: boolean;
}

export interface DimensionColumnRecord {
  readonly id: number;
  readonly dimensionId: number;
  readonly columnNumber: number;
  readonly label: string;
  readonly weightPercentage: number;
}

export interface EvaluationDimensionRecord {
  readonly id: number;
  readonly gradeGroupId: number | null;
  readonly gradeGroupName: string | null;
  readonly academicYear: number;
  readonly dimensionCode: number;
  readonly name: string;
  readonly abbreviation: string | null;
  readonly weightPercentage: number;
  readonly isEditable: boolean;
  readonly columns: DimensionColumnRecord[];
}

export interface ObserverCriteriaRecord {
  readonly id: number;
  readonly sectionId: number;
  readonly description: string;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface ObserverSectionRecord {
  readonly id: number;
  readonly templateId: number;
  readonly title: string;
  readonly isCoexistenceSection: boolean;
  readonly displayOrder: number;
  readonly isActive: boolean;
  readonly criteria: ObserverCriteriaRecord[];
}

export interface ObserverTemplateRecord {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly headerConfig: Record<string, unknown>;
  readonly isActive: boolean;
  readonly sections: ObserverSectionRecord[];
}

export interface SchoolBrandingSettings {
  readonly headerLine1: string | null;
  readonly headerLine2: string | null;
  readonly footerText: string | null;
  readonly directorName: string | null;
  readonly directorDocument: string | null;
  readonly directorSignatureUrl: string | null;
  readonly secretaryName: string | null;
  readonly secretaryDocument: string | null;
  readonly secretarySignatureUrl: string | null;
  readonly logoUrl: string | null;
  readonly shieldUrl: string | null;
  readonly settings: Record<string, unknown>;
}

export interface SchoolModuleRecord {
  readonly systemModuleId: number;
  readonly tag: string;
  readonly moduleName: string;
  readonly isActive: boolean;
  readonly status: number;
}

@Injectable({ providedIn: 'root' })
export class V3SettingsService {
  private readonly http = inject(HttpClient);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly baseUrl = `${environment.APIURL}/settings`;

  listAcademicYears(): Observable<AcademicYearRecord[]> {
    return this.http
      .get<ApiEnvelope<AcademicYearRecord[]>>(`${this.baseUrl}/academic-years`)
      .pipe(map((r) => r.data));
  }

  upsertAcademicYear(
    payload: Record<string, unknown>,
  ): Observable<AcademicYearRecord> {
    return this.http
      .post<ApiEnvelope<AcademicYearRecord>>(
        `${this.baseUrl}/academic-years`,
        payload,
      )
      .pipe(
        map((r) => r.data),
        tap(() => this.catalogsService.notifySchoolContextChanged()),
      );
  }

  listGradingRules(academicYear: number): Observable<GradingRuleRecord[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<GradingRuleRecord[]>>(`${this.baseUrl}/grading-rules`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  upsertGradingRule(
    payload: Record<string, unknown>,
  ): Observable<GradingRuleRecord> {
    return this.http
      .post<ApiEnvelope<GradingRuleRecord>>(
        `${this.baseUrl}/grading-rules`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteGradingRule(ruleId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/grading-rules/${ruleId}`,
      )
      .pipe(map((r) => r.data));
  }

  listShifts(): Observable<SchoolShiftRecord[]> {
    return this.http
      .get<ApiEnvelope<SchoolShiftRecord[]>>(`${this.baseUrl}/shifts`)
      .pipe(map((r) => r.data));
  }

  saveShift(
    payload: Record<string, unknown>,
    shiftId?: number,
  ): Observable<SchoolShiftRecord> {
    const req$ = shiftId
      ? this.http.patch<ApiEnvelope<SchoolShiftRecord>>(
          `${this.baseUrl}/shifts/${shiftId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<SchoolShiftRecord>>(
          `${this.baseUrl}/shifts`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteShift(shiftId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/shifts/${shiftId}`,
      )
      .pipe(map((r) => r.data));
  }

  listEducationLevels(): Observable<EducationLevelRecord[]> {
    return this.http
      .get<ApiEnvelope<EducationLevelRecord[]>>(
        `${this.baseUrl}/education-levels`,
      )
      .pipe(map((r) => r.data));
  }

  saveEducationLevel(
    payload: Record<string, unknown>,
    levelId?: number,
  ): Observable<EducationLevelRecord> {
    const req$ = levelId
      ? this.http.patch<ApiEnvelope<EducationLevelRecord>>(
          `${this.baseUrl}/education-levels/${levelId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<EducationLevelRecord>>(
          `${this.baseUrl}/education-levels`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteEducationLevel(levelId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/education-levels/${levelId}`,
      )
      .pipe(map((r) => r.data));
  }

  listGradeGroups(): Observable<GradeGroupRecord[]> {
    return this.http
      .get<ApiEnvelope<GradeGroupRecord[]>>(`${this.baseUrl}/grade-groups`)
      .pipe(map((r) => r.data));
  }

  saveGradeGroup(
    payload: Record<string, unknown>,
    groupId?: number,
  ): Observable<GradeGroupRecord> {
    const req$ = groupId
      ? this.http.patch<ApiEnvelope<GradeGroupRecord>>(
          `${this.baseUrl}/grade-groups/${groupId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<GradeGroupRecord>>(
          `${this.baseUrl}/grade-groups`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteGradeGroup(groupId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/grade-groups/${groupId}`,
      )
      .pipe(map((r) => r.data));
  }

  listGrades(): Observable<GradeRecord[]> {
    return this.http
      .get<ApiEnvelope<GradeRecord[]>>(`${this.baseUrl}/grades`)
      .pipe(map((r) => r.data));
  }

  saveGrade(
    payload: Record<string, unknown>,
    gradeId?: number,
  ): Observable<GradeRecord> {
    const req$ = gradeId
      ? this.http.patch<ApiEnvelope<GradeRecord>>(
          `${this.baseUrl}/grades/${gradeId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<GradeRecord>>(
          `${this.baseUrl}/grades`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteGrade(gradeId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/grades/${gradeId}`,
      )
      .pipe(map((r) => r.data));
  }

  listPeriods(academicYear: number): Observable<AcademicPeriodRecord[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<AcademicPeriodRecord[]>>(`${this.baseUrl}/periods`, {
        params,
      })
      .pipe(map((r) => r.data));
  }

  savePeriod(
    payload: Record<string, unknown>,
    periodId?: number,
  ): Observable<AcademicPeriodRecord> {
    const req$ = periodId
      ? this.http.patch<ApiEnvelope<AcademicPeriodRecord>>(
          `${this.baseUrl}/periods/${periodId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<AcademicPeriodRecord>>(
          `${this.baseUrl}/periods`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deletePeriod(periodId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/periods/${periodId}`,
      )
      .pipe(map((r) => r.data));
  }

  listNationalScales(): Observable<NationalGradingScaleItem[]> {
    return this.http
      .get<ApiEnvelope<NationalGradingScaleItem[]>>(
        `${this.baseUrl}/national-scales`,
      )
      .pipe(map((r) => r.data));
  }

  listGradingScales(academicYear: number): Observable<GradingScaleRecord[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<GradingScaleRecord[]>>(
        `${this.baseUrl}/grading-scales`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  saveGradingScale(
    payload: Record<string, unknown>,
    scaleId?: number,
  ): Observable<GradingScaleRecord> {
    const req$ = scaleId
      ? this.http.patch<ApiEnvelope<GradingScaleRecord>>(
          `${this.baseUrl}/grading-scales/${scaleId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<GradingScaleRecord>>(
          `${this.baseUrl}/grading-scales`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteGradingScale(scaleId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/grading-scales/${scaleId}`,
      )
      .pipe(map((r) => r.data));
  }

  listDimensions(
    academicYear: number,
  ): Observable<EvaluationDimensionRecord[]> {
    const params = new HttpParams().set('academicYear', String(academicYear));
    return this.http
      .get<ApiEnvelope<EvaluationDimensionRecord[]>>(
        `${this.baseUrl}/dimensions`,
        { params },
      )
      .pipe(map((r) => r.data));
  }

  saveDimension(
    payload: Record<string, unknown>,
    dimensionId?: number,
  ): Observable<EvaluationDimensionRecord> {
    const req$ = dimensionId
      ? this.http.patch<ApiEnvelope<EvaluationDimensionRecord>>(
          `${this.baseUrl}/dimensions/${dimensionId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<EvaluationDimensionRecord>>(
          `${this.baseUrl}/dimensions`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteDimension(dimensionId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/dimensions/${dimensionId}`,
      )
      .pipe(map((r) => r.data));
  }

  saveDimensionColumn(
    dimensionId: number,
    payload: { columnNumber: number; label: string; weightPercentage: number },
  ): Observable<DimensionColumnRecord> {
    return this.http
      .post<ApiEnvelope<DimensionColumnRecord>>(
        `${this.baseUrl}/dimensions/${dimensionId}/columns`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteDimensionColumn(
    dimensionId: number,
    columnId: number,
  ): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/dimensions/${dimensionId}/columns/${columnId}`,
      )
      .pipe(map((r) => r.data));
  }

  listObserverTemplates(): Observable<ObserverTemplateRecord[]> {
    return this.http
      .get<ApiEnvelope<ObserverTemplateRecord[]>>(
        `${this.baseUrl}/observer/templates`,
      )
      .pipe(map((r) => r.data));
  }

  saveObserverTemplate(
    payload: Record<string, unknown>,
    templateId?: number,
  ): Observable<ObserverTemplateRecord> {
    const req$ = templateId
      ? this.http.patch<ApiEnvelope<ObserverTemplateRecord>>(
          `${this.baseUrl}/observer/templates/${templateId}`,
          payload,
        )
      : this.http.post<ApiEnvelope<ObserverTemplateRecord>>(
          `${this.baseUrl}/observer/templates`,
          payload,
        );
    return req$.pipe(map((r) => r.data));
  }

  deleteObserverTemplate(templateId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/observer/templates/${templateId}`,
      )
      .pipe(map((r) => r.data));
  }

  saveObserverSection(
    templateId: number,
    payload: Record<string, unknown>,
  ): Observable<ObserverSectionRecord> {
    return this.http
      .post<ApiEnvelope<ObserverSectionRecord>>(
        `${this.baseUrl}/observer/templates/${templateId}/sections`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteObserverSection(sectionId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/observer/sections/${sectionId}`,
      )
      .pipe(map((r) => r.data));
  }

  saveObserverCriteria(
    sectionId: number,
    payload: Record<string, unknown>,
  ): Observable<ObserverCriteriaRecord> {
    return this.http
      .post<ApiEnvelope<ObserverCriteriaRecord>>(
        `${this.baseUrl}/observer/sections/${sectionId}/criteria`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  deleteObserverCriteria(criteriaId: number): Observable<{ deleted: boolean }> {
    return this.http
      .delete<ApiEnvelope<{ deleted: boolean }>>(
        `${this.baseUrl}/observer/criteria/${criteriaId}`,
      )
      .pipe(map((r) => r.data));
  }

  getBrandingSettings(): Observable<SchoolBrandingSettings> {
    return this.http
      .get<ApiEnvelope<SchoolBrandingSettings>>(`${this.baseUrl}/branding`)
      .pipe(map((r) => r.data));
  }

  updateBrandingSettings(
    payload: Record<string, unknown>,
  ): Observable<SchoolBrandingSettings> {
    return this.http
      .patch<ApiEnvelope<SchoolBrandingSettings>>(
        `${this.baseUrl}/branding`,
        payload,
      )
      .pipe(map((r) => r.data));
  }

  listSchoolModules(): Observable<SchoolModuleRecord[]> {
    return this.http
      .get<ApiEnvelope<SchoolModuleRecord[]>>(`${this.baseUrl}/modules`)
      .pipe(map((r) => r.data));
  }

  toggleSchoolModule(
    systemModuleId: number,
    isActive: boolean,
  ): Observable<SchoolModuleRecord> {
    return this.http
      .patch<ApiEnvelope<SchoolModuleRecord>>(
        `${this.baseUrl}/modules/${systemModuleId}`,
        { isActive },
      )
      .pipe(map((r) => r.data));
  }

  cleanupZeroGrades(
    academicYear: number,
  ): Observable<{ deletedCount: number }> {
    return this.http
      .post<ApiEnvelope<{ deletedCount: number }>>(
        `${this.baseUrl}/cleanup-zero-grades`,
        { academicYear },
      )
      .pipe(map((r) => r.data));
  }
}
