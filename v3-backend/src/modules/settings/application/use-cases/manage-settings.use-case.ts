import { Injectable } from '@nestjs/common';
import {
  AcademicPeriodRecord,
  AcademicYearRecord,
  DimensionColumnRecord,
  EducationLevelRecord,
  EvaluationDimensionRecord,
  GradeGroupRecord,
  GradeRecord,
  GradingRuleRecord,
  GradingScaleRecord,
  NationalGradingScaleItem,
  ObserverCriteriaRecord,
  ObserverSectionRecord,
  ObserverTemplateRecord,
  SchoolBrandingSettings,
  SchoolModuleRecord,
  SchoolShiftRecord,
  SettingsRepositoryPort,
} from '../../domain/ports/settings.repository.port';

@Injectable()
export class ManageSettingsUseCase {
  constructor(private readonly repository: SettingsRepositoryPort) {}

  listAcademicYears(schoolId: bigint): Promise<AcademicYearRecord[]> {
    return this.repository.listAcademicYears(schoolId);
  }

  upsertAcademicYear(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['upsertAcademicYear']>[1],
  ): Promise<AcademicYearRecord> {
    return this.repository.upsertAcademicYear(schoolId, input);
  }

  listGradingRules(
    schoolId: bigint,
    academicYear?: number,
  ): Promise<GradingRuleRecord[]> {
    return this.repository.listGradingRules(
      schoolId,
      academicYear ?? new Date().getFullYear(),
    );
  }

  upsertGradingRule(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['upsertGradingRule']>[1],
  ): Promise<GradingRuleRecord> {
    return this.repository.upsertGradingRule(schoolId, input);
  }

  deleteGradingRule(schoolId: bigint, ruleId: bigint): Promise<void> {
    return this.repository.deleteGradingRule(schoolId, ruleId);
  }

  listShifts(schoolId: bigint): Promise<SchoolShiftRecord[]> {
    return this.repository.listShifts(schoolId);
  }

  saveShift(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveShift']>[1],
  ): Promise<SchoolShiftRecord> {
    return this.repository.saveShift(schoolId, input);
  }

  deleteShift(schoolId: bigint, shiftId: bigint): Promise<void> {
    return this.repository.deleteShift(schoolId, shiftId);
  }

  listEducationLevels(schoolId: bigint): Promise<EducationLevelRecord[]> {
    return this.repository.listEducationLevels(schoolId);
  }

  saveEducationLevel(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveEducationLevel']>[1],
  ): Promise<EducationLevelRecord> {
    return this.repository.saveEducationLevel(schoolId, input);
  }

  deleteEducationLevel(schoolId: bigint, levelId: bigint): Promise<void> {
    return this.repository.deleteEducationLevel(schoolId, levelId);
  }

  listGradeGroups(schoolId: bigint): Promise<GradeGroupRecord[]> {
    return this.repository.listGradeGroups(schoolId);
  }

  saveGradeGroup(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveGradeGroup']>[1],
  ): Promise<GradeGroupRecord> {
    return this.repository.saveGradeGroup(schoolId, input);
  }

  deleteGradeGroup(schoolId: bigint, groupId: bigint): Promise<void> {
    return this.repository.deleteGradeGroup(schoolId, groupId);
  }

  listGrades(schoolId: bigint): Promise<GradeRecord[]> {
    return this.repository.listGrades(schoolId);
  }

  saveGrade(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveGrade']>[1],
  ): Promise<GradeRecord> {
    return this.repository.saveGrade(schoolId, input);
  }

  deleteGrade(schoolId: bigint, gradeId: bigint): Promise<void> {
    return this.repository.deleteGrade(schoolId, gradeId);
  }

  listPeriods(
    schoolId: bigint,
    academicYear?: number,
  ): Promise<AcademicPeriodRecord[]> {
    return this.repository.listPeriods(
      schoolId,
      academicYear ?? new Date().getFullYear(),
    );
  }

  savePeriod(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['savePeriod']>[1],
  ): Promise<AcademicPeriodRecord> {
    return this.repository.savePeriod(schoolId, input);
  }

  deletePeriod(schoolId: bigint, periodId: bigint): Promise<void> {
    return this.repository.deletePeriod(schoolId, periodId);
  }

  listNationalScales(schoolId: bigint): Promise<NationalGradingScaleItem[]> {
    return this.repository.listNationalScales(schoolId);
  }

  listGradingScales(
    schoolId: bigint,
    academicYear?: number,
  ): Promise<GradingScaleRecord[]> {
    return this.repository.listGradingScales(
      schoolId,
      academicYear ?? new Date().getFullYear(),
    );
  }

  saveGradingScale(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveGradingScale']>[1],
  ): Promise<GradingScaleRecord> {
    return this.repository.saveGradingScale(schoolId, input);
  }

  deleteGradingScale(schoolId: bigint, scaleId: bigint): Promise<void> {
    return this.repository.deleteGradingScale(schoolId, scaleId);
  }

  listEvaluationDimensions(
    schoolId: bigint,
    academicYear?: number,
  ): Promise<EvaluationDimensionRecord[]> {
    return this.repository.listEvaluationDimensions(
      schoolId,
      academicYear ?? new Date().getFullYear(),
    );
  }

  saveEvaluationDimension(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveEvaluationDimension']>[1],
  ): Promise<EvaluationDimensionRecord> {
    return this.repository.saveEvaluationDimension(schoolId, input);
  }

  deleteEvaluationDimension(
    schoolId: bigint,
    dimensionId: bigint,
  ): Promise<void> {
    return this.repository.deleteEvaluationDimension(schoolId, dimensionId);
  }

  saveDimensionColumn(
    schoolId: bigint,
    dimensionId: bigint,
    input: Parameters<SettingsRepositoryPort['saveDimensionColumn']>[2],
  ): Promise<DimensionColumnRecord> {
    return this.repository.saveDimensionColumn(schoolId, dimensionId, input);
  }

  deleteDimensionColumn(
    schoolId: bigint,
    dimensionId: bigint,
    columnId: bigint,
  ): Promise<void> {
    return this.repository.deleteDimensionColumn(
      schoolId,
      dimensionId,
      columnId,
    );
  }

  listObserverTemplates(schoolId: bigint): Promise<ObserverTemplateRecord[]> {
    return this.repository.listObserverTemplates(schoolId);
  }

  saveObserverTemplate(
    schoolId: bigint,
    input: Parameters<SettingsRepositoryPort['saveObserverTemplate']>[1],
  ): Promise<ObserverTemplateRecord> {
    return this.repository.saveObserverTemplate(schoolId, input);
  }

  deleteObserverTemplate(schoolId: bigint, templateId: bigint): Promise<void> {
    return this.repository.deleteObserverTemplate(schoolId, templateId);
  }

  saveObserverSection(
    schoolId: bigint,
    templateId: bigint,
    input: Parameters<SettingsRepositoryPort['saveObserverSection']>[2],
  ): Promise<ObserverSectionRecord> {
    return this.repository.saveObserverSection(schoolId, templateId, input);
  }

  deleteObserverSection(schoolId: bigint, sectionId: bigint): Promise<void> {
    return this.repository.deleteObserverSection(schoolId, sectionId);
  }

  saveObserverCriteria(
    schoolId: bigint,
    sectionId: bigint,
    input: Parameters<SettingsRepositoryPort['saveObserverCriteria']>[2],
  ): Promise<ObserverCriteriaRecord> {
    return this.repository.saveObserverCriteria(schoolId, sectionId, input);
  }

  deleteObserverCriteria(schoolId: bigint, criteriaId: bigint): Promise<void> {
    return this.repository.deleteObserverCriteria(schoolId, criteriaId);
  }

  getBrandingSettings(schoolId: bigint): Promise<SchoolBrandingSettings> {
    return this.repository.getBrandingSettings(schoolId);
  }

  updateBrandingSettings(
    schoolId: bigint,
    input: Partial<SchoolBrandingSettings>,
  ): Promise<SchoolBrandingSettings> {
    return this.repository.updateBrandingSettings(schoolId, input);
  }

  listSchoolModules(schoolId: bigint): Promise<SchoolModuleRecord[]> {
    return this.repository.listSchoolModules(schoolId);
  }

  toggleSchoolModule(
    schoolId: bigint,
    systemModuleId: number,
    isActive: boolean,
  ): Promise<SchoolModuleRecord> {
    return this.repository.toggleSchoolModule(
      schoolId,
      systemModuleId,
      isActive,
    );
  }

  cleanupZeroGrades(
    schoolId: bigint,
    academicYear: number,
    actorUserId?: bigint,
  ): Promise<{ deletedCount: number }> {
    return this.repository.cleanupZeroGrades(
      schoolId,
      academicYear,
      actorUserId,
    );
  }
}
