import { getFirebaseDb } from '@/src/config/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import type { LibraryPurchase } from './downloads.types';

export async function fetchUserPurchases(uid: string, limitCount = 24): Promise<LibraryPurchase[]> {
  try {
    const db = getFirebaseDb();
    const snapshot = await getDocs(
      query(collection(db, 'users', uid, 'purchases'), limit(limitCount))
    );

    return snapshot.docs
      .map((document) => mapPurchase(document.id, document.data()))
      .filter((purchase): purchase is LibraryPurchase => purchase !== null)
      .sort(compareByDate);
  } catch (error) {
    logPurchaseReadError(error);
    throw error;
  }
}

function mapPurchase(
  purchaseId: string,
  raw: Record<string, unknown>
): LibraryPurchase | null {
  const listingId =
    asString(raw.listingId) ??
    asString(raw.uploadId) ??
    asString(raw.trackId) ??
    purchaseId;
  const title =
    asString(raw.title) ??
    asString(raw.trackTitle) ??
    asString(raw.name);

  if (!title) {
    return null;
  }

  const price =
    asNumber(raw.price) ??
    asNumber(raw.amount) ??
    0;
  const status = normalizePurchaseStatus(raw.status);

  return {
    id: purchaseId,
    listingId,
    title,
    artist:
      asString(raw.artist) ??
      asString(raw.artistName) ??
      asString(raw.sellerName) ??
      'Creator',
    price,
    currency: asString(raw.currency) ?? 'USD',
    purchasedAt: toIsoString(
      raw.purchasedAt ?? raw.createdAt ?? raw.updatedAt ?? raw.timestamp
    ),
    coverUrl:
      asNullableString(raw.coverUrl) ??
      asNullableString(raw.artworkUrl) ??
      asNullableString(raw.imageUrl),
    accessType: price <= 0 ? 'free' : 'paid',
    status,
  };
}

function compareByDate(a: LibraryPurchase, b: LibraryPurchase) {
  const first = a.purchasedAt ? Date.parse(a.purchasedAt) : 0;
  const second = b.purchasedAt ? Date.parse(b.purchasedAt) : 0;
  return second - first;
}

function normalizePurchaseStatus(value: unknown): LibraryPurchase['status'] {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalized === 'available' ||
    normalized === 'processing' ||
    normalized === 'restricted'
  ) {
    return normalized;
  }

  if (normalized === 'completed' || normalized === 'paid' || normalized === 'success') {
    return 'available';
  }

  if (normalized === 'pending') {
    return 'processing';
  }

  return 'available';
}

function logPurchaseReadError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown purchases read error';
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : 'unknown';

  console.warn(`[downloads] fetchUserPurchases failed (${code}): ${message}`);
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toIsoString(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    try {
      const maybeTimestamp = value as { toDate?: () => unknown };
      const date = maybeTimestamp.toDate?.();
      return date instanceof Date ? date.toISOString() : null;
    } catch {
      return null;
    }
  }

  return null;
}
