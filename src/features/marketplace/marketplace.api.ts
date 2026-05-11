import { getFirebaseDb } from '@/src/config/firebase';
import type { SellerVerificationStatus } from '@/src/features/account/account.types';
import { normalizeRole } from '@/src/features/access/access.helpers';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  collectionGroup,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { MarketplaceListing, SellerProfile } from './marketplace.types';

const UPLOADS_COLLECTION = 'uploads';
const USERS_COLLECTION = 'users';
const SELLERS_COLLECTION = 'sellers';

export async function fetchMarketplaceListings(limitCount = 24): Promise<MarketplaceListing[]> {
  try {
    const listings = await fetchPublishedUploads(Math.max(limitCount * 4, limitCount));
    return listings.slice(0, limitCount);
  } catch (error) {
    logFirestoreReadError('fetchMarketplaceListings', error);
    throw error;
  }
}

export async function fetchMarketplaceListingById(
  listingId: string
): Promise<MarketplaceListing | null> {
  try {
    const db = getFirebaseDb();
    try {
      const topLevelSnapshot = await getDoc(doc(db, UPLOADS_COLLECTION, listingId));

      if (topLevelSnapshot.exists()) {
        const listing = mapListing(
          topLevelSnapshot.id,
          topLevelSnapshot.data(),
          topLevelSnapshot.ref.path
        );

        if (listing?.isPublished) {
          return listing;
        }
      }
    } catch (error) {
      if (!isRecoverableFirestoreReadError(error)) {
        throw error;
      }

      logFirestoreFallback('fetchMarketplaceListingById top-level lookup', error);
    }

    try {
      const nestedSnapshot = await getDocs(
        query(
          collectionGroup(db, UPLOADS_COLLECTION),
          where(documentId(), '==', listingId),
          limit(1)
        )
      );

      if (!nestedSnapshot.empty) {
        const listing = mapListingFromSnapshot(nestedSnapshot.docs[0]);
        if (listing?.isPublished) {
          return listing;
        }
      }
    } catch (error) {
      if (!isRecoverableFirestoreReadError(error)) {
        throw error;
      }

      logFirestoreFallback('fetchMarketplaceListingById nested lookup', error);
    }

    const listings = await fetchPublishedUploads(300);
    return listings.find((listing) => listing.id === listingId) ?? null;
  } catch (error) {
    logFirestoreReadError('fetchMarketplaceListingById', error);
    throw error;
  }
}

export async function fetchSellerProfile(sellerId: string): Promise<SellerProfile | null> {
  try {
    const db = getFirebaseDb();
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
    const db = getFirebaseDb();
    try {
      const directSnapshot = await getDocs(
        query(
          collection(db, USERS_COLLECTION, sellerId, UPLOADS_COLLECTION),
          where('isPublic', '==', true),
          limit(Math.max(limitCount * 2, limitCount))
        )
      );
      const directListings = directSnapshot.docs
        .map((document) => mapListing(document.id, document.data(), document.ref.path))
        .filter((listing): listing is MarketplaceListing => listing !== null)
        .filter((listing) => listing.isPublished)
        .sort(compareListingsByDate);

      if (directListings.length > 0) {
        return directListings.slice(0, limitCount);
      }
    } catch (error) {
      if (!isRecoverableFirestoreReadError(error)) {
        throw error;
      }

      logFirestoreFallback('fetchSellerListings user upload lookup', error);
    }

    for (const field of ['uploaderId', 'sellerId', 'ownerId', 'userId', 'uid']) {
      try {
        const snapshot = await getDocs(
          query(
            collectionGroup(db, UPLOADS_COLLECTION),
            where('isPublic', '==', true),
            where(field, '==', sellerId),
            limit(Math.max(limitCount * 3, limitCount))
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
      } catch (error) {
        if (!isRecoverableFirestoreReadError(error)) {
          throw error;
        }

        logFirestoreFallback(`fetchSellerListings ${field} lookup`, error);
      }
    }

    const fallbackListings = await fetchPublishedUploads(Math.max(limitCount * 8, 96));
    return fallbackListings
      .filter((listing) => listing.sellerId === sellerId)
      .slice(0, limitCount);
  } catch (error) {
    logFirestoreReadError('fetchSellerListings', error);
    throw error;
  }
}

async function fetchPublishedUploads(scanLimit: number): Promise<MarketplaceListing[]> {
  const db = getFirebaseDb();
  const recentQuery = query(
    collectionGroup(db, UPLOADS_COLLECTION),
    where('isPublic', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(scanLimit)
  );
  const rankedQuery = query(
    collectionGroup(db, UPLOADS_COLLECTION),
    where('isPublic', '==', true),
    orderBy('listenCount', 'desc'),
    limit(scanLimit)
  );

  const [recentSnapshot, rankedSnapshot] = await Promise.allSettled([
    getDocs(recentQuery),
    getDocs(rankedQuery),
  ]);
  const docs = [
    ...(recentSnapshot.status === 'fulfilled' ? recentSnapshot.value.docs : []),
    ...(rankedSnapshot.status === 'fulfilled' ? rankedSnapshot.value.docs : []),
  ];

  if (docs.length > 0) {
    return sortAndDedupeListings(docs.map(mapListingFromSnapshot));
  }

  const primaryError =
    recentSnapshot.status === 'rejected'
      ? recentSnapshot.reason
      : rankedSnapshot.status === 'rejected'
        ? rankedSnapshot.reason
        : null;

  if (isMissingIndexError(primaryError)) {
    console.warn(
      '[marketplace] Published upload ranking needs a Firestore index. Showing unranked uploads.'
    );
  } else if (primaryError) {
    throw primaryError;
  }

  const fallbackSnapshot = await getDocs(
    query(
      collectionGroup(db, UPLOADS_COLLECTION),
      where('isPublic', '==', true),
      limit(scanLimit)
    )
  );

  return sortAndDedupeListings(fallbackSnapshot.docs.map(mapListingFromSnapshot));
}

function mapListingFromSnapshot(document: QueryDocumentSnapshot<DocumentData>) {
  return mapListing(document.id, document.data(), document.ref.path);
}

function sortAndDedupeListings(listings: (MarketplaceListing | null)[]) {
  const merged = new Map<string, MarketplaceListing>();

  listings
    .filter((listing): listing is MarketplaceListing => listing !== null)
    .filter((listing) => listing.isPublished)
    .sort(compareListingsByDate)
    .forEach((listing) => {
      const key = listing.sourcePath ?? listing.id;
      if (!merged.has(key)) {
        merged.set(key, listing);
      }
    });

  return Array.from(merged.values());
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

function logFirestoreFallback(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown Firestore read error';
  const code = error instanceof FirebaseError ? error.code : 'unknown';

  console.warn(`[marketplace] ${scope} fell back (${code}): ${message}`);
}

function mapListing(
  listingId: string,
  raw: Record<string, unknown>,
  documentPath?: string
): MarketplaceListing | null {
  const metadata = asRecord(raw.metadata);
  const details = asRecord(raw.details);
  const seller = asRecord(raw.seller);
  const uploader = asRecord(raw.uploader);
  const owner = asRecord(raw.owner);
  const createdBy = asRecord(raw.createdBy);
  const pricing = asRecord(raw.pricing);
  const monetization = asRecord(raw.monetization);
  const artwork = asRecord(raw.artwork);
  const cover = asRecord(raw.cover);
  const media = asRecord(raw.media);
  const files = asRecord(raw.files);
  const preview = asRecord(raw.preview);
  const previewFile = asRecord(raw.previewFile);
  const analytics = asRecord(raw.analytics);
  const stats = asRecord(raw.stats);
  const release = asRecord(raw.release);
  const title =
    pickString(
      raw.title,
      metadata.title,
      details.title,
      raw.trackTitle,
      raw.name,
      metadata.name,
      raw.fileName,
      raw.originalName
    ) ?? 'Untitled listing';
  const sellerId =
    pickString(
      raw.uploaderId,
      raw.sellerId,
      raw.ownerId,
      raw.userId,
      raw.uid,
      uploader.id,
      uploader.uid,
      seller.id,
      seller.uid,
      owner.id,
      owner.uid,
      createdBy.uid
    ) ?? inferOwnerIdFromPath(documentPath);

  if (!sellerId || !isPublishedListing(raw)) {
    return null;
  }

  const price = resolveListingPrice(raw, pricing, monetization);
  const uploaderName = pickNullableString(
    raw.uploaderName,
    raw.artist,
    raw.sellerName,
    raw.creatorName,
    metadata.artist,
    metadata.artistName,
    seller.displayName,
    seller.name,
    uploader.displayName,
    uploader.name,
    owner.displayName,
    owner.name
  );
  const artworkUrl = pickNullableString(
    raw.artworkUrl,
    raw.coverUrl,
    raw.imageUrl,
    raw.thumbnailUrl,
    artwork.url,
    artwork.downloadUrl,
    cover.url,
    cover.secureUrl,
    media.artworkUrl,
    media.coverUrl,
    files.artworkUrl
  );
  const audioUrl = pickNullableString(
    raw.audioUrl,
    raw.url,
    raw.previewUrl,
    raw.streamingUrl,
    raw.hlsUrl,
    preview.url,
    preview.streamingUrl,
    media.audioUrl,
    files.audioUrl,
    files.previewUrl,
    previewFile.url
  );
  const category = pickNullableString(raw.category, metadata.category, details.category);
  const assetType = pickNullableString(raw.assetType, raw.type, metadata.type, details.type);
  const tags = pickStringArray(raw.tags, metadata.tags, details.tags, raw.keywords);
  const genre =
    pickNullableString(raw.genre, metadata.genre, details.genre, category, assetType) ??
    tags[0] ??
    'Music';
  const createdAtMs = pickTimestampMs(
    raw.createdAt,
    raw.uploadedAt,
    raw.createdOn,
    metadata.createdAt
  );
  const publishedAtMs = pickTimestampMs(
    raw.publishedAt,
    raw.releasedAt,
    raw.liveAt,
    release.publishedAt,
    release.releasedAt,
    release.liveAt
  );

  return {
    id: listingId,
    sourcePath: documentPath,
    sellerId,
    title,
    artist: uploaderName ?? 'Unknown creator',
    uploaderName,
    price,
    currency:
      normalizeCurrency(
        pickString(raw.currency, pricing.currency, monetization.currency, asRecord(pricing.price).currency)
      ) ?? 'USD',
    audioUrl,
    artworkUrl,
    coverUrl: artworkUrl,
    genre,
    assetType,
    category,
    bpm: pickNumber(raw.bpm, metadata.bpm, details.bpm),
    key: pickNullableString(raw.key, raw.musicalKey, metadata.key, details.key),
    description: pickNullableString(
      raw.description,
      details.description,
      metadata.description,
      raw.caption,
      raw.summary,
      raw.synopsis
    ),
    listenCount:
      pickNumber(
        raw.listenCount,
        raw.playCount,
        raw.plays,
        analytics.listenCount,
        analytics.playCount,
        stats.listenCount,
        stats.plays
      ) ?? 0,
    lifecycleStatus: pickNullableString(
      raw.lifecycleStatus,
      raw.publishState,
      release.status,
      raw.status
    ),
    isPublic: isPublicListing(raw),
    isFree: price <= 0 || raw.isFree === true,
    tags,
    isPublished: true,
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
    publishedAtMs,
    createdAtMs,
  };
}

function inferOwnerIdFromPath(documentPath?: string): string | null {
  if (!documentPath) {
    return null;
  }

  const segments = documentPath.split('/').filter(Boolean);
  const usersIndex = segments.findIndex((segment) => segment === USERS_COLLECTION);
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
      asString(raw.fullName) ??
      asString(raw.name) ??
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
  const first = a.publishedAtMs || a.createdAtMs || 0;
  const second = b.publishedAtMs || b.createdAtMs || 0;

  if (second !== first) {
    return second - first;
  }

  if (b.listenCount !== a.listenCount) {
    return b.listenCount - a.listenCount;
  }

  return a.title.localeCompare(b.title);
}

function isPublishedListing(raw: Record<string, unknown>) {
  const release = asRecord(raw.release);
  const status =
    pickString(raw.status, raw.publishState, raw.state, release.status)?.toLowerCase();

  if (!isPublicListing(raw)) {
    return false;
  }

  if (status === 'draft' || status === 'archived' || status === 'deleted') {
    return false;
  }

  if (raw.published === false || raw.isPublished === false) {
    return false;
  }

  const scheduledMs = pickTimestampMs(
    raw.scheduledReleaseAt,
    raw.scheduledReleaseAtMs,
    release.scheduledAt,
    release.releaseAt
  );
  const lifecycleStatus =
    pickString(raw.lifecycleStatus, release.lifecycleStatus)?.toLowerCase();

  if (lifecycleStatus === 'upcoming' && (!scheduledMs || scheduledMs > Date.now())) {
    return false;
  }

  return true;
}

function isPublicListing(raw: Record<string, unknown>) {
  const release = asRecord(raw.release);
  const visibility =
    pickString(raw.visibility, raw.access, raw.availability, release.visibility)?.toLowerCase();
  const status = pickString(raw.status, raw.publishState, raw.state)?.toLowerCase();

  if (raw.isPublic === true || raw.public === true) {
    return true;
  }

  if (raw.isPublic === false || raw.public === false || visibility === 'private') {
    return false;
  }

  return (
    raw.published === true ||
    raw.isPublished === true ||
    visibility === 'public' ||
    status === 'published'
  );
}

function isMissingIndexError(error: unknown) {
  return error instanceof FirebaseError && error.code === 'failed-precondition';
}

function isRecoverableFirestoreReadError(error: unknown) {
  return (
    error instanceof FirebaseError &&
    ['failed-precondition', 'permission-denied', 'unavailable'].includes(error.code)
  );
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

function resolveListingPrice(
  raw: Record<string, unknown>,
  pricing: Record<string, unknown>,
  monetization: Record<string, unknown>
) {
  const directPrice = pickNumber(
    raw.price,
    pricing.amount,
    pricing.value,
    raw.amount,
    monetization.amount
  );

  if (directPrice !== null) {
    return directPrice;
  }

  const centsPrice = pickNumber(raw.priceCents, pricing.amountCents, monetization.amountCents);
  if (centsPrice !== null) {
    return centsPrice / 100;
  }

  return 0;
}

function normalizeCurrency(value: string | null) {
  return value ? value.trim().toUpperCase() : null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    const nextValue = asString(value);
    if (nextValue) {
      return nextValue;
    }
  }

  return null;
}

function pickNullableString(...values: unknown[]) {
  for (const value of values) {
    const nextValue = asNullableString(value);
    if (nextValue) {
      return nextValue;
    }
  }

  return null;
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    const nextValue = asNumber(value);
    if (nextValue !== null) {
      return nextValue;
    }
  }

  return null;
}

function pickTimestampMs(...values: unknown[]) {
  for (const value of values) {
    const nextValue = getTimestampMs(value);
    if (nextValue > 0) {
      return nextValue;
    }
  }

  return 0;
}

function pickStringArray(...values: unknown[]) {
  for (const value of values) {
    const nextValue = asStringArray(value);
    if (nextValue.length > 0) {
      return nextValue;
    }
  }

  return [];
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
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function toIsoString(value: unknown): string | null {
  const timestampMs = getTimestampMs(value);

  if (timestampMs) {
    return new Date(timestampMs).toISOString();
  }

  return typeof value === 'string' ? value : null;
}

function getTimestampMs(value: unknown): number {
  if (!value) {
    return 0;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsedNumber = Number(value);
    if (Number.isFinite(parsedNumber)) {
      return parsedNumber;
    }

    const parsedDate = Date.parse(value);
    return Number.isFinite(parsedDate) ? parsedDate : 0;
  }

  if (typeof value === 'object') {
    if ('toMillis' in value && typeof (value as { toMillis?: unknown }).toMillis === 'function') {
      try {
        return Number((value as { toMillis: () => unknown }).toMillis()) || 0;
      } catch {
        return 0;
      }
    }

    if ('toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
      try {
        const date = (value as { toDate: () => unknown }).toDate();
        return date instanceof Date ? date.getTime() : 0;
      } catch {
        return 0;
      }
    }

    if ('_seconds' in value && typeof (value as { _seconds?: unknown })._seconds === 'number') {
      return Number((value as { _seconds: number })._seconds) * 1000;
    }
  }

  return 0;
}
