import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import {
  ArithmeticAverageGradingStrategy,
  GradingScore,
  WeightedCompetencyGradingStrategy,
} from './grading-calculation.strategy';

describe('GradingCalculationStrategy & GradingScore ValueObject', () => {
  it('computes weighted score accurately when competency weights sum 100%', () => {
    const strategy = new WeightedCompetencyGradingStrategy();
    const result = strategy.calculatePeriodFinalScore([
      { competencyId: 1n, weightPercentage: 40, averageScore: 4.5 },
      { competencyId: 2n, weightPercentage: 40, averageScore: 3.8 },
      { competencyId: 3n, weightPercentage: 20, averageScore: 5.0 },
    ]);

    expect(result).toBe(4.32);
  });

  it('rejects empty competency score arrays and weights not summing to 100%', () => {
    const strategy = new WeightedCompetencyGradingStrategy();

    expect(() => strategy.calculatePeriodFinalScore([])).toThrow(
      DomainException,
    );
    expect(() =>
      strategy.calculatePeriodFinalScore([
        { competencyId: 1n, weightPercentage: 50, averageScore: 4.0 },
        { competencyId: 2n, weightPercentage: 30, averageScore: 4.0 },
      ]),
    ).toThrow(DomainException);
    expect(() =>
      strategy.calculatePeriodFinalScore([
        { competencyId: 1n, weightPercentage: -10, averageScore: 4.0 },
        { competencyId: 2n, weightPercentage: 110, averageScore: 4.0 },
      ]),
    ).toThrow(DomainException);
  });

  it('computes arithmetic average accurately and rejects empty/non-finite scores', () => {
    const strategy = new ArithmeticAverageGradingStrategy();
    const result = strategy.calculatePeriodFinalScore([
      { competencyId: 1n, weightPercentage: 0, averageScore: 3.0 },
      { competencyId: 2n, weightPercentage: 0, averageScore: 4.0 },
      { competencyId: 3n, weightPercentage: 0, averageScore: 5.0 },
    ]);

    expect(result).toBe(4.0);
    expect(() => strategy.calculatePeriodFinalScore([])).toThrow(
      DomainException,
    );
    expect(() =>
      strategy.calculatePeriodFinalScore([
        { competencyId: 1n, weightPercentage: 0, averageScore: Number.NaN },
      ]),
    ).toThrow(DomainException);
  });

  it('enforces institutional grading scale boundaries and configurable decimals', () => {
    expect(() => GradingScore.create(0.5, 1.0, 5.0)).toThrow(DomainException);
    expect(() => GradingScore.create(5.5, 1.0, 5.0)).toThrow(DomainException);
    expect(() => GradingScore.create(Number.POSITIVE_INFINITY, 1.0, 5.0)).toThrow(
      DomainException,
    );
    expect(GradingScore.create(4.256, 1.0, 5.0, 2).value).toBe(4.26);
    expect(GradingScore.create(4.256, 1.0, 5.0, 1).value).toBe(4.3);
  });
});
