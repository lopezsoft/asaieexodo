import { Injectable } from '@nestjs/common';
import { AcademicGrade } from '../../domain/entities/academic-grade.entity';
import {
  AcademicGradeRepositoryPort,
  StudentBulletinGradeSummary,
} from '../../domain/ports/academic-grade.repository.port';
import {
  ArithmeticAverageGradingStrategy,
  CompetencyScoreInput,
  GradingScore,
  WeightedCompetencyGradingStrategy,
} from '../../domain/strategies/grading-calculation.strategy';

export interface RecordStudentGradeCommand {
  readonly schoolId: bigint;
  readonly academicYear: number;
  readonly enrollmentId: bigint;
  readonly courseAssignmentId: bigint;
  readonly academicPeriodId: bigint;
  readonly evaluationMode: 'WEIGHTED_COMPETENCIES' | 'ARITHMETIC_AVERAGE';
  readonly competencyScores: CompetencyScoreInput[];
  readonly remedialScore?: number;
  readonly justifiedAbsences?: number;
  readonly unjustifiedAbsences?: number;
  readonly tardies?: number;
  readonly preReportObservation?: string;
  readonly updatedByUserId: bigint;
}

@Injectable()
export class RecordStudentGradeUseCase {
  private readonly weightedStrategy = new WeightedCompetencyGradingStrategy();
  private readonly arithmeticStrategy = new ArithmeticAverageGradingStrategy();

  constructor(
    private readonly gradeRepository: AcademicGradeRepositoryPort,
  ) {}

  async execute(command: RecordStudentGradeCommand): Promise<AcademicGrade> {
    const strategy =
      command.evaluationMode === 'WEIGHTED_COMPETENCIES'
        ? this.weightedStrategy
        : this.arithmeticStrategy;

    const calculatedFinal = strategy.calculatePeriodFinalScore(
      command.competencyScores,
    );

    const validatedFinalScore = GradingScore.create(calculatedFinal, 1.0, 5.0);
    const validatedRemedialScore = command.remedialScore
      ? GradingScore.create(command.remedialScore, 1.0, 5.0)
      : GradingScore.create(1.0, 1.0, 5.0);

    return this.gradeRepository.upsertGrade({
      schoolId: command.schoolId,
      academicYear: command.academicYear,
      enrollmentId: command.enrollmentId,
      courseAssignmentId: command.courseAssignmentId,
      academicPeriodId: command.academicPeriodId,
      finalScore: validatedFinalScore.value,
      remedialScore: command.remedialScore ? validatedRemedialScore.value : 0,
      justifiedAbsences: command.justifiedAbsences ?? 0,
      unjustifiedAbsences: command.unjustifiedAbsences ?? 0,
      tardies: command.tardies ?? 0,
      preReportObservation: command.preReportObservation ?? null,
      hasPreReportAlert: validatedFinalScore.value < 3.0,
      updatedByUserId: command.updatedByUserId,
    });
  }

  async getStudentBulletin(
    schoolId: bigint,
    academicYear: number,
    enrollmentId: bigint,
    academicPeriodId: bigint,
  ): Promise<StudentBulletinGradeSummary[]> {
    return this.gradeRepository.findStudentPeriodBulletin(
      schoolId,
      academicYear,
      enrollmentId,
      academicPeriodId,
    );
  }
}
