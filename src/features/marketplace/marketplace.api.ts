import { db } from '@/src/config/firebase';
import { normalizeRole } from '@/src/features/access/access.helpers';
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';
import type { SellerVerificationStatus } from '@/src/features/account/account.types';
import type { MarketplaceListing, SellerProfile } from './marketplace.types';

const UPLOADS_COLLECTION = 'uploads';
const USERS_COLLECTION = 'users';
const SELLERS_COLLECTION = 'sellers';

export async function fetchMarketplaceListings(limitCount = 24): Promise<MarketplaceListing[]> {
  try {
    const scanLimit = Math.max(limitCount * 4, limitCount);
    const snapshot = await getDocs(
      query(collectionGroup(db, UPLOADS_COLLECTION), limit(scanLimit))
    );

    return snapshot.docs
      .map((document) => mapListing(document.id, document.data(), document.ref.path))
      .filter((listing): listing is MarketplaceListing => listing !== null)
      .filter((listing) => listing.isPublished)
      .sort(compareListingsByDate);
  } catch (error) {
    logFirestoreReadError('fetchMarketplaceListings', error);
    throw error;
  }
}

export async function fetchMarketplaceListingById(
  listingId: string
): Promise<MarketplaceListing | null> {
  try {
    const topLevelSnapshot = await getDoc(doc(db, UPLOADS_COLLECTION, listingId));

    if (topLevelSnapshot.exists()) {
      const listing = mapListing(
        topLevelSnapshot.id,
        topLevelSnapshot.data(),
        topLevelSnapshot.ref.path
      );
      return listing?.isPublished ? listing : null;
    }

    const groupSnapshot = await getDocs(
      query(collectionGroup(db, UPLOADS_COLLECTION), limit(100))
    );

    const listing = groupSnapshot.docs
      .map((document) => mapListing(document.id, document.data(), document.ref.path))
      .filter((item): item is MarketplaceListing => item !== null)
      .find((item) => item.id === listingId);

    return listing?.isPublished ? listing : null;
  } catch (error) {
    logFirestoreReadError('fetchMarketplaceListingById', error);
    throw error;
  }
}

export async function fetchSellerProfile(sellerId: string): Promise<SellerProfile | null> {
  try {
    for (const collectionName of [USERS_COLLECTION, SELLERS_COLLECTION]) {
      const snapshot = await getDoc(doc(db, collectionName, sellerId));

      if (snapshot.exists()) {
        return mapSellerProfile(snapshot.id, snapshot.data());
      }
    }

    return null;
  } catch (error) {
    logFirestoreReadError('fetchSellerProfile', error);
    throw error;
  }
}

export async function fetchSellerListings(
  sellerId: string,
  limitCount = 12
): Promise<MarketplaceListing[]> {
  try {
    const scanLimit = Math.max(limitCount * 3, limitCount);

    for (const field of ['sellerId', 'ownerId', 'userId', 'uid']) {
      const snapshot = await getDocs(
        query(
          collectionGroup(db, UPLOADS_COLLECTION),
          where(field, '==', sellerId),
          limit(scanLimit)
        )
      );

      if (!snapshot.empty) {
        return snapshot.docs
          .map((document) => mapListing(document.id, document.data(), document.ref.path))
          .filter((listing): listing is MarketplaceListing => listing !== null)
          .filter((listing) => listing.isPublished)
          .sort(compareListingsByDate)
          .slice(0, limitCount);
      }
    }

    const fallbackSnapshot = await getDocs(
      query(collectionGroup(db, UPLOADS_COLLECTION), limit(Math.max(limitCount * 8, 96)))
    );

    return fallbackSnapshot.docs
      .map((document) => mapListing(document.id, document.data(), document.ref.path))
      .filter((listing): listing is MarketplaceListing => listing !== null)
      .filter((listing) => listing.isPublished && listing.sellerId === sellerId)
      .sort(compareListingsByDate)
      .slice(0, limitCount);
  } catch (error) {
    logFirestoreReadError('fetchSellerListings', error);
    throw error;
  }
}

function logFirestoreReadError(scope: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown Firestore read error';
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : 'unknown';

  console.warn(`[marketplace] ${scope} failed (${code}): ${message}`);
}

function mapListing(
  listingId: string,
  raw: Record<string, unknown>,
  documentPath?: string
): MarketplaceListing | null {
  const pricing = asRecord(raw.pricing);
  const title = asString(raw.title) ?? asString(raw.name);
  const sellerId =
    asString(raw.sellerId) ??
    asString(raw.ownerId) ??
    asString(raw.userId) ??
    asString(raw.uid) ??
    inferOwnerIdFromPath(documentPath);

  if (!title || !sellerId) {
    return null;
  }

  const price =
    asNumber(raw.price) ??
    asNumber(pricing.amount) ??
    asNumber(raw.amount) ??
    0;
  const currency = asString(raw.currency) ?? asString(pricing.currency) ?? 'USD';

  return {
    id: listingId,
    sellerId,
    title,
    artist:
      asString(raw.artist) ??
      asString(raw.artistName) ??
      asString(raw.sellerName) ??
      asString(raw.creatorName) ??
      'Unknown creator',
    price,
    currency,
    coverUrl:
      asNullableString(raw.coverUrl) ??
      asNullableString(raw.artworkUrl) ??
      asNullableString(raw.imageUrl),
    genre: asNullableString(raw.genre) ?? asNullableString(raw.category),
    bpm: asNumber(raw.bpm),
    key: asNullableString(raw.key),
    description: asNullableString(raw.description),
    isFree: price <= 0,
    tags: asStringArray(raw.tags),
    isPublished: isPublishedListing(raw),
    createdAt: toIsoString(raw.createdAt ?? raw.publishedAt),
    updatedAt: toIsoString(raw.updatedAt),
  };
}

function inferOwnerIdFromPath(documentPath?: string): string | null {
  if (!documentPath) {
    return null;
  }

  const segments = documentPath.split('/').filter(Boolean);
  const usersIndex = segments.findIndex((segment) => segment === 'users');
  const uploadsIndex = segments.findIndex((segment) => segment === UPLOADS_COLLECTION);

  if (
    usersIndex >= 0 &&
    uploadsIndex > usersIndex + 1 &&
    segments[usersIndex + 1]
  ) {
    return segments[usersIndex + 1];
  }

  return null;
}

function mapSellerProfile(
  sellerId: string,
  raw: Record<string, unknown>
): SellerProfile {
  const seller = asRecord(raw.seller);

  return {
    id: sellerId,
    displayName:
      asString(raw.displayName) ??
      asString(raw.artistName) ??
      asString(raw.sellerName) ??
      asString(raw.businessName) ??
      'Creator',
    photoURL:
      asNullableString(raw.photoURL) ??
      asNullableString(raw.avatarUrl) ??
      asNullableString(raw.profileImageUrl),
    bio: asNullableString(raw.bio) ?? asNullableString(raw.description),
    role: normalizeRole(asString(raw.role) ?? 'shoouts'),
    verificationStatus: normalizeVerificationStatus(
      seller.verificationStatus ?? raw.verificationStatus
    ),
    payoutsEnabled: asBoolean(seller.payoutsEnabled ?? raw.payoutsEnabled) ?? false,
  };
}

function compareListingsByDate(a: MarketplaceListing, b: MarketplaceListing) {
  const first = a.createdAt ? Date.parse(a.createdAt) : 0;
  const second = b.createdAt ? Date.parse(b.createdAt) : 0;
  return second - first;
}

function isPublishedListing(raw: Record<string, unknown>) {
  const visibility = asString(raw.visibility)?.toLowerCase();
  const status = asString(raw.status)?.toLowerCase();

  if (raw.isPublished === false || raw.published === false) {
    return false;
  }

  if (visibility === 'private') {
    return false;
  }

  if (status === 'draft' || status === 'archived') {
    return false;
  }

  return true;
}

function normalizeVerificationStatus(value: unknown): SellerVerificationStatus {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalized === 'not_started' ||
    normalized === 'pending' ||
    normalized === 'verified' ||
    normalized === 'rejected'
  ) {
    return normalized;
  }

  return 'not_started';
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

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
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
