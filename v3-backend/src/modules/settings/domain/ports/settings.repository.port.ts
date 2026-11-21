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
  readonly catalogShiftId: number | null;
  readonly shiftCode: number;
  readonly name: string;
  readonly isActive: boolean;
}

export interface EducationLevelRecord {
  readonly id: number;
  readonly catalogLevelId: number | null;
  readonly levelCode: string;
  readonly name: string;
  readonly abbreviation: string | null;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface GradeGroupRecord {
  readonly id: number;
  readonly catalogGradeGroupId: number | null;
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

export abstract class SettingsRepositoryPort {
  abstract listAcademicYears(schoolId: bigint): Promise<AcademicYearRecord[]>;
  abstract upsertAcademicYear(
    schoolId: bigint,
    input: {
      year: number;
      startDate?: string | null;
      endDate?: string | null;
      onlineEnrollmentClosedAt?: string | null;
      isOnlineEnrollmentOpen?: boolean;
      isClosed?: boolean;
      reportCardSettings?: Record<string, unknown>;
      certificateSettings?: Record<string, unknown>;
      graduationActSettings?: Record<string, unknown>;
    },
  ): Promise<AcademicYearRecord>;

  abstract listGradingRules(
    schoolId: bigint,
    academicYear: number,
  ): Promise<GradingRuleRecord[]>;
  abstract upsertGradingRule(
    schoolId: bigint,
    input: {
      academicYear: number;
      gradeGroupId: number;
      decimalsCount?: number;
      minPassingScore?: number;
      maxRecoveryScore?: number;
      roundingThresholdScore?: number;
      roundingTargetScore?: number;
      minAreaAverage?: number;
      failedAreasLimit?: number;
      failsAfterRecovery?: boolean;
      failsAfterRecoveryMode?: number;
      failsAreaIfAnySubjectFails?: boolean;
      failsYearByMandatoryArea?: boolean;
      promotionMode?: number;
      academicYearMode?: number;
      usesWeightedAreas?: boolean;
      ranksByAreaAverage?: boolean;
      enforcesRecoveryDates?: boolean;
      absenceFailPercentage?: number;
      roundsPeriodScore?: boolean;
      roundsFinalScore?: boolean;
      studentsPerBook?: number;
      promotionDate?: string | null;
    },
  ): Promise<GradingRuleRecord>;
  abstract deleteGradingRule(schoolId: bigint, ruleId: bigint): Promise<void>;

  abstract listShifts(schoolId: bigint): Promise<SchoolShiftRecord[]>;
  abstract saveShift(
    schoolId: bigint,
    input: { id?: bigint; shiftCode: number; name: string; isActive?: boolean },
  ): Promise<SchoolShiftRecord>;
  abstract deleteShift(schoolId: bigint, shiftId: bigint): Promise<void>;

  abstract listEducationLevels(schoolId: bigint): Promise<EducationLevelRecord[]>;
  abstract saveEducationLevel(
    schoolId: bigint,
    input: {
      id?: bigint;
      levelCode: string;
      name: string;
      abbreviation?: string | null;
      displayOrder?: number;
      isActive?: boolean;
    },
  ): Promise<EducationLevelRecord>;
  abstract deleteEducationLevel(schoolId: bigint, levelId: bigint): Promise<void>;

  abstract listGradeGroups(schoolId: bigint): Promise<GradeGroupRecord[]>;
  abstract saveGradeGroup(
    schoolId: bigint,
    input: { id?: bigint; name: string; isCycleEnd?: boolean },
  ): Promise<GradeGroupRecord>;
  abstract deleteGradeGroup(schoolId: bigint, groupId: bigint): Promise<void>;

  abstract listGrades(schoolId: bigint): Promise<GradeRecord[]>;
  abstract saveGrade(
    schoolId: bigint,
    input: {
      id?: bigint;
      educationLevelId: number;
      gradeGroupId?: number | null;
      gradeCode: string;
      name: string;
      displayOrder?: number;
      nextGradeCode?: string | null;
      isActive?: boolean;
    },
  ): Promise<GradeRecord>;
  abstract deleteGrade(schoolId: bigint, gradeId: bigint): Promise<void>;

  abstract listPeriods(
    schoolId: bigint,
    academicYear: number,
  ): Promise<AcademicPeriodRecord[]>;
  abstract savePeriod(
    schoolId: bigint,
    input: {
      id?: bigint;
      gradeGroupId?: number | null;
      academicYear: number;
      periodNumber: number;
      name: string;
      weightPercentage: number;
      startDate: string;
      endDate: string;
      gradingOpenDate?: string | null;
      gradingCloseDate?: string | null;
      recoveryOpenDate?: string | null;
      recoveryCloseDate?: string | null;
      isActive?: boolean;
      isClosed?: boolean;
    },
  ): Promise<AcademicPeriodRecord>;
  abstract deletePeriod(schoolId: bigint, periodId: bigint): Promise<void>;

  abstract listNationalScales(
    schoolId: bigint,
  ): Promise<NationalGradingScaleItem[]>;
  abstract listGradingScales(
    schoolId: bigint,
    academicYear: number,
  ): Promise<GradingScaleRecord[]>;
  abstract saveGradingScale(
    schoolId: bigint,
    input: {
      id?: bigint;
      gradeGroupId?: number | null;
      nationalScaleId: number;
      academicYear: number;
      minScore: number;
      maxScore: number;
      rankOrder?: string | null;
      isFailing?: boolean;
      isGradable?: boolean;
    },
  ): Promise<GradingScaleRecord>;
  abstract deleteGradingScale(schoolId: bigint, scaleId: bigint): Promise<void>;

  abstract listEvaluationDimensions(
    schoolId: bigint,
    academicYear: number,
  ): Promise<EvaluationDimensionRecord[]>;
  abstract saveEvaluationDimension(
    schoolId: bigint,
    input: {
      id?: bigint;
      gradeGroupId?: number | null;
      academicYear: number;
      dimensionCode: number;
      name: string;
      abbreviation?: string | null;
      weightPercentage: number;
      isEditable?: boolean;
    },
  ): Promise<EvaluationDimensionRecord>;
  abstract deleteEvaluationDimension(
    schoolId: bigint,
    dimensionId: bigint,
  ): Promise<void>;
  abstract saveDimensionColumn(
    schoolId: bigint,
    dimensionId: bigint,
    input: { columnNumber: number; label: string; weightPercentage: number },
  ): Promise<DimensionColumnRecord>;
  abstract deleteDimensionColumn(
    schoolId: bigint,
    dimensionId: bigint,
    columnId: bigint,
  ): Promise<void>;

  abstract listObserverTemplates(
    schoolId: bigint,
  ): Promise<ObserverTemplateRecord[]>;
  abstract saveObserverTemplate(
    schoolId: bigint,
    input: {
      id?: bigint;
      name: string;
      description?: string | null;
      headerConfig?: Record<string, unknown>;
      isActive?: boolean;
    },
  ): Promise<ObserverTemplateRecord>;
  abstract deleteObserverTemplate(
    schoolId: bigint,
    templateId: bigint,
  ): Promise<void>;
  abstract saveObserverSection(
    schoolId: bigint,
    templateId: bigint,
    input: {
      title: string;
      isCoexistenceSection?: boolean;
      displayOrder?: number;
      isActive?: boolean;
    },
  ): Promise<ObserverSectionRecord>;
  abstract deleteObserverSection(
    schoolId: bigint,
    sectionId: bigint,
  ): Promise<void>;
  abstract saveObserverCriteria(
    schoolId: bigint,
    sectionId: bigint,
    input: { description: string; displayOrder?: number; isActive?: boolean },
  ): Promise<ObserverCriteriaRecord>;
  abstract deleteObserverCriteria(
    schoolId: bigint,
    criteriaId: bigint,
  ): Promise<void>;

  abstract getBrandingSettings(
    schoolId: bigint,
  ): Promise<SchoolBrandingSettings>;
  abstract updateBrandingSettings(
    schoolId: bigint,
    input: Partial<SchoolBrandingSettings>,
  ): Promise<SchoolBrandingSettings>;

  abstract listSchoolModules(schoolId: bigint): Promise<SchoolModuleRecord[]>;
  abstract toggleSchoolModule(
    schoolId: bigint,
    systemModuleId: number,
    isActive: boolean,
  ): Promise<SchoolModuleRecord>;

  abstract cleanupZeroGrades(
    schoolId: bigint,
    academicYear: number,
  ): Promise<{ deletedCount: number }>;
}
