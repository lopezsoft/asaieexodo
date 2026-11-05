import { ValueObject } from '../../../../shared/domain/value-object.base';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

interface GradingScoreProps {
  readonly numericScore: number;
  readonly minScale: number;
  readonly maxScale: number;
}

export class GradingScore extends ValueObject<GradingScoreProps> {
  static create(
    numericScore: number,
    minScale = 1.0,
    maxScale = 5.0,
  ): GradingScore {
    if (
      Number.isNaN(numericScore) ||
      numericScore < minScale ||
      numericScore > maxScale
    ) {
      throw new DomainException(
        'SCORE_OUT_OF_SCALE_RANGE',
        `La calificación (${numericScore}) debe estar dentro de la escala institucional [${minScale} - ${maxScale}].`,
      );
    }
    return new GradingScore({
      numericScore: Number(numericScore.toFixed(2)),
      minScale,
      maxScale,
    });
  }

  get value(): number {
    return this.props.numericScore;
  }
}

export interface CompetencyScoreInput {
  readonly competencyId: bigint;
  readonly weightPercentage: number;
  readonly averageScore: number;
}

export interface GradingCalculationStrategy {
  readonly strategyCode: string;
  calculatePeriodFinalScore(inputs: CompetencyScoreInput[]): number;
}

/**
 * Estrategia 1: Calculo ponderado por competencias (Saber, Hacer, Ser) segun SIEE del colegio.
 */
export class WeightedCompetencyGradingStrategy
  implements GradingCalculationStrategy
{
  readonly strategyCode = 'WEIGHTED_COMPETENCIES';

  calculatePeriodFinalScore(inputs: CompetencyScoreInput[]): number {
    if (inputs.length === 0) {
      return 0;
    }
    const weightedSum = inputs.reduce(
      (sum, item) => sum + item.averageScore * (item.weightPercentage / 100),
      0,
    );
    return Number(weightedSum.toFixed(2));
  }
}

/**
 * Estrategia 2: Promedio aritmetico simple de actividades evaluativas.
 */
export class ArithmeticAverageGradingStrategy
  implements GradingCalculationStrategy
{
  readonly strategyCode = 'ARITHMETIC_AVERAGE';

  calculatePeriodFinalScore(inputs: CompetencyScoreInput[]): number {
    if (inputs.length === 0) {
      return 0;
    }
    const total = inputs.reduce((sum, item) => sum + item.averageScore, 0);
    return Number((total / inputs.length).toFixed(2));
  }
}
