import { Injectable } from '@nestjs/common';
import {
  applyGraceRounding,
  computeEffectiveScore,
  roundHalfAwayFromZero,
} from '../../../grading/domain/helpers/siee-decimal.helper';

export interface SieePromotionRuleConfig {
  readonly decimalsCount: number;
  readonly minPassingScore: number;
  readonly failingMaxScore: number;
  readonly maxRecoveryScore: number;
  readonly roundingThresholdScore: number;
  readonly roundingTargetScore: number;
  readonly roundsFinalScore: boolean;
  readonly minAreaAverage: number;
  readonly failedAreasLimit: number;
  readonly failsAfterRecovery: boolean;
  readonly failsAfterRecoveryMode: number; // 0, 1, 2, 3
  readonly failsAreaIfAnySubjectFails: boolean;
  readonly failsYearByMandatoryArea: boolean;
  readonly promotionMode: number; // 1,2=promedio configurado; 3,4=último periodo
  readonly academicYearMode: number; // 0=anual estándar, 1=ciclos
  readonly usesWeightedAreas: boolean;
  readonly ranksByAreaAverage: boolean;
}

export interface StudentSubjectAnnualInput {
  readonly subjectId: number;
  readonly subjectName: string;
  readonly academicAreaId: number;
  readonly academicAreaName: string;
  readonly courseAssignmentId?: number;
  readonly areaWeightPercentage: number;
  readonly areaFailsSchoolYear: boolean;
  readonly isExcludedFromAverage: boolean;
  readonly isElective: boolean;
  readonly periodScores?: ReadonlyArray<{
    readonly periodNumber: number;
    readonly effectiveScore: number;
  }>;
  readonly preCalculatedAnnualScore?: number;
  readonly configuredPeriodsCount?: number;
  readonly finalRecoveryScore: number | null;
  readonly totalAbsences: number;
}

export interface EvaluatedSubjectResult {
  readonly subjectId: number;
  readonly subjectName: string;
  readonly academicAreaId: number;
  readonly academicAreaName: string;
  readonly courseAssignmentId?: number;
  readonly annualScore: number;
  readonly finalRecoveryScore: number | null;
  readonly finalEffectiveScore: number;
  readonly isFailedPreRecovery: boolean;
  readonly isFailedPostRecovery: boolean;
}

export interface EvaluatedAreaResult {
  readonly academicAreaId: number;
  readonly academicAreaName: string;
  readonly areaFailsSchoolYear: boolean;
  readonly preRecoveryScore: number;
  readonly postRecoveryScore: number;
  readonly isFailedPreRecovery: boolean;
  readonly isFailedPostRecovery: boolean;
  readonly subjects: EvaluatedSubjectResult[];
}

export interface PromotionEvaluationOutput {
  readonly finalAverage: number;
  readonly recoveryAverage: number;
  readonly passedAreasCount: number;
  readonly failedAreasPreRecoveryCount: number;
  readonly failedAreasCount: number;
  readonly failedSubjectsCount: number;
  readonly totalAbsences: number;
  readonly isEligibleForFinalRecovery: boolean;
  readonly hasFinalRecoveryAttempts: boolean;
  readonly promotionStatusId: number;
  readonly isGraduated: boolean;
  readonly areas: EvaluatedAreaResult[];
  readonly promotionMessages: {
    readonly statusText: string;
    readonly summaryMessage: string;
    readonly recoveryMessage: string | null;
    readonly failedAreaNames: string[];
    readonly recoveredAreaNames: string[];
  };
}

/**
 * Motor puro de evaluación y promoción escolar bajo Decreto 1290 (SIEE Colombia).
 * Garantiza paridad 1:1 con `sp_promocion_estudiantes`, `fn_GetEstadoFinalEst`
 * y `config001` (`pierde_luego_rec`, `fail_subject_of_the_area`, `pierde_area`,
 * `nota_redondeo`, `promocion`, `uses_weighted_areas`).
 */
@Injectable()
export class PromotionEvaluationEngineService {
  evaluateStudent(params: {
    readonly rule: SieePromotionRuleConfig;
    readonly subjects: readonly StudentSubjectAnnualInput[];
    readonly gradeName: string;
    readonly nextGradeCode: string | null;
    readonly nextGradeName?: string | null;
    readonly isCycleEnd?: boolean;
  }): PromotionEvaluationOutput {
    const { rule, subjects, gradeName, nextGradeCode, nextGradeName, isCycleEnd } =
      params;
    const decimals = Math.min(Math.max(0, Math.floor(rule.decimalsCount)), 4);
    const failingMax = Number.isFinite(rule.failingMaxScore)
      ? rule.failingMaxScore
      : roundHalfAwayFromZero(rule.minPassingScore - 0.01, decimals);

    const gradableSubjects = subjects.filter((s) => !s.isExcludedFromAverage);

    const evaluatedSubjects: EvaluatedSubjectResult[] = [];
    let totalAbsences = 0;
    let hasFinalRecoveryAttempts = false;

    for (const subj of gradableSubjects) {
      totalAbsences += Math.max(0, Math.floor(subj.totalAbsences || 0));

      let annualScore: number;
      if (
        subj.preCalculatedAnnualScore !== undefined &&
        Number.isFinite(subj.preCalculatedAnnualScore)
      ) {
        annualScore = roundHalfAwayFromZero(
          subj.preCalculatedAnnualScore,
          decimals,
        );
      } else {
        const scores = subj.periodScores ?? [];
        let rawAnnual = 0;
        if (scores.length > 0) {
          if (rule.promotionMode === 3 || rule.promotionMode === 4) {
            const latest = [...scores].sort(
              (a, b) => b.periodNumber - a.periodNumber,
            )[0];
            rawAnnual = roundHalfAwayFromZero(latest.effectiveScore, decimals);
          } else {
            const divisor = Math.max(
              1,
              subj.configuredPeriodsCount ?? scores.length,
            );
            const sum = scores.reduce((acc, p) => acc + p.effectiveScore, 0);
            rawAnnual = roundHalfAwayFromZero(sum / divisor, decimals);
          }
        }
        annualScore = applyGraceRounding(
          rawAnnual,
          failingMax,
          rule.roundingThresholdScore,
          rule.roundingTargetScore,
          rule.roundsFinalScore,
        );
      }

      const recScore =
        subj.finalRecoveryScore !== null &&
        subj.finalRecoveryScore !== undefined &&
        Number.isFinite(subj.finalRecoveryScore) &&
        subj.finalRecoveryScore > 0
          ? roundHalfAwayFromZero(subj.finalRecoveryScore, decimals)
          : null;

      if (recScore !== null) {
        hasFinalRecoveryAttempts = true;
      }

      const finalEffectiveScore = computeEffectiveScore(annualScore, recScore);

      evaluatedSubjects.push({
        subjectId: subj.subjectId,
        subjectName: subj.subjectName,
        academicAreaId: subj.academicAreaId,
        academicAreaName: subj.academicAreaName,
        courseAssignmentId: subj.courseAssignmentId,
        annualScore,
        finalRecoveryScore: recScore,
        finalEffectiveScore,
        isFailedPreRecovery: annualScore <= failingMax,
        isFailedPostRecovery: finalEffectiveScore <= failingMax,
      });
    }

    // Agrupar asignaturas por área académica respetando pesos y regla `failsAreaIfAnySubjectFails`
    const areaBuckets = new Map<
      number,
      {
        areaName: string;
        failsSchoolYear: boolean;
        items: Array<{
          evalSubj: EvaluatedSubjectResult;
          weight: number;
        }>;
      }
    >();

    for (let i = 0; i < gradableSubjects.length; i += 1) {
      const inputSubj = gradableSubjects[i];
      const evalSubj = evaluatedSubjects[i];
      const bucket = areaBuckets.get(inputSubj.academicAreaId) ?? {
        areaName: inputSubj.academicAreaName,
        failsSchoolYear: inputSubj.areaFailsSchoolYear,
        items: [],
      };
      bucket.failsSchoolYear =
        bucket.failsSchoolYear || inputSubj.areaFailsSchoolYear;
      bucket.items.push({
        evalSubj,
        weight: inputSubj.areaWeightPercentage,
      });
      areaBuckets.set(inputSubj.academicAreaId, bucket);
    }

    const areas: EvaluatedAreaResult[] = [];
    let failedAreasPreRecoveryCount = 0;
    let failedAreasPostRecoveryCount = 0;
    let passedAreasCount = 0;
    let hasFailedMandatoryAreaPost = false;
    const failedAreaNames: string[] = [];
    const recoveredAreaNames: string[] = [];

    for (const [areaId, bucket] of areaBuckets.entries()) {
      const hasPartialWeights =
        rule.usesWeightedAreas &&
        bucket.items.some((it) => it.weight > 0 && it.weight < 100);

      const computeAreaRaw = (selector: (s: EvaluatedSubjectResult) => number) => {
        if (bucket.items.length === 0) return 0;
        if (hasPartialWeights) {
          const sum = bucket.items.reduce(
            (acc, it) => acc + selector(it.evalSubj) * (it.weight / 100),
            0,
          );
          return roundHalfAwayFromZero(sum, decimals);
        }
        const sum = bucket.items.reduce(
          (acc, it) => acc + selector(it.evalSubj),
          0,
        );
        return roundHalfAwayFromZero(sum / bucket.items.length, decimals);
      };

      let preScore = computeAreaRaw((s) => s.annualScore);
      let postScore = computeAreaRaw((s) => s.finalEffectiveScore);

      const preSubjFailed = bucket.items.some(
        (it) => it.evalSubj.isFailedPreRecovery,
      );
      const postSubjFailed = bucket.items.some(
        (it) => it.evalSubj.isFailedPostRecovery,
      );

      if (rule.failsAreaIfAnySubjectFails && bucket.items.length > 1) {
        if (preSubjFailed && preScore > failingMax) {
          preScore = failingMax;
        }
        if (postSubjFailed && postScore > failingMax) {
          postScore = failingMax;
        }
      }

      const isFailedPre = preScore <= failingMax;
      const isFailedPost = postScore <= failingMax;

      if (isFailedPre) {
        failedAreasPreRecoveryCount += 1;
      }
      if (isFailedPost) {
        failedAreasPostRecoveryCount += 1;
        failedAreaNames.push(bucket.areaName);
        if (rule.failsYearByMandatoryArea && bucket.failsSchoolYear) {
          hasFailedMandatoryAreaPost = true;
        }
      } else {
        passedAreasCount += 1;
        if (isFailedPre) {
          recoveredAreaNames.push(bucket.areaName);
        }
      }

      areas.push({
        academicAreaId: areaId,
        academicAreaName: bucket.areaName,
        areaFailsSchoolYear: bucket.failsSchoolYear,
        preRecoveryScore: preScore,
        postRecoveryScore: postScore,
        isFailedPreRecovery: isFailedPre,
        isFailedPostRecovery: isFailedPost,
        subjects: bucket.items.map((it) => it.evalSubj),
      });
    }

    const failedSubjectsCount = evaluatedSubjects.filter(
      (s) => s.isFailedPostRecovery,
    ).length;

    // Promedio final anual (por áreas si `ranksByAreaAverage`, o por asignaturas)
    const finalAverage = rule.ranksByAreaAverage
      ? areas.length > 0
        ? roundHalfAwayFromZero(
            areas.reduce((acc, a) => acc + a.preRecoveryScore, 0) / areas.length,
            decimals,
          )
        : 0
      : evaluatedSubjects.length > 0
        ? roundHalfAwayFromZero(
            evaluatedSubjects.reduce((acc, s) => acc + s.annualScore, 0) /
              evaluatedSubjects.length,
            decimals,
          )
        : 0;

    const recoveryAverage = hasFinalRecoveryAttempts
      ? rule.ranksByAreaAverage
        ? areas.length > 0
          ? roundHalfAwayFromZero(
              areas.reduce((acc, a) => acc + a.postRecoveryScore, 0) /
                areas.length,
              decimals,
            )
          : 0
        : evaluatedSubjects.length > 0
          ? roundHalfAwayFromZero(
              evaluatedSubjects.reduce(
                (acc, s) => acc + s.finalEffectiveScore,
                0,
              ) / evaluatedSubjects.length,
              decimals,
            )
          : 0
      : 0;

    const isLastGrade = Boolean(isCycleEnd) || !nextGradeCode;
    const isCycleMode = rule.academicYearMode === 1;

    const resolveStatusId = (
      outcome: 'PROMOTED' | 'PENDING' | 'FAILED',
    ): number => {
      if (isCycleMode) {
        if (isLastGrade) {
          return outcome === 'PROMOTED' ? 10 : outcome === 'PENDING' ? 11 : 12;
        }
        return outcome === 'PROMOTED' ? 7 : outcome === 'PENDING' ? 8 : 9;
      }
      if (isLastGrade) {
        return outcome === 'PROMOTED' ? 4 : outcome === 'PENDING' ? 5 : 6;
      }
      return outcome === 'PROMOTED' ? 1 : outcome === 'PENDING' ? 2 : 3;
    };

    const effectiveFailedAreasLimit = Math.max(1, rule.failedAreasLimit);
    const isEligibleForFinalRecovery =
      failedAreasPreRecoveryCount > 0 &&
      failedAreasPreRecoveryCount < effectiveFailedAreasLimit;

    let outcome: 'PROMOTED' | 'PENDING' | 'FAILED';

    if (failedAreasPreRecoveryCount === 0) {
      if (rule.minAreaAverage > 0 && finalAverage < rule.minAreaAverage) {
        outcome = 'FAILED';
      } else {
        outcome = 'PROMOTED';
      }
    } else if (failedAreasPreRecoveryCount >= effectiveFailedAreasLimit) {
      outcome = 'FAILED';
    } else if (!hasFinalRecoveryAttempts) {
      // Estudiante en zona de recuperación final (`0 < reprobadas < limite`), aún sin nota registrada
      outcome = 'PENDING';
    } else {
      // Ya cuenta con notas de recuperación final: evaluar `fails_after_recovery_mode` (0/1/2/3)
      if (hasFailedMandatoryAreaPost) {
        outcome = 'FAILED';
      } else if (failedAreasPostRecoveryCount === 0) {
        outcome = 'PROMOTED';
      } else if (!rule.failsAfterRecovery || rule.failsAfterRecoveryMode === 0) {
        outcome = 'PROMOTED';
      } else if (rule.failsAfterRecoveryMode === 2) {
        outcome = failedAreasPostRecoveryCount >= 2 ? 'FAILED' : 'PROMOTED';
      } else {
        // Modo 1 (reprobó 1+ tras recuperación) y Modo 3 (no superó la totalidad de habilitadas)
        outcome = failedAreasPostRecoveryCount >= 1 ? 'FAILED' : 'PROMOTED';
      }
    }

    const promotionStatusId = resolveStatusId(outcome);
    const isGraduated = outcome === 'PROMOTED' && isLastGrade;

    const targetLabel = nextGradeName
      ? ` ${nextGradeName}`
      : nextGradeCode
        ? ` ${nextGradeCode}`
        : '';

    const statusText =
      outcome === 'PROMOTED'
        ? isLastGrade
          ? isCycleMode
            ? 'FUE GRADUADO(A) EN EL CICLO VI (11º)'
            : 'FUE GRADUADO(A)'
          : isCycleMode
            ? `FUE PROMOVIDO(A) AL CICLO${targetLabel}`
            : `FUE PROMOVIDO(A) AL GRADO${targetLabel}`
        : outcome === 'PENDING'
          ? isLastGrade
            ? 'DEBE SUPERAR LAS DEBILIDADES PENDIENTES, QUEDA PENDIENTE EN LA GRADUACIÓN'
            : `PENDIENTE DE NIVELACIÓN FINAL EN EL GRADO ${gradeName}`
          : isLastGrade
            ? 'NO FUE GRADUADO(A)'
            : `NO FUE PROMOVIDO(A) DEL GRADO ${gradeName}`;

    const summaryMessage = `Promedio anual ${finalAverage.toFixed(decimals)} | Áreas aprobadas: ${passedAreasCount} | Áreas reprobadas: ${failedAreasPostRecoveryCount}.`;
    const recoveryMessage =
      recoveredAreaNames.length > 0
        ? `Superó mediante nivelación final: ${recoveredAreaNames.join(', ')}.`
        : failedAreaNames.length > 0 && isEligibleForFinalRecovery
          ? `Áreas pendientes de nivelación final: ${failedAreaNames.join(', ')}.`
          : null;

    return {
      finalAverage,
      recoveryAverage,
      passedAreasCount,
      failedAreasPreRecoveryCount,
      failedAreasCount: failedAreasPostRecoveryCount,
      failedSubjectsCount,
      totalAbsences,
      isEligibleForFinalRecovery,
      hasFinalRecoveryAttempts,
      promotionStatusId,
      isGraduated,
      areas,
      promotionMessages: {
        statusText,
        summaryMessage,
        recoveryMessage,
        failedAreaNames,
        recoveredAreaNames,
      },
    };
  }
}
