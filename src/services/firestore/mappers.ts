import { FirebaseError } from 'firebase/app';

// ---------------------------------------------------------------------------
// Pick helpers — walk an argument list and return the first non-null hit
// ---------------------------------------------------------------------------

export function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    const next = asString(value);
    if (next) return next;
  }
  return null;
}

export function pickNullableString(...values: unknown[]): string | null {
  for (const value of values) {
    const next = asNullableString(value);
    if (next) return next;
  }
  return null;
}

export function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const next = asNumber(value);
    if (next !== null) return next;
  }
  return null;
}

export function pickTimestampMs(...values: unknown[]): number {
  for (const value of values) {
    const next = getTimestampMs(value);
    if (next > 0) return next;
  }
  return 0;
}

export function pickStringArray(...values: unknown[]): string[] {
  for (const value of values) {
    const next = asStringArray(value);
    if (next.length > 0) return next;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Scalar coercions
// ---------------------------------------------------------------------------

export function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null;
}

export function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;

    const normalized = value.replace(/[^0-9.+-]/g, '');
    const parsedNormalized = Number(normalized);
    return Number.isFinite(parsedNormalized) ? parsedNormalized : null;
  }

  return null;
}

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

export function toIsoString(value: unknown): string | null {
  const timestampMs = getTimestampMs(value);
  if (timestampMs) return new Date(timestampMs).toISOString();
  return typeof value === 'string' ? value : null;
}

// ---------------------------------------------------------------------------
// Timestamp resolution — handles Firestore Timestamp objects, unix seconds,
// unix milliseconds, and ISO strings.
// ---------------------------------------------------------------------------

export function getTimestampMs(value: unknown): number {
  if (!value) return 0;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return normalizeUnixTimestamp(value);
  }

  if (typeof value === 'string') {
    const parsedNumber = Number(value);
    if (Number.isFinite(parsedNumber)) return normalizeUnixTimestamp(parsedNumber);

    const parsedDate = Date.parse(value);
    return Number.isFinite(parsedDate) ? normalizeUnixTimestamp(parsedDate) : 0;
  }

  if (typeof value === 'object') {
    if ('toMillis' in value && typeof (value as { toMillis?: unknown }).toMillis === 'function') {
      try {
        const millis = Number((value as { toMillis: () => unknown }).toMillis()) || 0;
        return normalizeUnixTimestamp(millis);
      } catch {
        return 0;
      }
    }

    if ('toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
      try {
        const date = (value as { toDate: () => unknown }).toDate();
        return date instanceof Date ? normalizeUnixTimestamp(date.getTime()) : 0;
      } catch {
        return 0;
      }
    }

    const seconds = getFirestoreSeconds(value);
    if (seconds !== null) return normalizeUnixTimestamp(seconds);
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

export function isRecoverableFirestoreReadError(error: unknown): boolean {
  return (
    error instanceof FirebaseError &&
    [
      'failed-precondition',
      'permission-denied',
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted',
    ].includes(error.code)
  );
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeUnixTimestamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value > 0 && value < 10_000_000_000) return Math.round(value * 1000);
  return Math.round(value);
}

function getFirestoreSeconds(value: unknown): number | null {
  if (typeof value !== 'object' || value === null) return null;

  if ('seconds' in value && typeof (value as { seconds?: unknown }).seconds === 'number') {
    return (value as { seconds: number }).seconds;
  }

  if ('_seconds' in value && typeof (value as { _seconds?: unknown })._seconds === 'number') {
    return (value as { _seconds: number })._seconds;
  }

  return null;
}
