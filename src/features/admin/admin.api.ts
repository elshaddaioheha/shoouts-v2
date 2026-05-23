import { getFirebaseDb } from '@/src/config/firebase';
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import type { ChatThread } from '../chat/chat.types';
import type { StudioListing } from '../studio/studio.types';
import type { AdminReport, AdminUser, ReportActionTaken, ReportReason, ReportStatus } from './admin.types';

const THREADS = 'threads';
const MESSAGES = 'messages';
const REPORTS = 'reports';
const USERS = 'users';
const LISTINGS = 'listings';

// ─── Reports ────────────────────────────────────────────────────────────────

export async function submitReport(params: {
  listingId: string;
  listingTitle: string;
  sellerId: string;
  reportedBy: string;
  reason: ReportReason;
  details: string | null;
}): Promise<void> {
  const db = getFirebaseDb();
  await addDoc(collection(db, REPORTS), {
    ...params,
    status: 'pending' as ReportStatus,
    actionTaken: null,
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  });
}

export function subscribeToReports(
  status: ReportStatus | 'all',
  onData: (reports: AdminReport[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const reportsRef = collection(db, REPORTS);
  const q =
    status === 'all'
      ? query(reportsRef, orderBy('createdAt', 'desc'), limit(100))
      : query(reportsRef, where('status', '==', status), orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(mapReport)),
    onError
  );
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  actionTaken: ReportActionTaken,
  reviewedBy: string
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, REPORTS, reportId), {
    status,
    actionTaken,
    reviewedBy,
    reviewedAt: serverTimestamp(),
  });
}

// ─── Threads ─────────────────────────────────────────────────────────────────

export function subscribeToAdminThreads(
  status: 'open' | 'flagged' | 'closed' | 'all',
  onData: (threads: ChatThread[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const threadsRef = collection(db, THREADS);
  const q =
    status === 'all'
      ? query(threadsRef, orderBy('lastMessageAt', 'desc'), limit(100))
      : query(threadsRef, where('status', '==', status), orderBy('lastMessageAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(mapAdminThread)),
    onError
  );
}

export async function flagThread(threadId: string, flaggedBy: string): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, THREADS, threadId), {
    status: 'flagged',
    flaggedAt: serverTimestamp(),
    flaggedBy,
  });
}

export async function closeThread(threadId: string): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, THREADS, threadId), {
    status: 'closed',
  });
}

export async function reopenThread(threadId: string): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, THREADS, threadId), {
    status: 'open',
    flaggedAt: null,
    flaggedBy: null,
  });
}

export async function softDeleteMessage(threadId: string, messageId: string): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, THREADS, threadId, MESSAGES, messageId), {
    deletedAt: serverTimestamp(),
  });
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export function subscribeToAdminListings(
  filter: 'all' | 'published' | 'draft' | 'taken_down' | 'archived',
  onData: (listings: StudioListing[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const listingsGroup = collectionGroup(db, LISTINGS);
  const q =
    filter === 'all'
      ? query(listingsGroup, orderBy('createdAt', 'desc'), limit(80))
      : query(listingsGroup, where('lifecycleStatus', '==', filter), orderBy('createdAt', 'desc'), limit(80));

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(mapAdminListing)),
    onError
  );
}

export async function takeDownListing(
  ownerUid: string,
  listingId: string,
  reason: string
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, USERS, ownerUid, LISTINGS, listingId), {
    lifecycleStatus: 'taken_down',
    isPublic: false,
    takenDownAt: serverTimestamp(),
    takenDownReason: reason,
  });
}

export async function restoreListing(ownerUid: string, listingId: string): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, USERS, ownerUid, LISTINGS, listingId), {
    lifecycleStatus: 'published',
    isPublic: true,
    takenDownAt: null,
    takenDownReason: null,
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function searchAdminUsers(searchQuery: string, limitCount = 20): Promise<AdminUser[]> {
  const db = getFirebaseDb();
  const usersRef = collection(db, USERS);

  const snap = await getDocs(
    query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount))
  );
  const all = snap.docs.map(mapAdminUser);

  if (!searchQuery.trim()) return all;

  const lower = searchQuery.toLowerCase().trim();
  return all.filter(
    (u) =>
      u.uid.toLowerCase().includes(lower) ||
      u.email?.toLowerCase().includes(lower) ||
      u.displayName?.toLowerCase().includes(lower)
  );
}

export async function fetchAdminUser(uid: string): Promise<AdminUser | null> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, USERS), where('uid', '==', uid), limit(1))
  );
  if (snap.empty) return null;
  return mapAdminUser(snap.docs[0]);
}

export async function restrictUser(uid: string): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, USERS, uid), { isRestricted: true });
}

export async function unrestrictUser(uid: string): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, USERS, uid), { isRestricted: false });
}

export async function suspendUser(uid: string): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, USERS, uid), { isSuspended: true });
}

export async function unsuspendUser(uid: string): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, USERS, uid), { isSuspended: false });
}

export async function fetchAdminStats(): Promise<{
  pendingReports: number;
  flaggedThreads: number;
  openThreads: number;
}> {
  const db = getFirebaseDb();
  const [pendingSnap, flaggedSnap, openSnap] = await Promise.all([
    getDocs(query(collection(db, REPORTS), where('status', '==', 'pending'), limit(100))),
    getDocs(query(collection(db, THREADS), where('status', '==', 'flagged'), limit(100))),
    getDocs(query(collection(db, THREADS), where('status', '==', 'open'), limit(100))),
  ]);
  return {
    pendingReports: pendingSnap.size,
    flaggedThreads: flaggedSnap.size,
    openThreads: openSnap.size,
  };
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapReport(d: QueryDocumentSnapshot<DocumentData>): AdminReport {
  const data = d.data();
  return {
    id: d.id,
    listingId: asString(data.listingId) ?? '',
    listingTitle: asString(data.listingTitle) ?? 'Untitled',
    sellerId: asString(data.sellerId) ?? '',
    reportedBy: asString(data.reportedBy) ?? '',
    reason: isReportReason(data.reason) ? data.reason : 'other',
    details: asNullableString(data.details),
    status: isReportStatus(data.status) ? data.status : 'pending',
    createdAtMs: getTimestampMs(data.createdAt),
    reviewedAtMs: data.reviewedAt ? getTimestampMs(data.reviewedAt) : null,
    reviewedBy: asNullableString(data.reviewedBy),
    actionTaken: isReportAction(data.actionTaken) ? data.actionTaken : null,
  };
}

function mapAdminThread(d: QueryDocumentSnapshot<DocumentData>): ChatThread {
  const data = d.data();
  return {
    id: d.id,
    buyerId: asString(data.buyerId) ?? '',
    sellerId: asString(data.sellerId) ?? '',
    listingId: asString(data.listingId) ?? '',
    listingTitle: asString(data.listingTitle) ?? 'Untitled',
    listingCoverUrl: asNullableString(data.listingCoverUrl),
    participants: Array.isArray(data.participants) ? data.participants : [],
    createdAtMs: getTimestampMs(data.createdAt),
    lastMessageAtMs: getTimestampMs(data.lastMessageAt),
    lastMessageText: asString(data.lastMessageText) ?? '',
    lastMessageSenderId: asString(data.lastMessageSenderId) ?? '',
    unreadCountBuyer: typeof data.unreadCountBuyer === 'number' ? data.unreadCountBuyer : 0,
    unreadCountSeller: typeof data.unreadCountSeller === 'number' ? data.unreadCountSeller : 0,
    status: data.status === 'flagged' || data.status === 'closed' ? data.status : 'open',
    flaggedAtMs: data.flaggedAt ? getTimestampMs(data.flaggedAt) : null,
    flaggedBy: asNullableString(data.flaggedBy),
  };
}

function mapAdminListing(d: QueryDocumentSnapshot<DocumentData>): StudioListing {
  const data = d.data();
  return {
    id: d.id,
    ownerId: asString(data.ownerId) ?? '',
    title: asString(data.title) ?? 'Untitled',
    audioUrl: asNullableString(data.audioUrl),
    coverUrl: asNullableString(data.coverUrl),
    priceInCents: typeof data.priceInCents === 'number' ? data.priceInCents : 0,
    genre: asNullableString(data.genre),
    licenseType: null,
    description: asNullableString(data.description),
    bpm: typeof data.bpm === 'number' ? data.bpm : null,
    key: asNullableString(data.key),
    tags: Array.isArray(data.tags) ? data.tags.filter((t): t is string => typeof t === 'string') : [],
    lifecycleStatus: isLifecycle(data.lifecycleStatus) ? data.lifecycleStatus : 'draft',
    isPublic: data.isPublic === true,
    listenCount: typeof data.listenCount === 'number' ? data.listenCount : 0,
    createdAtMs: getTimestampMs(data.createdAt),
    updatedAtMs: getTimestampMs(data.updatedAt),
    publishedAtMs: data.publishedAt ? getTimestampMs(data.publishedAt) : null,
    takenDownAt: data.takenDownAt ? getTimestampMs(data.takenDownAt) : null,
    takenDownReason: asNullableString(data.takenDownReason),
    vaultSourceId: asNullableString(data.vaultSourceId),
  };
}

function mapAdminUser(d: QueryDocumentSnapshot<DocumentData>): AdminUser {
  const data = d.data();
  return {
    uid: asString(data.uid) ?? d.id,
    email: asNullableString(data.email),
    displayName: asNullableString(data.displayName),
    role: asString(data.role) ?? 'shoouts',
    isRestricted: data.isRestricted === true,
    isSuspended: data.isSuspended === true,
    createdAtMs: getTimestampMs(data.createdAt),
  };
}

function asString(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
}

function asNullableString(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() || null : null;
}

function isReportReason(v: unknown): v is ReportReason {
  return v === 'copyright' || v === 'inappropriate' || v === 'spam' || v === 'other';
}

function isReportStatus(v: unknown): v is ReportStatus {
  return v === 'pending' || v === 'reviewed' || v === 'actioned' || v === 'dismissed';
}

function isReportAction(v: unknown): v is ReportActionTaken {
  return (
    v === null ||
    v === 'none' ||
    v === 'listing_taken_down' ||
    v === 'account_restricted' ||
    v === 'account_suspended'
  );
}

function isLifecycle(v: unknown) {
  return v === 'draft' || v === 'published' || v === 'archived' || v === 'taken_down';
}

function getTimestampMs(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'number') return value > 0 && value < 1e10 ? value * 1000 : value;
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (typeof v.toMillis === 'function') {
      try { return Number((v.toMillis as () => unknown)()) || 0; } catch { return 0; }
    }
    if (typeof v.seconds === 'number') return v.seconds * 1000;
    if (typeof v._seconds === 'number') return (v._seconds as number) * 1000;
  }
  return 0;
}
