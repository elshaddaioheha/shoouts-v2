import { getFirebaseDb } from '@/src/config/firebase';
import {
  deriveCommerceAvailabilityStatus,
  type CommerceAccessType,
  type CommerceDeliveryStatus,
  type CommerceEntitlementStatus,
  type CommercePaymentStatus,
} from '@/src/features/commerce/transaction.types';
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
  const title = asString(raw.title) ?? asString(raw.trackTitle) ?? asString(raw.name);

  if (!title) {
    return null;
  }

  const price = asNumber(raw.price) ?? asNumber(raw.amount) ?? 0;
  const deliveryUrl =
    asNullableString(raw.deliveryUrl) ??
    asNullableString(raw.downloadUrl) ??
    asNullableString(raw.fileUrl) ??
    asNullableString(raw.signedUrl) ??
    asNullableString(raw.secureUrl);
  const accessType = normalizeAccessType(raw.accessType, price, raw.isFree);
  const paymentStatus = normalizePaymentStatus(
    raw.paymentStatus ?? raw.checkoutStatus ?? raw.transactionStatus ?? raw.status,
    accessType
  );
  const entitlementStatus = normalizeEntitlementStatus(
    raw.entitlementStatus ?? raw.accessStatus ?? raw.licenseStatus ?? raw.status,
    deliveryUrl
  );
  const deliveryStatus = normalizeDeliveryStatus(
    raw.deliveryStatus ?? raw.downloadStatus ?? raw.fileStatus ?? raw.status,
    deliveryUrl
  );
  const availabilityStatus = deriveCommerceAvailabilityStatus({
    accessType,
    paymentStatus,
    entitlementStatus,
    deliveryStatus,
  });

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
    purchasedAt: toIsoString(raw.purchasedAt ?? raw.createdAt ?? raw.updatedAt ?? raw.timestamp),
    coverUrl:
      asNullableString(raw.coverUrl) ??
      asNullableString(raw.artworkUrl) ??
      asNullableString(raw.imageUrl),
    deliveryUrl,
    accessType,
    availabilityStatus,
    paymentStatus,
    entitlementStatus,
    deliveryStatus,
  };
}

function compareByDate(a: LibraryPurchase, b: LibraryPurchase) {
  const first = a.purchasedAt ? Date.parse(a.purchasedAt) : 0;
  const second = b.purchasedAt ? Date.parse(b.purchasedAt) : 0;
  return second - first;
}

function normalizeAccessType(
  value: unknown,
  price: number,
  isFreeValue: unknown
): CommerceAccessType {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (normalized === 'free' || normalized === 'paid') {
    return normalized;
  }

  if (asBoolean(isFreeValue) === true || price <= 0) {
    return 'free';
  }

  return 'paid';
}

function normalizePaymentStatus(
  value: unknown,
  accessType: CommerceAccessType
): CommercePaymentStatus {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalized === 'paid' ||
    normalized === 'completed' ||
    normalized === 'success' ||
    normalized === 'succeeded' ||
    normalized === 'settled'
  ) {
    return 'paid';
  }

  if (
    normalized === 'pending' ||
    normalized === 'processing' ||
    normalized === 'initiated' ||
    normalized === 'authorized'
  ) {
    return 'pending';
  }

  if (
    normalized === 'failed' ||
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'declined'
  ) {
    return 'failed';
  }

  if (normalized === 'refunded' || normalized === 'reversed') {
    return 'refunded';
  }

  return accessType === 'free' ? 'paid' : 'pending';
}

function normalizeEntitlementStatus(
  value: unknown,
  deliveryUrl: string | null
): CommerceEntitlementStatus {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalized === 'granted' ||
    normalized === 'active' ||
    normalized === 'available' ||
    normalized === 'paid' ||
    normalized === 'completed' ||
    normalized === 'success' ||
    normalized === 'succeeded' ||
    normalized === 'settled'
  ) {
    return 'granted';
  }

  if (
    normalized === 'pending' ||
    normalized === 'processing' ||
    normalized === 'queued' ||
    normalized === 'provisioning'
  ) {
    return 'pending';
  }

  if (
    normalized === 'restricted' ||
    normalized === 'revoked' ||
    normalized === 'blocked' ||
    normalized === 'denied' ||
    normalized === 'expired'
  ) {
    return 'restricted';
  }

  return deliveryUrl ? 'granted' : 'pending';
}

function normalizeDeliveryStatus(
  value: unknown,
  deliveryUrl: string | null
): CommerceDeliveryStatus {
  if (deliveryUrl) {
    return 'ready';
  }

  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalized === 'ready' ||
    normalized === 'available' ||
    normalized === 'completed' ||
    normalized === 'active'
  ) {
    return 'ready';
  }

  if (
    normalized === 'restricted' ||
    normalized === 'revoked' ||
    normalized === 'blocked' ||
    normalized === 'denied' ||
    normalized === 'expired'
  ) {
    return 'restricted';
  }

  return 'not_ready';
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

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
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
