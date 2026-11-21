import { AcademicGrade } from '../entities/academic-grade.entity';

export interface InstitutionalGradingRulesSnapshot {
  readonly minScaleScore: number;
  readonly maxScaleScore: number;
  readonly minPassingScore: number;
  readonly failingMaxScore?: number;
  readonly maxRecoveryScore: number;
  readonly decimalsCount: number;
  readonly roundsPeriodScore?: boolean;
  readonly roundingThresholdScore?: number;
  readonly roundingTargetScore?: number;
}

export interface SaveAcademicGradeInput {
  readonly schoolId: bigint;
  readonly academicYear: number;
  readonly enrollmentId: bigint;
  readonly courseAssignmentId: bigint;
  readonly periodId: bigint;
  readonly finalScore: number;
  readonly recoveryScore: number | null;
  readonly justifiedAbsences: number;
  readonly unjustifiedAbsences: number;
  readonly lateArrivals: number;
  readonly preReportObservations?: string | null;
  readonly hasPreReportAlert: boolean;
  readonly changeReason?: string | null;
  readonly updatedByUserId: bigint;
}

export interface StudentBulletinGradeSummary {
  readonly areaName: string;
  readonly subjectName: string;
  readonly weeklyHours: number;
  readonly finalScore: number;
  readonly lostScore: number | null;
  readonly recoveryScore: number | null;
  readonly isLeveled: boolean;
  readonly effectiveScore: number;
  readonly scaleName: string | null;
  readonly scaleAbbreviation: string | null;
  readonly scaleColor: string | null;
  readonly unjustifiedAbsences: number;
  readonly hasPreReportAlert: boolean;
}

export abstract class AcademicGradeRepositoryPort {
  abstract resolveInstitutionalGradingRules(
    schoolId: bigint,
    academicYear: number,
    enrollmentId: bigint,
  ): Promise<InstitutionalGradingRulesSnapshot>;

  abstract upsertGrade(input: SaveAcademicGradeInput): Promise<AcademicGrade>;

  abstract findStudentPeriodBulletin(
    schoolId: bigint,
    academicYear: number,
    enrollmentId: bigint,
    periodId: bigint,
  ): Promise<StudentBulletinGradeSummary[]>;
}
