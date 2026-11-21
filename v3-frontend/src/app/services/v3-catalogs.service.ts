import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEnvelope } from './v3-unified-auth.service';

export interface CatalogOptionItem {
  readonly id: number;
  readonly code?: string | null;
  readonly name: string;
}

export interface CountryCatalogItem {
  readonly id: number;
  readonly isoCode: string;
  readonly isoAlpha3: string | null;
  readonly name: string;
  readonly phonePrefix: string | null;
}

export interface DepartmentCatalogItem {
  readonly id: number;
  readonly countryId: number;
  readonly daneCode: string;
  readonly name: string;
  readonly abbreviation: string | null;
}

export interface CityCatalogItem {
  readonly id: number;
  readonly departmentId: number;
  readonly departmentName: string;
  readonly countryId: number;
  readonly daneCode: string;
  readonly name: string;
}

export interface GlobalCatalogsBundle {
  readonly documentTypes: CatalogOptionItem[];
  readonly genders: CatalogOptionItem[];
  readonly geographicalZones: CatalogOptionItem[];
  readonly academicCalendars: CatalogOptionItem[];
  readonly schoolSectors: CatalogOptionItem[];
  readonly institutionTypes: CatalogOptionItem[];
  readonly legalOwnershipTypes: CatalogOptionItem[];
  readonly academicDegrees: CatalogOptionItem[];
  readonly teacherPayScales: CatalogOptionItem[];
  readonly teachingAreas: CatalogOptionItem[];
  readonly technicalAreas: CatalogOptionItem[];
  readonly staffPositions: CatalogOptionItem[];
  readonly hierarchyLevels: CatalogOptionItem[];
  readonly staffAppointmentTypes: CatalogOptionItem[];
  readonly administrativeCareerTypes: CatalogOptionItem[];
  readonly workplaceLocations: CatalogOptionItem[];
  readonly fundingSources: CatalogOptionItem[];
  readonly enrollmentStatuses: CatalogOptionItem[];
  readonly studyMethodologies: CatalogOptionItem[];
}

export interface SchoolAcademicContextCatalogs {
  readonly campuses: Array<{
    readonly id: number;
    readonly name: string;
    readonly isMainCampus: boolean;
    readonly isActive: boolean;
  }>;
  readonly shifts: Array<{
    readonly id: number;
    readonly shiftCode: number;
    readonly name: string;
    readonly isActive: boolean;
  }>;
  readonly educationLevels: Array<{
    readonly id: number;
    readonly levelCode: string;
    readonly name: string;
    readonly abbreviation: string | null;
    readonly isActive: boolean;
  }>;
  readonly grades: Array<{
    readonly id: number;
    readonly educationLevelId: number;
    readonly gradeCode: string;
    readonly name: string;
    readonly displayOrder: number;
    readonly isActive: boolean;
  }>;
  readonly academicYears: Array<{
    readonly id: number;
    readonly year: number;
    readonly isClosed: boolean;
  }>;
}

/**
 * Servicio centralizado con cache para catalogos estaticos oficiales MEN/DANE/SIMAT,
 * division politica geografica y catalogos institucionales del colegio activo.
 */
@Injectable({
  providedIn: 'root',
})
export class V3CatalogsService {
  private readonly http = inject(HttpClient);
  private bundleCache$: Observable<GlobalCatalogsBundle> | null = null;
  private countriesCache$: Observable<CountryCatalogItem[]> | null = null;

  getGlobalBundle(forceRefresh = false): Observable<GlobalCatalogsBundle> {
    if (!this.bundleCache$ || forceRefresh) {
      this.bundleCache$ = this.http
        .get<ApiEnvelope<GlobalCatalogsBundle>>(
          `${environment.APIURL}/catalogs/bundle`,
        )
        .pipe(
          map((res) => res.data),
          shareReplay(1),
        );
    }
    return this.bundleCache$;
  }

  listCountries(search?: string): Observable<CountryCatalogItem[]> {
    if (!search && this.countriesCache$) {
      return this.countriesCache$;
    }

    let params = new HttpParams();
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    const request$ = this.http
      .get<ApiEnvelope<CountryCatalogItem[]>>(
        `${environment.APIURL}/catalogs/countries`,
        { params },
      )
      .pipe(map((res) => res.data));

    if (!search) {
      this.countriesCache$ = request$.pipe(shareReplay(1));
      return this.countriesCache$;
    }
    return request$;
  }

  listDepartments(
    countryId?: number,
    search?: string,
  ): Observable<DepartmentCatalogItem[]> {
    let params = new HttpParams();
    if (countryId) {
      params = params.set('countryId', String(countryId));
    }
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<ApiEnvelope<DepartmentCatalogItem[]>>(
        `${environment.APIURL}/catalogs/departments`,
        { params },
      )
      .pipe(map((res) => res.data));
  }

  listCities(
    departmentId?: number,
    search?: string,
    limit = 300,
  ): Observable<CityCatalogItem[]> {
    let params = new HttpParams().set('limit', String(limit));
    if (departmentId) {
      params = params.set('departmentId', String(departmentId));
    }
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<ApiEnvelope<CityCatalogItem[]>>(
        `${environment.APIURL}/catalogs/cities`,
        { params },
      )
      .pipe(map((res) => res.data));
  }

  getSchoolContext(): Observable<SchoolAcademicContextCatalogs> {
    return this.http
      .get<ApiEnvelope<SchoolAcademicContextCatalogs>>(
        `${environment.APIURL}/catalogs/school-context`,
      )
      .pipe(map((res) => res.data));
  }

  invalidateCache(): void {
    this.bundleCache$ = null;
    this.countriesCache$ = null;
  }
}
