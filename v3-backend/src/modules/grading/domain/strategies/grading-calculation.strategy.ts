import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ValueObject } from '../../../../shared/domain/value-object.base';
import { roundHalfAwayFromZero } from '../helpers/siee-decimal.helper';

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
      numericScore: roundHalfAwayFromZero(numericScore, safeDecimals),
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
    return roundHalfAwayFromZero(weightedSum, safeDecimals);
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
    return roundHalfAwayFromZero(total / inputs.length, safeDecimals);
  }
}

export interface GradebookDimensionConfig {
  readonly dimensionId: number;
  readonly weightPercentage: number;
  readonly isGradable?: boolean;
  readonly columnNumbers: readonly number[];
  readonly columnWeights?: ReadonlyMap<number, number>;
}

/**
 * Estrategia 3: Cálculo de planilla docente de 2 niveles (SIEE Colombia):
 *  - Nivel 1 (interno a cada dimensión/competencia): pondera casillas `n1..n30`
 *    según pesos de `teacher_gradebook_columns` o `evaluation_dimension_columns`,
 *    sin descartar jamás casillas con peso 0 cuando existen casillas ponderadas.
 *  - Nivel 2 (entre dimensiones): pondera los promedios obtenidos de cada dimensión
 *    evaluada usando `evaluation_dimensions.weight_percentage`.
 */
export class TwoLevelGradebookCalculationStrategy {
  readonly strategyCode = 'TWO_LEVEL_GRADEBOOK';

  private aggregateWeightedOrSimple(
    entries: ReadonlyArray<{ score: number; weight: number }>,
  ): number {
    if (entries.length === 0) return 0;

    let positiveWeightSum = 0;
    let unweightedCount = 0;
    for (const entry of entries) {
      if (entry.weight > 0) {
        positiveWeightSum += entry.weight;
      } else {
        unweightedCount += 1;
      }
    }

    if (positiveWeightSum <= 0) {
      const total = entries.reduce((acc, item) => acc + item.score, 0);
      return total / entries.length;
    }

    // Si todas las casillas con nota tienen peso > 0, ponderación normalizada exacta
    if (unweightedCount === 0) {
      const weightedTotal = entries.reduce(
        (acc, item) => acc + item.score * item.weight,
        0,
      );
      return weightedTotal / positiveWeightSum;
    }

    // Mezcla de casillas con peso > 0 y peso 0: jamás descartar notas sin peso.
    // Si la suma de pesos positivos es menor a 100%, se distribuye el remanente equitativamente.
    if (positiveWeightSum < 100) {
      const remainderPerUnweighted = (100 - positiveWeightSum) / unweightedCount;
      let weightedTotal = 0;
      let totalWeight = 0;
      for (const item of entries) {
        const effectiveWeight =
          item.weight > 0 ? item.weight : remainderPerUnweighted;
        weightedTotal += item.score * effectiveWeight;
        totalWeight += effectiveWeight;
      }
      return totalWeight > 0 ? weightedTotal / totalWeight : 0;
    }

    // Si los pesos positivos ya superan o alcanzan 100% y hay casillas sin peso,
    // se asigna el peso promedio de las casillas ponderadas para evitar pérdida silenciosa.
    const weightedCount = entries.length - unweightedCount;
    const avgPositiveWeight =
      weightedCount > 0 ? positiveWeightSum / weightedCount : 1;
    let weightedTotal = 0;
    let totalWeight = 0;
    for (const item of entries) {
      const effectiveWeight =
        item.weight > 0 ? item.weight : avgPositiveWeight;
      weightedTotal += item.score * effectiveWeight;
      totalWeight += effectiveWeight;
    }
    return totalWeight > 0 ? weightedTotal / totalWeight : 0;
  }

  calculateFromGrid(params: {
    readonly scoresByColumn: ReadonlyMap<number, number>;
    readonly dimensions?: readonly GradebookDimensionConfig[];
    readonly fallbackColumnWeights?: ReadonlyMap<number, number>;
    readonly decimalsCount?: number;
  }): number {
    const safeDecimals = Math.min(
      Math.max(0, Math.floor(params.decimalsCount ?? 2)),
      4,
    );
    const { scoresByColumn, dimensions = [], fallbackColumnWeights } = params;

    if (scoresByColumn.size === 0) {
      return 0;
    }

    const gradableDimensions = dimensions.filter(
      (dim) => dim.isGradable !== false && dim.columnNumbers.length > 0,
    );

    if (gradableDimensions.length > 0) {
      const evaluatedDimensions: Array<{ score: number; weight: number }> = [];
      const assignedColumns = new Set<number>();

      for (const dim of gradableDimensions) {
        const dimEntries: Array<{ score: number; weight: number }> = [];
        for (const colNum of dim.columnNumbers) {
          assignedColumns.add(colNum);
          const rawScore = scoresByColumn.get(colNum);
          if (rawScore === undefined || !Number.isFinite(rawScore) || rawScore <= 0) {
            continue;
          }
          const colWeight =
            fallbackColumnWeights?.get(colNum) ??
            dim.columnWeights?.get(colNum) ??
            0;
          dimEntries.push({ score: rawScore, weight: colWeight });
        }

        if (dimEntries.length > 0) {
          evaluatedDimensions.push({
            score: this.aggregateWeightedOrSimple(dimEntries),
            weight: dim.weightPercentage > 0 ? dim.weightPercentage : 0,
          });
        }
      }

      // Si existen columnas calificadas que no pertenecen a ninguna dimensión configurada,
      // inclúyelas como una dimensión adicional sin peso explícito para no perder ninguna nota.
      const orphanEntries: Array<{ score: number; weight: number }> = [];
      for (const [colNum, rawScore] of scoresByColumn.entries()) {
        if (
          !assignedColumns.has(colNum) &&
          Number.isFinite(rawScore) &&
          rawScore > 0
        ) {
          orphanEntries.push({
            score: rawScore,
            weight: fallbackColumnWeights?.get(colNum) ?? 0,
          });
        }
      }
      if (orphanEntries.length > 0) {
        evaluatedDimensions.push({
          score: this.aggregateWeightedOrSimple(orphanEntries),
          weight: 0,
        });
      }

      if (evaluatedDimensions.length > 0) {
        const finalRaw = this.aggregateWeightedOrSimple(evaluatedDimensions);
        return roundHalfAwayFromZero(finalRaw, safeDecimals);
      }
    }

    // Fallback de un nivel cuando el colegio no ha parametrizado dimensiones en el grupo de grados
    const flatEntries: Array<{ score: number; weight: number }> = [];
    for (const [colNum, rawScore] of scoresByColumn.entries()) {
      if (!Number.isFinite(rawScore) || rawScore <= 0) continue;
      flatEntries.push({
        score: rawScore,
        weight: fallbackColumnWeights?.get(colNum) ?? 0,
      });
    }
    if (flatEntries.length === 0) {
      return 0;
    }

    return roundHalfAwayFromZero(
      this.aggregateWeightedOrSimple(flatEntries),
      safeDecimals,
    );
  }
}
