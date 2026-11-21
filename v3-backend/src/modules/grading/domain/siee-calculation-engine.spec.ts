import {
  PromotionEvaluationEngineService,
  SieePromotionRuleConfig,
  StudentSubjectAnnualInput,
} from '../../promotion/domain/services/promotion-evaluation-engine.service';
import {
  applyGraceRounding,
  computeEffectiveScore,
  roundHalfAwayFromZero,
} from './helpers/siee-decimal.helper';
import {
  GradebookDimensionConfig,
  TwoLevelGradebookCalculationStrategy,
} from './strategies/grading-calculation.strategy';

function buildBaseRule(
  overrides: Partial<SieePromotionRuleConfig> = {},
): SieePromotionRuleConfig {
  return {
    decimalsCount: 2,
    minPassingScore: 3.0,
    failingMaxScore: 2.99,
    maxRecoveryScore: 3.0,
    roundingThresholdScore: 0,
    roundingTargetScore: 0,
    roundsFinalScore: false,
    minAreaAverage: 0,
    failedAreasLimit: 3,
    failsAfterRecovery: true,
    failsAfterRecoveryMode: 1,
    failsAreaIfAnySubjectFails: false,
    failsYearByMandatoryArea: false,
    promotionMode: 1,
    academicYearMode: 0,
    usesWeightedAreas: true,
    ranksByAreaAverage: false,
    ...overrides,
  };
}

describe('Motor SIEE Decreto 1290 — Redondeo, Planilla 2 Niveles y Promoción Escolar', () => {
  describe('Helpers decimales SIEE (paridad PostgreSQL ROUND / MariaDB)', () => {
    it('aplica redondeo half-away-from-zero corrigiendo imprecisiones IEEE-754', () => {
      expect(roundHalfAwayFromZero(1.005, 2)).toBe(1.01);
      expect(roundHalfAwayFromZero(2.675, 2)).toBe(2.68);
      expect(roundHalfAwayFromZero(2.945, 2)).toBe(2.95);
      expect(roundHalfAwayFromZero(2.944, 2)).toBe(2.94);
      expect(roundHalfAwayFromZero(3.5, 0)).toBe(4);
      expect(roundHalfAwayFromZero(-0.004, 2)).toBe(0);
    });

    it('calcula nota efectiva usando GREATEST sin penalizar notas superiores a la recuperación', () => {
      expect(computeEffectiveScore(2.4, 3.0)).toBe(3.0);
      expect(computeEffectiveScore(3.8, 3.0)).toBe(3.8);
      expect(computeEffectiveScore(2.7, null)).toBe(2.7);
      expect(computeEffectiveScore(2.7, 0)).toBe(2.7);
    });

    it('aplica redondeo de gracia únicamente en la franja [threshold, target) dentro de zona reprobatoria', () => {
      expect(applyGraceRounding(2.96, 2.99, 2.95, 3.0, true)).toBe(3.0);
      expect(applyGraceRounding(2.95, 2.99, 2.95, 3.0, true)).toBe(3.0);
      expect(applyGraceRounding(2.94, 2.99, 2.95, 3.0, true)).toBe(2.94);
      expect(applyGraceRounding(2.96, 2.99, 2.95, 3.0, false)).toBe(2.96);
      expect(applyGraceRounding(3.2, 2.99, 2.95, 3.0, true)).toBe(3.2);
    });
  });

  describe('TwoLevelGradebookCalculationStrategy (planilla n1..n30 con dimensiones)', () => {
    const strategy = new TwoLevelGradebookCalculationStrategy();

    const dimensions: GradebookDimensionConfig[] = [
      {
        dimensionId: 1,
        weightPercentage: 40, // Saber
        columnNumbers: [1, 2],
        columnWeights: new Map([
          [1, 60],
          [2, 40],
        ]),
      },
      {
        dimensionId: 2,
        weightPercentage: 40, // Hacer
        columnNumbers: [3, 4],
        columnWeights: new Map(), // Promedio simple dentro de Hacer
      },
      {
        dimensionId: 3,
        weightPercentage: 20, // Ser
        columnNumbers: [5],
        columnWeights: new Map([[5, 100]]),
      },
    ];

    it('calcula ponderación exacta en 2 niveles (columnas -> dimensiones -> definitiva)', () => {
      // Saber = 4.0*0.6 + 5.0*0.4 = 4.40 (peso 40% -> 1.76)
      // Hacer = (3.0 + 4.0)/2 = 3.50 (peso 40% -> 1.40)
      // Ser   = 5.00 (peso 20% -> 1.00)
      // Total = 4.16
      const result = strategy.calculateFromGrid({
        scoresByColumn: new Map([
          [1, 4.0],
          [2, 5.0],
          [3, 3.0],
          [4, 4.0],
          [5, 5.0],
        ]),
        dimensions,
        decimalsCount: 2,
      });
      expect(result).toBe(4.16);
    });

    it('nunca descarta casillas con peso 0 cuando coexisten con casillas ponderadas', () => {
      // Col 1 tiene peso 60% con 2.0, Col 2 tiene peso 0% con 5.0 -> Col 2 hereda remanente 40%
      // Esperado: 2.0*0.6 + 5.0*0.4 = 3.20 (antes el bug silencioso devolvía 2.00)
      const result = strategy.calculateFromGrid({
        scoresByColumn: new Map([
          [1, 2.0],
          [2, 5.0],
        ]),
        fallbackColumnWeights: new Map([[1, 60]]),
        decimalsCount: 2,
      });
      expect(result).toBe(3.2);
    });

    it('normaliza el promedio en curso cuando solo se han calificado algunas dimensiones', () => {
      // Solo Saber (40%, nota 4.0) y Hacer (40%, nota 3.0) evaluados -> promedio ponderado normalizado = 3.50
      const result = strategy.calculateFromGrid({
        scoresByColumn: new Map([
          [1, 4.0],
          [3, 3.0],
        ]),
        dimensions,
        decimalsCount: 2,
      });
      expect(result).toBe(3.5);
    });
  });

  describe('PromotionEvaluationEngineService (Decreto 1290)', () => {
    const engine = new PromotionEvaluationEngineService();

    it('cuenta TODAS las áreas reprobadas aunque academic_areas.fails_school_year sea FALSE', () => {
      const subjects: StudentSubjectAnnualInput[] = [
        {
          subjectId: 1,
          subjectName: 'Matemáticas',
          academicAreaId: 10,
          academicAreaName: 'Matemáticas',
          areaWeightPercentage: 100,
          areaFailsSchoolYear: false,
          isExcludedFromAverage: false,
          isElective: false,
          preCalculatedAnnualScore: 2.2,
          finalRecoveryScore: null,
          totalAbsences: 2,
        },
        {
          subjectId: 2,
          subjectName: 'Español',
          academicAreaId: 20,
          academicAreaName: 'Humanidades',
          areaWeightPercentage: 100,
          areaFailsSchoolYear: false,
          isExcludedFromAverage: false,
          isElective: false,
          preCalculatedAnnualScore: 2.4,
          finalRecoveryScore: null,
          totalAbsences: 1,
        },
        {
          subjectId: 3,
          subjectName: 'Biología',
          academicAreaId: 30,
          academicAreaName: 'Ciencias Naturales',
          areaWeightPercentage: 100,
          areaFailsSchoolYear: false,
          isExcludedFromAverage: false,
          isElective: false,
          preCalculatedAnnualScore: 2.1,
          finalRecoveryScore: null,
          totalAbsences: 0,
        },
      ];

      const result = engine.evaluateStudent({
        rule: buildBaseRule({ failedAreasLimit: 3 }),
        subjects,
        gradeName: 'Sexto',
        nextGradeCode: '07',
        nextGradeName: 'Séptimo',
      });

      expect(result.failedAreasCount).toBe(3);
      expect(result.promotionStatusId).toBe(3); // NO FUE PROMOVIDO
      expect(result.isEligibleForFinalRecovery).toBe(false);
    });

    it('aplica ponderación de asignaturas en área compuesta y regla fail_subject_of_the_area', () => {
      // Ciencias Naturales: Física (60%, 4.8) + Química (40%, 2.5)
      // Ponderado bruto = 4.8*0.6 + 2.5*0.4 = 2.88 + 1.00 = 3.88 (aprueba sin regla)
      // Con `failsAreaIfAnySubjectFails = true`: al perder Química (2.5 <= 2.99), el área queda capada en 2.99 (REPROBADA)
      const subjects: StudentSubjectAnnualInput[] = [
        {
          subjectId: 1,
          subjectName: 'Física',
          academicAreaId: 30,
          academicAreaName: 'Ciencias Naturales',
          areaWeightPercentage: 60,
          areaFailsSchoolYear: false,
          isExcludedFromAverage: false,
          isElective: false,
          preCalculatedAnnualScore: 4.8,
          finalRecoveryScore: null,
          totalAbsences: 0,
        },
        {
          subjectId: 2,
          subjectName: 'Química',
          academicAreaId: 30,
          academicAreaName: 'Ciencias Naturales',
          areaWeightPercentage: 40,
          areaFailsSchoolYear: false,
          isExcludedFromAverage: false,
          isElective: false,
          preCalculatedAnnualScore: 2.5,
          finalRecoveryScore: null,
          totalAbsences: 0,
        },
      ];

      const withoutRule = engine.evaluateStudent({
        rule: buildBaseRule({
          usesWeightedAreas: true,
          failsAreaIfAnySubjectFails: false,
        }),
        subjects,
        gradeName: 'Décimo',
        nextGradeCode: '11',
      });
      expect(withoutRule.areas[0].preRecoveryScore).toBe(3.88);
      expect(withoutRule.failedAreasCount).toBe(0);
      expect(withoutRule.promotionStatusId).toBe(1);

      const withRule = engine.evaluateStudent({
        rule: buildBaseRule({
          usesWeightedAreas: true,
          failsAreaIfAnySubjectFails: true,
        }),
        subjects,
        gradeName: 'Décimo',
        nextGradeCode: '11',
      });
      expect(withRule.areas[0].preRecoveryScore).toBe(2.99);
      expect(withRule.failedAreasCount).toBe(1);
      expect(withRule.isEligibleForFinalRecovery).toBe(true);
      expect(withRule.promotionStatusId).toBe(2); // PENDIENTE / PROMOVIDO CON DIFICULTAD
    });

    it('respeta promotionMode=3 (último periodo), divisor de periodos configurados y redondeo de gracia anual', () => {
      const subject: StudentSubjectAnnualInput = {
        subjectId: 1,
        subjectName: 'Matemáticas',
        academicAreaId: 10,
        academicAreaName: 'Matemáticas',
        areaWeightPercentage: 100,
        areaFailsSchoolYear: false,
        isExcludedFromAverage: false,
        isElective: false,
        periodScores: [
          { periodNumber: 1, effectiveScore: 3.9 },
          { periodNumber: 2, effectiveScore: 3.9 },
          { periodNumber: 3, effectiveScore: 4.05 },
        ],
        configuredPeriodsCount: 4, // (3.9+3.9+4.05)/4 = 2.9625 -> 2.96 -> redondeo gracia 3.00
        finalRecoveryScore: null,
        totalAbsences: 0,
      };

      const avgWithGrace = engine.evaluateStudent({
        rule: buildBaseRule({
          promotionMode: 1,
          roundsFinalScore: true,
          roundingThresholdScore: 2.95,
          roundingTargetScore: 3.0,
        }),
        subjects: [subject],
        gradeName: 'Octavo',
        nextGradeCode: '09',
      });
      expect(avgWithGrace.areas[0].subjects[0].annualScore).toBe(3.0);
      expect(avgWithGrace.promotionStatusId).toBe(1);

      const lastPeriodMode = engine.evaluateStudent({
        rule: buildBaseRule({ promotionMode: 3 }),
        subjects: [subject],
        gradeName: 'Octavo',
        nextGradeCode: '09',
      });
      expect(lastPeriodMode.areas[0].subjects[0].annualScore).toBe(4.05);
    });

    it('evalúa los 3 modos de failsAfterRecoveryMode (1, 2, 3) y obligatoriedad por área (pierde_area)', () => {
      // Estudiante reprobó 2 áreas (Matemáticas obligatoria + Inglés), recuperó Inglés (3.2) pero sigue perdiendo Matemáticas (2.6)
      const subjects: StudentSubjectAnnualInput[] = [
        {
          subjectId: 1,
          subjectName: 'Matemáticas',
          academicAreaId: 10,
          academicAreaName: 'Matemáticas',
          areaWeightPercentage: 100,
          areaFailsSchoolYear: true,
          isExcludedFromAverage: false,
          isElective: false,
          preCalculatedAnnualScore: 2.2,
          finalRecoveryScore: 2.6, // No alcanzó a superar
          totalAbsences: 0,
        },
        {
          subjectId: 2,
          subjectName: 'Inglés',
          academicAreaId: 20,
          academicAreaName: 'Idioma Extranjero',
          areaWeightPercentage: 100,
          areaFailsSchoolYear: false,
          isExcludedFromAverage: false,
          isElective: false,
          preCalculatedAnnualScore: 2.5,
          finalRecoveryScore: 3.2, // Superó habilitación final
          totalAbsences: 0,
        },
      ];

      // Modo 1 (reprueba si queda con >= 1 área perdida tras recuperación): NO PROMOVIDO (3)
      const mode1 = engine.evaluateStudent({
        rule: buildBaseRule({ failsAfterRecoveryMode: 1 }),
        subjects,
        gradeName: 'Noveno',
        nextGradeCode: '10',
      });
      expect(mode1.failedAreasCount).toBe(1);
      expect(mode1.promotionStatusId).toBe(3);

      // Modo 2 (reprueba solo si queda con >= 2 áreas perdidas tras recuperación) sin área obligatoria: PROMOVIDO (1)
      const mode2 = engine.evaluateStudent({
        rule: buildBaseRule({
          failsAfterRecoveryMode: 2,
          failsYearByMandatoryArea: false,
        }),
        subjects,
        gradeName: 'Noveno',
        nextGradeCode: '10',
      });
      expect(mode2.promotionStatusId).toBe(1);

      // Modo 2 CON `failsYearByMandatoryArea = true`: Matemáticas es obligatoria y sigue perdida -> NO PROMOVIDO (3)
      const mode2Mandatory = engine.evaluateStudent({
        rule: buildBaseRule({
          failsAfterRecoveryMode: 2,
          failsYearByMandatoryArea: true,
        }),
        subjects,
        gradeName: 'Noveno',
        nextGradeCode: '10',
      });
      expect(mode2Mandatory.promotionStatusId).toBe(3);

      // Modo 3 (debe recuperar la totalidad): queda 1 perdida -> NO PROMOVIDO (3)
      const mode3 = engine.evaluateStudent({
        rule: buildBaseRule({ failsAfterRecoveryMode: 3 }),
        subjects,
        gradeName: 'Noveno',
        nextGradeCode: '10',
      });
      expect(mode3.promotionStatusId).toBe(3);
    });

    it('soporta modalidad Ciclos (academicYearMode=1) y graduación de Ciclo VI (11°)', () => {
      const subjects: StudentSubjectAnnualInput[] = [
        {
          subjectId: 1,
          subjectName: 'Matemáticas',
          academicAreaId: 10,
          academicAreaName: 'Matemáticas',
          areaWeightPercentage: 100,
          areaFailsSchoolYear: false,
          isExcludedFromAverage: false,
          isElective: false,
          preCalculatedAnnualScore: 4.2,
          finalRecoveryScore: null,
          totalAbsences: 0,
        },
      ];

      const graduatedCycle = engine.evaluateStudent({
        rule: buildBaseRule({ academicYearMode: 1 }),
        subjects,
        gradeName: 'Ciclo VI',
        nextGradeCode: null,
        isCycleEnd: true,
      });

      expect(graduatedCycle.promotionStatusId).toBe(10); // FUE GRADUADO(A) EN EL CICLO VI
      expect(graduatedCycle.isGraduated).toBe(true);
    });
  });
});
