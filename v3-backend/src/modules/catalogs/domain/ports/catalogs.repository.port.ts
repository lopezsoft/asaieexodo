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

export abstract class CatalogsRepositoryPort {
  abstract getGlobalBundle(schoolId: bigint): Promise<GlobalCatalogsBundle>;
  abstract listCountries(
    schoolId: bigint,
    search?: string,
  ): Promise<CountryCatalogItem[]>;
  abstract listDepartments(
    schoolId: bigint,
    countryId?: number,
    search?: string,
  ): Promise<DepartmentCatalogItem[]>;
  abstract listCities(
    schoolId: bigint,
    departmentId?: number,
    search?: string,
    limit?: number,
  ): Promise<CityCatalogItem[]>;
  abstract getSchoolAcademicContext(
    schoolId: bigint,
  ): Promise<SchoolAcademicContextCatalogs>;
}
