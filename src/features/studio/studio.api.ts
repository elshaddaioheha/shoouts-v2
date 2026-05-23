import { getFirebaseDb, getFirebaseStorage } from '@/src/config/firebase';
import { FirebaseError } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import type {
  StudioListing,
  StudioListingLifecycle,
  StudioListingLicenseType,
} from './studio.types';

const USERS = 'users';
const LISTINGS = 'listings';

export type CreateDraftInput = {
  title: string;
  priceInCents: number;
  genre: string | null;
  licenseType: StudioListingLicenseType | null;
  description: string | null;
  bpm: number | null;
  key: string | null;
};

export async function createDraftListing(
  uid: string,
  input: CreateDraftInput
): Promise<string> {
  const db = getFirebaseDb();
  const docRef = await addDoc(collection(db, USERS, uid, LISTINGS), {
    ownerId: uid,
    title: input.title,
    priceInCents: input.priceInCents,
    audioUrl: null,
    coverUrl: null,
    genre: input.genre,
    licenseType: input.licenseType,
    description: input.description,
    bpm: input.bpm,
    key: input.key,
    tags: [],
    lifecycleStatus: 'draft' as StudioListingLifecycle,
    isPublic: false,
    listenCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: null,
  });
  return docRef.id;
}

export async function patchListingUrls(
  uid: string,
  listingId: string,
  urls: { audioUrl?: string; coverUrl?: string }
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, USERS, uid, LISTINGS, listingId), {
    ...urls,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchStudioListings(uid: string): Promise<StudioListing[]> {
  const db = getFirebaseDb();
  const listingsRef = collection(db, USERS, uid, LISTINGS);

  try {
    const snapshot = await getDocs(query(listingsRef, orderBy('updatedAt', 'desc')));
    return snapshot.docs.map(mapListing);
  } catch (error) {
    if (isRecoverableError(error)) {
      const snapshot = await getDocs(query(listingsRef));
      return snapshot.docs
        .map(mapListing)
        .sort((a, b) => b.updatedAtMs - a.updatedAtMs);
    }
    throw error;
  }
}

export function uploadListingFile(
  uid: string,
  listingId: string,
  fileType: 'audio' | 'cover',
  fileUri: string,
  ext: string,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storage = getFirebaseStorage();
    const storagePath = `users/${uid}/listings/${listingId}/${fileType}.${ext}`;
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

function mapListing(document: QueryDocumentSnapshot<DocumentData>): StudioListing {
  const d = document.data();
  return {
    id: document.id,
    ownerId: asString(d.ownerId) ?? '',
    title: asString(d.title) ?? 'Untitled',
    audioUrl: asNullableString(d.audioUrl),
    coverUrl: asNullableString(d.coverUrl),
    priceInCents: typeof d.priceInCents === 'number' ? d.priceInCents : 0,
    genre: asNullableString(d.genre),
    licenseType: isLicenseType(d.licenseType) ? d.licenseType : null,
    description: asNullableString(d.description),
    bpm: typeof d.bpm === 'number' ? d.bpm : null,
    key: asNullableString(d.key),
    tags: Array.isArray(d.tags)
      ? d.tags.filter((t): t is string => typeof t === 'string')
      : [],
    lifecycleStatus: isLifecycle(d.lifecycleStatus) ? d.lifecycleStatus : 'draft',
    isPublic: d.isPublic === true,
    listenCount: typeof d.listenCount === 'number' ? d.listenCount : 0,
    createdAtMs: getTimestampMs(d.createdAt),
    updatedAtMs: getTimestampMs(d.updatedAt),
    publishedAtMs: d.publishedAt ? getTimestampMs(d.publishedAt) : null,
  };
}

function asString(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
}

function asNullableString(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() || null : null;
}

function isLicenseType(v: unknown): v is StudioListingLicenseType {
  return v === 'lease' || v === 'exclusive' || v === 'non_exclusive';
}

function isLifecycle(v: unknown): v is StudioListingLifecycle {
  return v === 'draft' || v === 'published' || v === 'archived';
}

function isRecoverableError(error: unknown) {
  return (
    error instanceof FirebaseError &&
    ['failed-precondition', 'unavailable', 'deadline-exceeded'].includes(error.code)
  );
}

function getTimestampMs(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'number') {
    return value > 0 && value < 1e10 ? value * 1000 : value;
  }
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (typeof v.toMillis === 'function') {
      try {
        return Number((v.toMillis as () => unknown)()) || 0;
      } catch {
        return 0;
      }
    }
    if (typeof v.seconds === 'number') return v.seconds * 1000;
    if (typeof v._seconds === 'number') return (v._seconds as number) * 1000;
  }
  return 0;
}
