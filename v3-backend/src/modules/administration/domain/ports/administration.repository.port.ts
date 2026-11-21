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

export interface UpdateSchoolProfileInput {
  readonly countryId?: number;
  readonly cityId?: number | null;
  readonly calendarId?: number | null;
  readonly sectorId?: number | null;
  readonly institutionTypeId?: number | null;
  readonly daneCode?: string | null;
  readonly taxId?: string | null;
  readonly name: string;
  readonly shortName?: string | null;
  readonly resolutionText?: string | null;
  readonly headerLine1?: string | null;
  readonly headerLine2?: string | null;
  readonly footerText?: string | null;
  readonly directorName?: string | null;
  readonly directorDocument?: string | null;
  readonly secretaryName?: string | null;
  readonly secretaryDocument?: string | null;
  readonly address?: string | null;
  readonly suburb?: string | null;
  readonly phones?: string | null;
  readonly email?: string | null;
  readonly website?: string | null;
  readonly logoUrl?: string | null;
  readonly shieldUrl?: string | null;
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

export interface SaveCampusInput {
  readonly cityId?: number | null;
  readonly zoneId?: number | null;
  readonly daneCode?: string | null;
  readonly consecutiveCode?: string | null;
  readonly name: string;
  readonly address?: string | null;
  readonly phones?: string | null;
  readonly email?: string | null;
  readonly isMainCampus?: boolean;
  readonly isActive?: boolean;
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

export interface SaveTeacherInput {
  readonly documentTypeId?: number | null;
  readonly documentNumber: string;
  readonly firstName: string;
  readonly middleName?: string | null;
  readonly lastName: string;
  readonly secondLastName?: string | null;
  readonly genderId?: number | null;
  readonly birthDate?: string | null;
  readonly address?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly academicDegreeId?: number | null;
  readonly payScaleId?: number | null;
  readonly teachingAreaId?: number | null;
  readonly technicalAreaId?: number | null;
  readonly appointmentTypeId?: number | null;
  readonly positionId?: number | null;
  readonly workplaceLocationId?: number | null;
  readonly signatureUrl?: string | null;
  readonly isActive?: boolean;
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

export interface SaveAdministrativeStaffInput {
  readonly documentTypeId?: number | null;
  readonly documentNumber: string;
  readonly firstName: string;
  readonly middleName?: string | null;
  readonly lastName: string;
  readonly secondLastName?: string | null;
  readonly genderId?: number | null;
  readonly birthDate?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly hierarchyLevelId?: number | null;
  readonly careerTypeId?: number | null;
  readonly appointmentTypeId?: number | null;
  readonly workplaceLocationId?: number | null;
  readonly isActive?: boolean;
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

export interface UpsertGroupManagerInput {
  readonly campusId: number;
  readonly shiftId: number;
  readonly gradeId: number;
  readonly homeroomTeacherId?: number | null;
  readonly studyMethodologyId?: number | null;
  readonly academicYear: number;
  readonly groupCode: string;
  readonly name?: string;
  readonly maxCapacity?: number;
  readonly isActive?: boolean;
}

export interface UpdateGroupManagerInput {
  readonly homeroomTeacherId?: number | null;
  readonly name?: string;
  readonly maxCapacity?: number;
  readonly isActive?: boolean;
}

export interface PaginatedRecords<TItem> {
  readonly items: TItem[];
  readonly total: number;
}

export abstract class AdministrationRepositoryPort {
  abstract getDashboardStatistics(
    schoolId: bigint,
    academicYear: number,
  ): Promise<DashboardStatisticsResponse>;

  abstract getSchoolProfile(schoolId: bigint): Promise<SchoolProfileRecord>;
  abstract updateSchoolProfile(
    schoolId: bigint,
    input: UpdateSchoolProfileInput,
  ): Promise<SchoolProfileRecord>;

  abstract listCampuses(schoolId: bigint): Promise<CampusRecord[]>;
  abstract createCampus(
    schoolId: bigint,
    input: SaveCampusInput,
  ): Promise<CampusRecord>;
  abstract updateCampus(
    schoolId: bigint,
    campusId: bigint,
    input: SaveCampusInput,
  ): Promise<CampusRecord>;
  abstract deleteCampus(schoolId: bigint, campusId: bigint): Promise<void>;

  abstract listCampusShifts(
    schoolId: bigint,
    campusId: bigint,
  ): Promise<CampusShiftRecord[]>;
  abstract assignCampusShift(
    schoolId: bigint,
    campusId: bigint,
    shiftId: bigint,
  ): Promise<CampusShiftRecord>;
  abstract removeCampusShift(
    schoolId: bigint,
    campusId: bigint,
    assignmentId: bigint,
  ): Promise<void>;

  abstract listCampusEducationLevels(
    schoolId: bigint,
    campusId: bigint,
  ): Promise<CampusEducationLevelRecord[]>;
  abstract assignCampusEducationLevel(
    schoolId: bigint,
    campusId: bigint,
    educationLevelId: bigint,
  ): Promise<CampusEducationLevelRecord>;
  abstract removeCampusEducationLevel(
    schoolId: bigint,
    campusId: bigint,
    assignmentId: bigint,
  ): Promise<void>;

  abstract listTeachers(
    schoolId: bigint,
    options: { search?: string; onlyActive?: boolean; limit: number; offset: number },
  ): Promise<PaginatedRecords<TeacherProfileRecord>>;
  abstract createTeacher(
    schoolId: bigint,
    input: SaveTeacherInput,
  ): Promise<TeacherProfileRecord>;
  abstract updateTeacher(
    schoolId: bigint,
    teacherId: bigint,
    input: SaveTeacherInput,
  ): Promise<TeacherProfileRecord>;
  abstract deleteTeacher(schoolId: bigint, teacherId: bigint): Promise<void>;

  abstract listAdministrativeStaff(
    schoolId: bigint,
    options: { search?: string; onlyActive?: boolean; limit: number; offset: number },
  ): Promise<PaginatedRecords<AdministrativeStaffRecord>>;
  abstract createAdministrativeStaff(
    schoolId: bigint,
    input: SaveAdministrativeStaffInput,
  ): Promise<AdministrativeStaffRecord>;
  abstract updateAdministrativeStaff(
    schoolId: bigint,
    staffId: bigint,
    input: SaveAdministrativeStaffInput,
  ): Promise<AdministrativeStaffRecord>;
  abstract deleteAdministrativeStaff(
    schoolId: bigint,
    staffId: bigint,
  ): Promise<void>;

  abstract listGroupManagers(
    schoolId: bigint,
    academicYear: number,
  ): Promise<GroupManagerRecord[]>;
  abstract upsertGroupManager(
    schoolId: bigint,
    input: UpsertGroupManagerInput,
  ): Promise<GroupManagerRecord>;
  abstract updateGroupManager(
    schoolId: bigint,
    groupId: bigint,
    input: UpdateGroupManagerInput,
  ): Promise<GroupManagerRecord>;
  abstract deleteGroupManager(schoolId: bigint, groupId: bigint): Promise<void>;
}
