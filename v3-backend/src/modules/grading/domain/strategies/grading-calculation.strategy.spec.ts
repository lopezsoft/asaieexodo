import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import {
  ArithmeticAverageGradingStrategy,
  GradingScore,
  WeightedCompetencyGradingStrategy,
} from './grading-calculation.strategy';

describe('GradingCalculationStrategy & GradingScore ValueObject', () => {
  it('calculates weighted score across Saber (40%), Hacer (40%) and Ser (20%)', () => {
    const strategy = new WeightedCompetencyGradingStrategy();
    const finalScore = strategy.calculatePeriodFinalScore([
      { competencyId: 1n, weightPercentage: 40, averageScore: 4.5 },
      { competencyId: 2n, weightPercentage: 40, averageScore: 4.0 },
      { competencyId: 3n, weightPercentage: 20, averageScore: 5.0 },
    ]);

    expect(finalScore).toBe(4.4);
  });

  it('calculates arithmetic average score across evaluation columns', () => {
    const strategy = new ArithmeticAverageGradingStrategy();
    const finalScore = strategy.calculatePeriodFinalScore([
      { competencyId: 1n, weightPercentage: 0, averageScore: 3.0 },
      { competencyId: 2n, weightPercentage: 0, averageScore: 4.0 },
      { competencyId: 3n, weightPercentage: 0, averageScore: 5.0 },
    ]);

    expect(finalScore).toBe(4.0);
  });

  it('throws DomainException when score is outside institutional scale [1.0 - 5.0]', () => {
    expect(() => GradingScore.create(5.5, 1.0, 5.0)).toThrow(DomainException);
    expect(() => GradingScore.create(0.5, 1.0, 5.0)).toThrow(DomainException);
  });
});
