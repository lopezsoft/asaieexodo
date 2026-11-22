import { CommunityRole } from '../../../iam/domain/enums/community-role.enum';

const INVALID_PLACEHOLDERS = new Set(['null', 'none', 'n/a', 'na', 'undefined']);

export function cleanStr(
  value: string | null | undefined,
  fallback = '',
  maxLen?: number,
): string {
  const trimmed = (value ?? '').replace(/\0/g, '').trim();
  const out =
    trimmed.length === 0 || INVALID_PLACEHOLDERS.has(trimmed.toLowerCase())
      ? fallback
      : trimmed;
  return maxLen && out.length > maxLen ? out.slice(0, maxLen) : out;
}

export function cleanNullableStr(
  value: string | null | undefined,
  maxLen?: number,
): string | null {
  const trimmed = (value ?? '').replace(/\0/g, '').trim();
  if (
    trimmed.length === 0 ||
    INVALID_PLACEHOLDERS.has(trimmed.toLowerCase())
  ) {
    return null;
  }
  return maxLen && trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

export function cleanPhone(
  value: string | null | undefined,
  maxLen = 40,
): string | null {
  const cleaned = cleanNullableStr(value, maxLen);
  if (!cleaned || cleaned === '0' || cleaned === '9' || cleaned === '-') {
    return null;
  }
  return cleaned;
}

export function cleanEmail(
  value: string | null | undefined,
  maxLen = 180,
): string | null {
  const cleaned = cleanNullableStr(value, maxLen);
  if (!cleaned || !cleaned.includes('@') || cleaned.includes(' ')) {
    return null;
  }
  return cleaned.toLowerCase();
}

export function safeInt(
  value: string | number | null | undefined,
  fallback = 0,
): number {
  if (value === null || value === undefined) return fallback;
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function safeDecimal(
  value: string | number | null | undefined,
  fallback = 0,
  min = -999999,
  max = 999999,
): number {
  if (value === null || value === undefined) return fallback;
  const parsed = Number(String(value).trim().replace(',', '.'));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Number(parsed.toFixed(2))));
}

export function safeDate(
  value: string | null | undefined,
  fallback: string | null = null,
): string | null {
  if (!value) return fallback;
  const raw = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || raw.startsWith('0000')) {
    return fallback;
  }
  const [y, m, d] = raw.split('-').map(Number);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
    return fallback;
  }
  // Validar fechas imposibles de MariaDB (ej. 2021-02-30 o 2021-04-31)
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() + 1 !== m ||
    dt.getUTCDate() !== d
  ) {
    return fallback;
  }
  return raw;
}

export function safeTimestamp(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith('0000') || trimmed.length < 10) return null;
  const datePart = safeDate(trimmed.slice(0, 10), null);
  if (!datePart) return null;
  const timePart = trimmed.length >= 19 ? trimmed.slice(11, 19) : '00:00:00';
  return /^\d{2}:\d{2}:\d{2}$/.test(timePart)
    ? `${datePart}T${timePart}Z`
    : `${datePart}T00:00:00Z`;
}

export function mapLegacyGender(
  raw: string | number | null | undefined,
): number {
  if (raw === null || raw === undefined) return 0;
  const s = String(raw).trim().toUpperCase();
  if (s === '1' || s === 'M' || s === 'MASCULINO') return 1;
  if (s === '2' || s === 'F' || s === 'FEMENINO') return 2;
  if (s === '3' || s === 'MX' || s === 'MIXTO') return 3;
  return 0;
}

export function mapLegacyProfileIdToRole(profileId: number): CommunityRole {
  switch (profileId) {
    case 1:
      return CommunityRole.MONITOR;
    case 2:
      return CommunityRole.RECTOR;
    case 3:
      return CommunityRole.SECRETARY;
    case 4:
      return CommunityRole.TEACHER;
    case 5:
      return CommunityRole.STUDENT;
    case 6:
      return CommunityRole.COORDINATOR;
    case 7:
      return CommunityRole.FAMILY;
    case 8:
      return CommunityRole.SCHOOL_ADMIN;
    default:
      return CommunityRole.STUDENT;
  }
}

export function mapLegacyIndicatorType(tipo: number): string {
  switch (tipo) {
    case 1:
      return 'COMPETENCY';
    case 2:
      return 'ACHIEVEMENT';
    case 3:
      return 'INDICATOR';
    case 4:
      return 'STRENGTH';
    case 5:
      return 'DIFFICULTY';
    case 6:
      return 'STANDARD';
    default:
      return 'ACHIEVEMENT';
  }
}

export function validCatalogId(
  rawId: string | number | null | undefined,
  validSet: ReadonlySet<number>,
  fallback: number | null = null,
): number | null {
  const num = safeInt(rawId, -1);
  return validSet.has(num) ? num : fallback;
}

export function parseYesNoFlag(raw: string | null | undefined): boolean {
  const s = (raw ?? '').trim().toLowerCase();
  return s === '1' || s === 'si' || s === 'sí' || s === 'true' || s === 's';
}

export function dedupeByKey<T>(
  rows: readonly T[],
  keyFn: (row: T) => string,
): T[] {
  const map = new Map<string, T>();
  for (const r of rows) {
    map.set(keyFn(r), r);
  }
  return Array.from(map.values());
}
