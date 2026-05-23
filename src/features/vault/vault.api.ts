import { getFirebaseDb, getFirebaseStorage } from '@/src/config/firebase';
import { FirebaseError } from 'firebase/app';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { VaultProject, VaultProjectEditFields } from './vault.types';

const USERS_COLLECTION = 'users';
const UPLOADS_COLLECTION = 'uploads';
const VAULT_PROJECTS_COLLECTION = 'vaultProjects';
const PROJECTS_COLLECTION = 'projects';
const OWNER_ID_FIELDS = ['ownerId', 'uploaderId', 'sellerId', 'userId', 'uid'] as const;

type VaultProjectDiagnostics = {
  usedFallbackTitle: boolean;
  usedFallbackArtist: boolean;
  missingAudio: boolean;
  missingCover: boolean;
  inferredOwnerId: boolean;
};

type VaultProjectMapResult = {
  project: VaultProject;
  diagnostics: VaultProjectDiagnostics;
};

type VaultReadStats = {
  scope: string;
  total: number;
  fallbackTitle: number;
  fallbackArtist: number;
  missingAudio: number;
  missingCover: number;
  inferredOwnerId: number;
};

export async function updateVaultProject(
  sourcePath: string,
  fields: Partial<VaultProjectEditFields>
): Promise<void> {
  const db = getFirebaseDb();
  const segments = sourcePath.split('/').filter(Boolean);
  const docRef = doc(db, segments[0], ...segments.slice(1));
  await updateDoc(docRef, {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

export async function markVaultProjectPromoted(sourcePath: string): Promise<void> {
  const db = getFirebaseDb();
  const segments = sourcePath.split('/').filter(Boolean);
  const docRef = doc(db, segments[0], ...segments.slice(1));
  await updateDoc(docRef, {
    lifecycleStatus: 'promoted',
    updatedAt: serverTimestamp(),
  });
}

export function uploadVaultCover(
  uid: string,
  projectId: string,
  fileUri: string,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storage = getFirebaseStorage();
    const ext = fileUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const storagePath = `users/${uid}/vaultProjects/${projectId}/cover.${ext}`;
    const storageRef = ref(storage, storagePath);

    fetch(fileUri)
      .then((res) => res.blob())
      .then((blob) => {
        const task = uploadBytesResumable(storageRef, blob);
        task.on(
          'state_changed',
          (snap) => {
            if (snap.totalBytes > 0) {
              onProgress(snap.bytesTransferred / snap.totalBytes);
            }
          },
          reject,
          () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject)
        );
      })
      .catch(reject);
  });
}

export async function fetchVaultProjects(uid: string, limitCount = 24): Promise<VaultProject[]> {
  try {
    const db = getFirebaseDb();
    const scanLimit = Math.max(limitCount * 3, limitCount);

    const vaultProjectDocs = await readUserScopedDocs(
      db,
      uid,
      VAULT_PROJECTS_COLLECTION,
      scanLimit,
      'fetchVaultProjects.users.vaultProjects'
    );
    if (vaultProjectDocs.length > 0) {
      const mapped = mapVaultProjects(vaultProjectDocs);
      logVaultReadStats(buildVaultReadStats('fetchVaultProjects.users.vaultProjects', mapped));
      return mapped
        .map((entry) => entry.project)
        .sort(compareVaultProjectsByDate)
        .slice(0, limitCount);
    }

    const projectDocs = await readUserScopedDocs(
      db,
      uid,
      PROJECTS_COLLECTION,
      scanLimit,
      'fetchVaultProjects.users.projects'
    );
    if (projectDocs.length > 0) {
      const mapped = mapVaultProjects(projectDocs);
      logVaultReadStats(buildVaultReadStats('fetchVaultProjects.users.projects', mapped));
      return mapped
        .map((entry) => entry.project)
        .sort(compareVaultProjectsByDate)
        .slice(0, limitCount);
    }

    const uploadDocs = await readUserScopedDocs(
      db,
      uid,
      UPLOADS_COLLECTION,
      scanLimit,
      'fetchVaultProjects.users.uploads'
    );
    if (uploadDocs.length > 0) {
      const mapped = mapVaultProjects(uploadDocs);
      logVaultReadStats(buildVaultReadStats('fetchVaultProjects.users.uploads', mapped));
      return selectPrivateFirst(mapped.map((entry) => entry.project))
        .sort(compareVaultProjectsByDate)
        .slice(0, limitCount);
    }

    const groupDocs = await readCollectionGroupDocs(db, uid, scanLimit);
    if (groupDocs.length > 0) {
      const mapped = mapVaultProjects(groupDocs);
      logVaultReadStats(buildVaultReadStats('fetchVaultProjects.collectionGroup.uploads', mapped));
      return selectPrivateFirst(mapped.map((entry) => entry.project))
        .sort(compareVaultProjectsByDate)
        .slice(0, limitCount);
    }

    return [];
  } catch (error) {
    logVaultReadError('fetchVaultProjects', error);
    throw error;
  }
}

async function readUserScopedDocs(
  db: Firestore,
  uid: string,
  childCollection: string,
  scanLimit: number,
  scope: string
) {
  const collectionRef = collection(db, USERS_COLLECTION, uid, childCollection);
  const attempts = [
    query(collectionRef, orderBy('updatedAt', 'desc'), limit(scanLimit)),
    query(collectionRef, orderBy('createdAt', 'desc'), limit(scanLimit)),
    query(collectionRef, limit(scanLimit)),
  ];
  let firstRecoverableError: unknown = null;

  for (let attemptIndex = 0; attemptIndex < attempts.length; attemptIndex += 1) {
    try {
      const snapshot = await getDocs(attempts[attemptIndex]);
      if (attemptIndex > 0) {
        logVaultFallback(`${scope}.attempt${attemptIndex + 1}`, firstRecoverableError);
      }
      return snapshot.docs;
    } catch (error) {
      if (!isRecoverableFirestoreReadError(error)) {
        throw error;
      }

      if (!firstRecoverableError) {
        firstRecoverableError = error;
      }
    }
  }

  if (firstRecoverableError) {
    logVaultFallback(`${scope}.recoverable-failure`, firstRecoverableError);
  }

  return [] as QueryDocumentSnapshot<DocumentData>[];
}

async function readCollectionGroupDocs(db: Firestore, uid: string, scanLimit: number) {
  for (const ownerField of OWNER_ID_FIELDS) {
    try {
      const snapshot = await getDocs(
        query(
          collectionGroup(db, UPLOADS_COLLECTION),
          where(ownerField, '==', uid),
          limit(scanLimit)
        )
      );

      if (!snapshot.empty) {
        return snapshot.docs;
      }
    } catch (error) {
      if (!isRecoverableFirestoreReadError(error)) {
        throw error;
      }

      logVaultFallback(`fetchVaultProjects.collectionGroup.owner=${ownerField}`, error);
    }
  }

  return [] as QueryDocumentSnapshot<DocumentData>[];
}

function mapVaultProjects(documents: QueryDocumentSnapshot<DocumentData>[]) {
  return documents.map((document) =>
    mapVaultProject(document.id, document.data(), document.ref.path)
  );
}

function mapVaultProject(
  projectId: string,
  raw: Record<string, unknown>,
  sourcePath?: string
): VaultProjectMapResult {
  const metadata = asRecord(raw.metadata);
  const details = asRecord(raw.details);
  const seller = asRecord(raw.seller);
  const uploader = asRecord(raw.uploader);
  const owner = asRecord(raw.owner);
  const media = asRecord(raw.media);
  const files = asRecord(raw.files);
  const artwork = asRecord(raw.artwork);
  const cover = asRecord(raw.cover);
  const release = asRecord(raw.release);

  const titleCandidate = pickString(
    raw.title,
    raw.projectTitle,
    raw.name,
    raw.trackTitle,
    metadata.title,
    details.title,
    raw.fileName,
    raw.originalName
  );
  const artistCandidate = pickString(
    raw.artist,
    raw.artistName,
    raw.uploaderName,
    raw.creatorName,
    seller.name,
    seller.displayName,
    uploader.name,
    uploader.displayName,
    owner.name,
    owner.displayName,
    metadata.artist
  );
  const ownerIdCandidate = pickString(
    raw.ownerId,
    raw.uploaderId,
    raw.sellerId,
    raw.userId,
    raw.uid,
    owner.id,
    owner.uid,
    uploader.id,
    uploader.uid
  );
  const inferredOwnerId = inferOwnerIdFromPath(sourcePath);
  const ownerId = ownerIdCandidate ?? inferredOwnerId ?? `unknown-owner:${projectId}`;

  const project: VaultProject = {
    id: projectId,
    sourcePath,
    ownerId,
    title: titleCandidate ?? 'untitled project',
    artist: artistCandidate ?? 'Creator',
    audioUrl: pickNullableString(
      raw.audioUrl,
      raw.previewUrl,
      raw.streamingUrl,
      raw.url,
      media.audioUrl,
      media.previewUrl,
      files.audioUrl,
      files.previewUrl
    ),
    coverUrl: pickNullableString(
      raw.coverUrl,
      raw.artworkUrl,
      raw.imageUrl,
      raw.thumbnailUrl,
      artwork.url,
      artwork.downloadUrl,
      cover.url
    ),
    isPublic: isPublicProject(raw),
    createdAtMs: pickTimestampMs(raw.createdAt, raw.uploadedAt, metadata.createdAt),
    updatedAtMs: pickTimestampMs(
      raw.updatedAt,
      raw.lastUpdatedAt,
      raw.modifiedAt,
      release.updatedAt
    ),
    folderName: pickNullableString(raw.folderName, raw.folder, details.folderName),
    lifecycleStatus: pickNullableString(raw.lifecycleStatus, raw.publishState, raw.status),
    genre: pickNullableString(raw.genre, metadata.genre, details.genre),
    bpm: typeof raw.bpm === 'number' ? raw.bpm : null,
    key: pickNullableString(raw.key, metadata.key, details.key),
    description: pickNullableString(raw.description, metadata.description, details.description),
  };

  return {
    project,
    diagnostics: {
      usedFallbackTitle: titleCandidate === null,
      usedFallbackArtist: artistCandidate === null,
      missingAudio: !project.audioUrl,
      missingCover: !project.coverUrl,
      inferredOwnerId: !ownerIdCandidate && Boolean(inferredOwnerId),
    },
  };
}

function selectPrivateFirst(projects: VaultProject[]) {
  const privateProjects = projects.filter((project) => !project.isPublic);
  return privateProjects.length > 0 ? privateProjects : projects;
}

function buildVaultReadStats(scope: string, mappedProjects: VaultProjectMapResult[]): VaultReadStats {
  return mappedProjects.reduce<VaultReadStats>(
    (stats, entry) => {
      stats.total += 1;

      if (entry.diagnostics.usedFallbackTitle) {
        stats.fallbackTitle += 1;
      }

      if (entry.diagnostics.usedFallbackArtist) {
        stats.fallbackArtist += 1;
      }

      if (entry.diagnostics.missingAudio) {
        stats.missingAudio += 1;
      }

      if (entry.diagnostics.missingCover) {
        stats.missingCover += 1;
      }

      if (entry.diagnostics.inferredOwnerId) {
        stats.inferredOwnerId += 1;
      }

      return stats;
    },
    {
      scope,
      total: 0,
      fallbackTitle: 0,
      fallbackArtist: 0,
      missingAudio: 0,
      missingCover: 0,
      inferredOwnerId: 0,
    }
  );
}

function logVaultReadStats(stats: VaultReadStats) {
  if (stats.total === 0) {
    return;
  }

  const sparseDataDetected =
    stats.fallbackTitle > 0 ||
    stats.fallbackArtist > 0 ||
    stats.missingAudio > 0 ||
    stats.missingCover > 0 ||
    stats.inferredOwnerId > 0;

  if (!sparseDataDetected) {
    return;
  }

  const summary = [
    `total=${stats.total}`,
    `fallback_title=${stats.fallbackTitle}`,
    `fallback_artist=${stats.fallbackArtist}`,
    `missing_audio=${stats.missingAudio}`,
    `missing_cover=${stats.missingCover}`,
    `inferred_owner=${stats.inferredOwnerId}`,
  ].join(', ');

  if (__DEV__) {
    console.warn(`[vault] ${stats.scope} diagnostics: ${summary}`);
  }
}

function logVaultReadError(scope: string, error: unknown) {
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

  console.warn(`[vault] ${scope} failed (${code}): ${message}`);
}

function logVaultFallback(scope: string, error: unknown) {
  if (!__DEV__) return;

  const message = error instanceof Error ? error.message : 'Unknown Firestore read error';
  const code = error instanceof FirebaseError ? error.code : 'unknown';
  console.warn(`[vault] ${scope} fell back (${code}): ${message}`);
}

function compareVaultProjectsByDate(a: VaultProject, b: VaultProject) {
  const first = a.updatedAtMs || a.createdAtMs || 0;
  const second = b.updatedAtMs || b.createdAtMs || 0;

  if (second !== first) {
    return second - first;
  }

  return a.title.localeCompare(b.title);
}

function inferOwnerIdFromPath(documentPath?: string) {
  if (!documentPath) {
    return null;
  }

  const segments = documentPath.split('/').filter(Boolean);
  const usersIndex = segments.findIndex((segment) => segment === USERS_COLLECTION);
  if (usersIndex >= 0 && segments[usersIndex + 1]) {
    return segments[usersIndex + 1];
  }

  return null;
}

function isPublicProject(raw: Record<string, unknown>) {
  const release = asRecord(raw.release);
  const visibility = pickString(
    raw.visibility,
    raw.access,
    raw.availability,
    release.visibility
  )?.toLowerCase();

  if (raw.isPublic === true || raw.public === true) {
    return true;
  }

  if (raw.isPublic === false || raw.public === false || visibility === 'private') {
    return false;
  }

  return raw.published === true || raw.isPublished === true || visibility === 'public';
}

function isRecoverableFirestoreReadError(error: unknown) {
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

function pickTimestampMs(...values: unknown[]) {
  for (const value of values) {
    const nextValue = getTimestampMs(value);
    if (nextValue > 0) {
      return nextValue;
    }
  }

  return 0;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function normalizeUnixTimestamp(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value > 0 && value < 10_000_000_000) {
    return Math.round(value * 1000);
  }

  return Math.round(value);
}

function getFirestoreSeconds(value: unknown): number | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  if ('seconds' in value && typeof (value as { seconds?: unknown }).seconds === 'number') {
    return (value as { seconds: number }).seconds;
  }

  if ('_seconds' in value && typeof (value as { _seconds?: unknown })._seconds === 'number') {
    return (value as { _seconds: number })._seconds;
  }

  return null;
}

function getTimestampMs(value: unknown): number {
  if (!value) {
    return 0;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return normalizeUnixTimestamp(value);
  }

  if (typeof value === 'string') {
    const parsedNumber = Number(value);
    if (Number.isFinite(parsedNumber)) {
      return normalizeUnixTimestamp(parsedNumber);
    }

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
    if (seconds !== null) {
      return normalizeUnixTimestamp(seconds);
    }
  }

  return 0;
}
