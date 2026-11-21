import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
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
  readonly periodId: bigint;
  readonly evaluationMode: 'WEIGHTED_COMPETENCIES' | 'ARITHMETIC_AVERAGE';
  readonly competencyScores: CompetencyScoreInput[];
  readonly recoveryScore?: number;
  readonly levelingScore?: number;
  readonly justifiedAbsences?: number;
  readonly unjustifiedAbsences?: number;
  readonly lateArrivals?: number;
  readonly teacherObservations?: string;
  readonly changeReason?: string;
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
    const rules = await this.gradeRepository.resolveInstitutionalGradingRules(
      command.schoolId,
      command.academicYear,
      command.enrollmentId,
    );

    const strategy =
      command.evaluationMode === 'WEIGHTED_COMPETENCIES'
        ? this.weightedStrategy
        : this.arithmeticStrategy;

    const calculatedFinal = strategy.calculatePeriodFinalScore(
      command.competencyScores,
      rules.decimalsCount,
    );

    const validatedFinalScore = GradingScore.create(
      calculatedFinal,
      rules.minScaleScore,
      rules.maxScaleScore,
      rules.decimalsCount,
    );

    let validatedRecovery: number | null = null;
    if (command.recoveryScore !== undefined && command.recoveryScore > 0) {
      const recoveryVo = GradingScore.create(
        command.recoveryScore,
        rules.minScaleScore,
        rules.maxScaleScore,
        rules.decimalsCount,
      );
      if (recoveryVo.value > rules.maxRecoveryScore) {
        throw new DomainException(
          'RECOVERY_SCORE_EXCEEDS_INSTITUTIONAL_CAP',
          `La calificación de recuperación (${recoveryVo.value}) supera el tope institucional configurado (${rules.maxRecoveryScore}).`,
        );
      }
      validatedRecovery = recoveryVo.value;
    }

    const effective =
      validatedRecovery !== null && validatedRecovery > 0
        ? validatedRecovery
        : validatedFinalScore.value;

    return this.gradeRepository.upsertGrade({
      schoolId: command.schoolId,
      academicYear: command.academicYear,
      enrollmentId: command.enrollmentId,
      courseAssignmentId: command.courseAssignmentId,
      periodId: command.periodId,
      finalScore: validatedFinalScore.value,
      recoveryScore: validatedRecovery,
      justifiedAbsences: command.justifiedAbsences ?? 0,
      unjustifiedAbsences: command.unjustifiedAbsences ?? 0,
      lateArrivals: command.lateArrivals ?? 0,
      preReportObservations: command.teacherObservations ?? null,
      hasPreReportAlert: effective < rules.minPassingScore,
      changeReason: command.changeReason ?? null,
      updatedByUserId: command.updatedByUserId,
    });
  }

  async getStudentBulletin(
    schoolId: bigint,
    academicYear: number,
    enrollmentId: bigint,
    periodId: bigint,
  ): Promise<StudentBulletinGradeSummary[]> {
    return this.gradeRepository.findStudentPeriodBulletin(
      schoolId,
      academicYear,
      enrollmentId,
      periodId,
    );
  }
}
