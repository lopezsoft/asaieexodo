/**
 * Helpers matemáticos puros del motor SIEE (Decreto 1290 de Colombia).
 * Garantizan paridad exacta de redondeo HALF_UP (half-away-from-zero) entre
 * TypeScript y PostgreSQL `ROUND(numeric, n)` / MariaDB `ROUND(decimal, n)`.
 */

/**
 * Redondeo decimal HALF-AWAY-FROM-ZERO con compensación de error IEEE-754.
 * Ejemplos: (2.945, 2) -> 2.95, (1.005, 2) -> 1.01, (2.675, 2) -> 2.68.
 */
export function roundHalfAwayFromZero(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const safeDecimals = Math.min(Math.max(0, Math.floor(decimals)), 4);
  const factor = 10 ** safeDecimals;
  const sign = value < 0 ? -1 : 1;
  const scaled = Math.abs(value) * factor + 1e-11;
  const rounded = (sign * Math.floor(scaled + 0.5)) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * Calcula la calificación efectiva de periodo o final aplicando regla SIEE:
 * la recuperación jamás puede disminuir una nota ya superior (`GREATEST`).
 */
export function computeEffectiveScore(
  finalScore: number,
  recoveryScore?: number | null,
): number {
  const safeFinal = Number.isFinite(finalScore) ? finalScore : 0;
  const safeRecovery =
    recoveryScore !== null &&
    recoveryScore !== undefined &&
    Number.isFinite(recoveryScore) &&
    recoveryScore > 0
      ? recoveryScore
      : 0;
  return Math.max(safeFinal, safeRecovery);
}

/**
 * Aplica el redondeo de gracia institucional (config001: nota_redondeo -> nota_final_redondeo)
 * cuando la nota se encuentra en zona reprobatoria pero dentro del umbral de aproximación.
 * Paridad 1:1 con `fn_siee_apply_grace_rounding` en PostgreSQL 17.
 */
export function applyGraceRounding(
  score: number,
  failingMaxScore: number,
  thresholdScore: number,
  targetScore: number,
  enabled: boolean,
): number {
  if (
    enabled &&
    Number.isFinite(score) &&
    thresholdScore > 0 &&
    targetScore > 0 &&
    score <= failingMaxScore &&
    score >= thresholdScore &&
    score < targetScore
  ) {
    return targetScore;
  }
  return score;
}
