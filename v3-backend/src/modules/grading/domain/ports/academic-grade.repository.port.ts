import { AcademicGrade } from '../entities/academic-grade.entity';

export interface SaveAcademicGradeInput {
  readonly schoolId: bigint;
  readonly academicYear: number;
  readonly enrollmentId: bigint;
  readonly courseAssignmentId: bigint;
  readonly academicPeriodId: bigint;
  readonly finalScore: number;
  readonly remedialScore: number;
  readonly justifiedAbsences: number;
  readonly unjustifiedAbsences: number;
  readonly tardies: number;
  readonly preReportObservation?: string | null;
  readonly hasPreReportAlert?: boolean;
  readonly updatedByUserId: bigint;
}

export interface StudentBulletinGradeSummary {
  readonly areaName: string;
  readonly subjectName: string;
  readonly weeklyHours: number;
  readonly finalScore: number;
  readonly remedialScore: number;
  readonly effectiveScore: number;
  readonly scaleName: string | null;
  readonly unjustifiedAbsences: number;
}

export abstract class AcademicGradeRepositoryPort {
  abstract upsertGrade(input: SaveAcademicGradeInput): Promise<AcademicGrade>;
  abstract findStudentPeriodBulletin(
    schoolId: bigint,
    academicYear: number,
    enrollmentId: bigint,
    academicPeriodId: bigint,
  ): Promise<StudentBulletinGradeSummary[]>;
}
