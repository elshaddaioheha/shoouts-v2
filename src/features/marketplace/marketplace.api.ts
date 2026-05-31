import { getFirebaseDb } from '@/src/config/firebase';
import type { SellerVerificationStatus } from '@/src/features/account/account.types';
import { normalizeRole } from '@/src/features/access/access.helpers';
import {
  asBoolean,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  getTimestampMs,
  isRecoverableFirestoreReadError,
  pickNullableString,
  pickNumber,
  pickString,
  pickStringArray,
  pickTimestampMs,
  toIsoString,
} from '@/src/services/firestore/mappers';
import { FirebaseError } from 'firebase/app';
import {
  collection,
  collectionGroup,
  doc,
  documentId,
  type Firestore,
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
const PUBLIC_VISIBILITY_FIELDS = ['isPublic', 'public', 'published', 'isPublished'] as const;
const SELLER_ID_FIELDS = ['uploaderId', 'sellerId', 'ownerId', 'userId', 'uid'] as const;

type ListingMapDropReason = 'not_published';

type ListingMapDiagnostics = {
  usedFallbackTitle: boolean;
  usedFallbackArtist: boolean;
  usedFallbackSellerId: boolean;
  missingArtwork: boolean;
  missingAudio: boolean;
};

type ListingMapResult = {
  listing: MarketplaceListing | null;
  dropReason: ListingMapDropReason | null;
  diagnostics: ListingMapDiagnostics;
};

type ListingReadStats = {
  scope: string;
  total: number;
  mapped: number;
  droppedNotPublished: number;
  fallbackTitle: number;
  fallbackArtist: number;
  fallbackSellerId: number;
  missingArtwork: number;
  missingAudio: number;
};

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
        const mapped = mapListingWithDiagnostics(
          topLevelSnapshot.id,
          topLevelSnapshot.data(),
          topLevelSnapshot.ref.path
        );
        const listing = mapped.listing;
        logListingReadStats(buildListingStats('fetchMarketplaceListingById.top-level', [mapped]));

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
        const mapped = mapListingWithDiagnostics(
          nestedSnapshot.docs[0].id,
          nestedSnapshot.docs[0].data(),
          nestedSnapshot.docs[0].ref.path
        );
        const listing = mapped.listing;
        logListingReadStats(buildListingStats('fetchMarketplaceListingById.nested', [mapped]));
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
      const directMapped = directSnapshot.docs.map((document) =>
        mapListingWithDiagnostics(document.id, document.data(), document.ref.path)
      );
      logListingReadStats(buildListingStats('fetchSellerListings.direct', directMapped));
      const directListings = directMapped
        .map((result) => result.listing)
        .filter((listing): listing is MarketplaceListing => listing !== null)
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

    for (const field of SELLER_ID_FIELDS) {
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
          const mappedListings = snapshot.docs.map((document) =>
            mapListingWithDiagnostics(document.id, document.data(), document.ref.path)
          );
          logListingReadStats(buildListingStats(`fetchSellerListings.${field}`, mappedListings));
          return mappedListings
            .map((result) => result.listing)
            .filter((listing): listing is MarketplaceListing => listing !== null)
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

    for (const visibilityField of PUBLIC_VISIBILITY_FIELDS) {
      if (visibilityField === 'isPublic') {
        continue;
      }

      for (const ownerField of SELLER_ID_FIELDS) {
        try {
          const snapshot = await getDocs(
            query(
              collectionGroup(db, UPLOADS_COLLECTION),
              where(visibilityField, '==', true),
              where(ownerField, '==', sellerId),
              limit(Math.max(limitCount * 3, limitCount))
            )
          );

          if (!snapshot.empty) {
            const mappedListings = snapshot.docs.map((document) =>
              mapListingWithDiagnostics(document.id, document.data(), document.ref.path)
            );
            logListingReadStats(
              buildListingStats(
                `fetchSellerListings.${visibilityField}.${ownerField}`,
                mappedListings
              )
            );
            return mappedListings
              .map((result) => result.listing)
              .filter((listing): listing is MarketplaceListing => listing !== null)
              .sort(compareListingsByDate)
              .slice(0, limitCount);
          }
        } catch (error) {
          if (!isRecoverableFirestoreReadError(error)) {
            throw error;
          }

          logFirestoreFallback(
            `fetchSellerListings ${visibilityField}/${ownerField} lookup`,
            error
          );
        }
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
  const createdQuery = query(
    collectionGroup(db, UPLOADS_COLLECTION),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(scanLimit)
  );

  const [recentSnapshot, rankedSnapshot, createdSnapshot] = await Promise.allSettled([
    getDocs(recentQuery),
    getDocs(rankedQuery),
    getDocs(createdQuery),
  ]);
  const docs: QueryDocumentSnapshot<DocumentData>[] = [];
  if (recentSnapshot.status === 'fulfilled') {
    docs.push(...recentSnapshot.value.docs);
  }
  if (rankedSnapshot.status === 'fulfilled') {
    docs.push(...rankedSnapshot.value.docs);
  }
  if (createdSnapshot.status === 'fulfilled') {
    docs.push(...createdSnapshot.value.docs);
  }

  if (docs.length > 0) {
    const mapped = docs.map((document) =>
      mapListingWithDiagnostics(document.id, document.data(), document.ref.path)
    );
    logListingReadStats(buildListingStats('fetchPublishedUploads.primary', mapped));
    return sortAndDedupeListings(mapped.map((result) => result.listing));
  }

  const primaryError =
    recentSnapshot.status === 'rejected'
      ? recentSnapshot.reason
      : rankedSnapshot.status === 'rejected'
        ? rankedSnapshot.reason
        : createdSnapshot.status === 'rejected'
          ? createdSnapshot.reason
        : null;

  if (isMissingIndexError(primaryError)) {
    if (__DEV__) {
      console.warn(
        '[marketplace] Published upload ranking needs a Firestore index. Showing unranked uploads.'
      );
    }
  } else if (primaryError) {
    throw primaryError;
  }

  let canonicalDocs: QueryDocumentSnapshot<DocumentData>[] = [];
  let canonicalError: unknown = null;

  try {
    const fallbackSnapshot = await getDocs(
      query(
        collectionGroup(db, UPLOADS_COLLECTION),
        where('isPublic', '==', true),
        limit(scanLimit)
      )
    );
    canonicalDocs = fallbackSnapshot.docs;
  } catch (error) {
    if (!isRecoverableFirestoreReadError(error)) {
      throw error;
    }

    canonicalError = error;
    logFirestoreFallback('fetchPublishedUploads canonical fallback', error);
  }

  if (canonicalDocs.length > 0) {
    const fallbackMapped = canonicalDocs.map((document) =>
      mapListingWithDiagnostics(document.id, document.data(), document.ref.path)
    );
    logListingReadStats(buildListingStats('fetchPublishedUploads.fallback', fallbackMapped));
    return sortAndDedupeListings(fallbackMapped.map((result) => result.listing));
  }

  const visibilityFallback = await fetchVisibilityVariantDocs(db, scanLimit);

  if (visibilityFallback.docs.length > 0) {
    const visibilityMapped = visibilityFallback.docs.map((document) =>
      mapListingWithDiagnostics(document.id, document.data(), document.ref.path)
    );
    logListingReadStats(
      buildListingStats('fetchPublishedUploads.visibility-fallback', visibilityMapped)
    );
    return sortAndDedupeListings(visibilityMapped.map((result) => result.listing));
  }

  if (!visibilityFallback.hadSuccessfulQuery) {
    throw visibilityFallback.firstError ?? canonicalError ?? new Error('No read path succeeded.');
  }

  return [];
}

async function fetchVisibilityVariantDocs(db: Firestore, scanLimit: number) {
  const visibilityFields = PUBLIC_VISIBILITY_FIELDS.filter((field) => field !== 'isPublic');
  const snapshots = await Promise.allSettled(
    visibilityFields.map((field) =>
      getDocs(
        query(
          collectionGroup(db, UPLOADS_COLLECTION),
          where(field, '==', true),
          limit(scanLimit)
        )
      )
    )
  );

  const docs: QueryDocumentSnapshot<DocumentData>[] = [];
  let firstError: unknown = null;
  let hadSuccessfulQuery = false;

  snapshots.forEach((snapshot, index) => {
    const field = visibilityFields[index];
    if (snapshot.status === 'fulfilled') {
      hadSuccessfulQuery = true;
      docs.push(...snapshot.value.docs);
      return;
    }

    if (!firstError) {
      firstError = snapshot.reason;
    }

    logFirestoreFallback(`fetchPublishedUploads visibility=${field}`, snapshot.reason);
  });

  return {
    docs,
    firstError,
    hadSuccessfulQuery,
  };
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

function buildListingStats(scope: string, mapped: ListingMapResult[]): ListingReadStats {
  return mapped.reduce<ListingReadStats>(
    (stats, result) => {
      stats.total += 1;

      if (result.listing) {
        stats.mapped += 1;
      }

      if (result.dropReason === 'not_published') {
        stats.droppedNotPublished += 1;
      }

      if (result.diagnostics.usedFallbackTitle) {
        stats.fallbackTitle += 1;
      }

      if (result.diagnostics.usedFallbackArtist) {
        stats.fallbackArtist += 1;
      }

      if (result.diagnostics.usedFallbackSellerId) {
        stats.fallbackSellerId += 1;
      }

      if (result.diagnostics.missingArtwork) {
        stats.missingArtwork += 1;
      }

      if (result.diagnostics.missingAudio) {
        stats.missingAudio += 1;
      }

      return stats;
    },
    {
      scope,
      total: 0,
      mapped: 0,
      droppedNotPublished: 0,
      fallbackTitle: 0,
      fallbackArtist: 0,
      fallbackSellerId: 0,
      missingArtwork: 0,
      missingAudio: 0,
    }
  );
}

function logListingReadStats(stats: ListingReadStats) {
  if (stats.total === 0) {
    return;
  }

  const sparseWarning =
    stats.missingArtwork > 0 ||
    stats.missingAudio > 0 ||
    stats.fallbackArtist > 0 ||
    stats.fallbackTitle > 0 ||
    stats.fallbackSellerId > 0;
  const dropWarning = stats.droppedNotPublished > 0;

  if (!sparseWarning && !dropWarning) {
    return;
  }

  const summary = [
    `mapped=${stats.mapped}/${stats.total}`,
    `dropped_not_published=${stats.droppedNotPublished}`,
    `fallback_title=${stats.fallbackTitle}`,
    `fallback_artist=${stats.fallbackArtist}`,
    `fallback_seller=${stats.fallbackSellerId}`,
    `missing_artwork=${stats.missingArtwork}`,
    `missing_audio=${stats.missingAudio}`,
  ].join(', ');

  if (__DEV__) {
    console.warn(`[marketplace] ${stats.scope} diagnostics: ${summary}`);
  }
}

function logFirestoreReadError(scope: string, error: unknown) {
  if (!__DEV__) return;

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
  if (!__DEV__) return;

  const message = error instanceof Error ? error.message : 'Unknown Firestore read error';
  const code = error instanceof FirebaseError ? error.code : 'unknown';

  console.warn(`[marketplace] ${scope} fell back (${code}): ${message}`);
}

function mapListingWithDiagnostics(
  listingId: string,
  raw: Record<string, unknown>,
  documentPath?: string
): ListingMapResult {
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
  const titleCandidate =
    pickString(
      raw.title,
      metadata.title,
      details.title,
      raw.trackTitle,
      raw.name,
      metadata.name,
      raw.fileName,
      raw.originalName
    );
  const title = titleCandidate ?? 'Untitled listing';
  const sellerIdCandidate =
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
    );
  const inferredSellerId = inferOwnerIdFromPath(documentPath);
  const sellerId =
    sellerIdCandidate ?? inferredSellerId ?? `unknown-seller:${listingId}`;
  const usedFallbackSellerId = !sellerIdCandidate && !inferredSellerId;

  if (!isPublishedListing(raw)) {
    return {
      listing: null,
      dropReason: 'not_published',
      diagnostics: {
        usedFallbackTitle: titleCandidate === null,
        usedFallbackArtist: false,
        usedFallbackSellerId,
        missingArtwork: false,
        missingAudio: false,
      },
    };
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

  const listing: MarketplaceListing = {
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

  return {
    listing,
    dropReason: null,
    diagnostics: {
      usedFallbackTitle: titleCandidate === null,
      usedFallbackArtist: uploaderName === null,
      usedFallbackSellerId,
      missingArtwork: !artworkUrl,
      missingAudio: !audioUrl,
    },
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
