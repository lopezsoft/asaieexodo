import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ValueObject } from '../../../../shared/domain/value-object.base';

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
    decimalsCount = 2,
  ): GradingScore {
    if (
      !Number.isFinite(numericScore) ||
      numericScore < minScale ||
      numericScore > maxScale
    ) {
      throw new DomainException(
        'SCORE_OUT_OF_SCALE_RANGE',
        `La calificación (${numericScore}) debe estar dentro de la escala institucional [${minScale} - ${maxScale}].`,
      );
    }
    const safeDecimals = Math.min(Math.max(0, Math.floor(decimalsCount)), 4);
    return new GradingScore({
      numericScore: Number(numericScore.toFixed(safeDecimals)),
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
  calculatePeriodFinalScore(
    inputs: CompetencyScoreInput[],
    decimalsCount?: number,
  ): number;
}

/**
 * Estrategia 1: Calculo ponderado por competencias (Saber, Hacer, Ser) segun SIEE del colegio.
 * Valida arreglo no vacio, valores finitos, pesos positivos y suma exacta de pesos (100% +/- 0.01).
 */
export class WeightedCompetencyGradingStrategy
  implements GradingCalculationStrategy
{
  readonly strategyCode = 'WEIGHTED_COMPETENCIES';

  calculatePeriodFinalScore(
    inputs: CompetencyScoreInput[],
    decimalsCount = 2,
  ): number {
    if (!inputs || inputs.length === 0) {
      throw new DomainException(
        'EMPTY_COMPETENCY_SCORES',
        'Debe suministrar al menos una calificación de competencia para calcular la definitiva.',
      );
    }

    let totalWeight = 0;
    let weightedSum = 0;

    for (const item of inputs) {
      if (
        !Number.isFinite(item.weightPercentage) ||
        item.weightPercentage <= 0
      ) {
        throw new DomainException(
          'INVALID_COMPETENCY_WEIGHT',
          'Cada competencia evaluada debe tener un peso porcentual positivo y finito.',
        );
      }
      if (!Number.isFinite(item.averageScore)) {
        throw new DomainException(
          'INVALID_COMPETENCY_SCORE',
          'Las calificaciones de competencia deben ser valores numéricos finitos.',
        );
      }
      totalWeight += item.weightPercentage;
      weightedSum += item.averageScore * (item.weightPercentage / 100);
    }

    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new DomainException(
        'INVALID_WEIGHT_SUM',
        `La suma de pesos porcentuales de las competencias (${totalWeight.toFixed(2)}%) debe ser exactamente 100%.`,
      );
    }

    const safeDecimals = Math.min(Math.max(0, Math.floor(decimalsCount)), 4);
    return Number(weightedSum.toFixed(safeDecimals));
  }
}

/**
 * Estrategia 2: Promedio aritmetico simple de actividades evaluativas.
 */
export class ArithmeticAverageGradingStrategy
  implements GradingCalculationStrategy
{
  readonly strategyCode = 'ARITHMETIC_AVERAGE';

  calculatePeriodFinalScore(
    inputs: CompetencyScoreInput[],
    decimalsCount = 2,
  ): number {
    if (!inputs || inputs.length === 0) {
      throw new DomainException(
        'EMPTY_COMPETENCY_SCORES',
        'Debe suministrar al menos una calificación para calcular el promedio aritmético.',
      );
    }

    let total = 0;
    for (const item of inputs) {
      if (!Number.isFinite(item.averageScore)) {
        throw new DomainException(
          'INVALID_COMPETENCY_SCORE',
          'Las calificaciones deben ser valores numéricos finitos.',
        );
      }
      total += item.averageScore;
    }

    const safeDecimals = Math.min(Math.max(0, Math.floor(decimalsCount)), 4);
    return Number((total / inputs.length).toFixed(safeDecimals));
  }
}
