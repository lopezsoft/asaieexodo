import { AcademicGrade } from '../entities/academic-grade.entity';

export interface InstitutionalGradingRulesSnapshot {
  readonly minScaleScore: number;
  readonly maxScaleScore: number;
  readonly minPassingScore: number;
  readonly maxRecoveryScore: number;
  readonly decimalsCount: number;
}

export interface SaveAcademicGradeInput {
  readonly schoolId: bigint;
  readonly academicYear: number;
  readonly enrollmentId: bigint;
  readonly courseAssignmentId: bigint;
  readonly periodId: bigint;
  readonly finalScore: number;
  readonly recoveryScore: number;
  readonly levelingScore: number;
  readonly justifiedAbsences: number;
  readonly unjustifiedAbsences: number;
  readonly lateArrivals: number;
  readonly teacherObservations?: string | null;
  readonly hasPreReportAlert: boolean;
  readonly changeReason?: string | null;
  readonly updatedByUserId: bigint;
}

export interface StudentBulletinGradeSummary {
  readonly areaName: string;
  readonly subjectName: string;
  readonly weeklyHours: number;
  readonly finalScore: number;
  readonly recoveryScore: number;
  readonly levelingScore: number;
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
