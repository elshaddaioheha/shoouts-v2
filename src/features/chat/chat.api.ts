import { getFirebaseDb } from '@/src/config/firebase';
import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import type { ChatMessage, ChatThread } from './chat.types';

const THREADS = 'threads';
const MESSAGES = 'messages';

// ─── Inbox listener ──────────────────────────────────────────────────────────

export function subscribeToInbox(
  uid: string,
  onData: (threads: ChatThread[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(
    collection(db, THREADS),
    where('participants', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(mapThread)),
    onError
  );
}

// ─── Thread messages listener ─────────────────────────────────────────────────

export function subscribeToMessages(
  threadId: string,
  onData: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(
    collection(db, THREADS, threadId, MESSAGES),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snap) => {
      const msgs = snap.docs.map(mapMessage).reverse();
      onData(msgs);
    },
    onError
  );
}

// ─── Find existing thread ─────────────────────────────────────────────────────

export async function findExistingThread(
  buyerId: string,
  listingId: string
): Promise<string | null> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, THREADS),
    where('buyerId', '==', buyerId),
    where('listingId', '==', listingId),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
}

// ─── Create thread + first message ───────────────────────────────────────────

export async function createThread(params: {
  buyerId: string;
  sellerId: string;
  listingId: string;
  listingTitle: string;
  listingCoverUrl: string | null;
  firstMessage: string;
}): Promise<string> {
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  const threadRef = doc(collection(db, THREADS));
  batch.set(threadRef, {
    buyerId: params.buyerId,
    sellerId: params.sellerId,
    listingId: params.listingId,
    listingTitle: params.listingTitle,
    listingCoverUrl: params.listingCoverUrl,
    participants: [params.buyerId, params.sellerId],
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    lastMessageText: params.firstMessage,
    lastMessageSenderId: params.buyerId,
    unreadCountBuyer: 0,
    unreadCountSeller: 1,
    status: 'open',
    flaggedAt: null,
    flaggedBy: null,
  });

  const messageRef = doc(collection(db, THREADS, threadRef.id, MESSAGES));
  batch.set(messageRef, {
    senderId: params.buyerId,
    text: params.firstMessage,
    createdAt: serverTimestamp(),
    deletedAt: null,
  });

  await batch.commit();
  return threadRef.id;
}

// ─── Send message ─────────────────────────────────────────────────────────────

export async function sendMessage(params: {
  threadId: string;
  senderId: string;
  isBuyer: boolean;
  text: string;
}): Promise<void> {
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  const messageRef = doc(collection(db, THREADS, params.threadId, MESSAGES));
  batch.set(messageRef, {
    senderId: params.senderId,
    text: params.text,
    createdAt: serverTimestamp(),
    deletedAt: null,
  });

  const unreadField = params.isBuyer ? 'unreadCountSeller' : 'unreadCountBuyer';
  const threadRef = doc(db, THREADS, params.threadId);
  batch.update(threadRef, {
    lastMessageAt: serverTimestamp(),
    lastMessageText: params.text,
    lastMessageSenderId: params.senderId,
    [unreadField]: increment(1),
  });

  await batch.commit();
}

// ─── Mark thread as read ──────────────────────────────────────────────────────

export async function markThreadRead(
  threadId: string,
  role: 'buyer' | 'seller'
): Promise<void> {
  const db = getFirebaseDb();
  const field = role === 'buyer' ? 'unreadCountBuyer' : 'unreadCountSeller';
  await updateDoc(doc(db, THREADS, threadId), { [field]: 0 });
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapThread(d: QueryDocumentSnapshot<DocumentData>): ChatThread {
  const data = d.data();
  return {
    id: d.id,
    buyerId: asString(data.buyerId),
    sellerId: asString(data.sellerId),
    listingId: asString(data.listingId),
    listingTitle: asString(data.listingTitle) || 'Untitled listing',
    listingCoverUrl: asNullable(data.listingCoverUrl),
    participants: Array.isArray(data.participants) ? data.participants : [],
    createdAtMs: toMs(data.createdAt),
    lastMessageAtMs: toMs(data.lastMessageAt),
    lastMessageText: asString(data.lastMessageText) || '',
    lastMessageSenderId: asString(data.lastMessageSenderId),
    unreadCountBuyer: asNumber(data.unreadCountBuyer),
    unreadCountSeller: asNumber(data.unreadCountSeller),
    status: isStatus(data.status) ? data.status : 'open',
    flaggedAtMs: data.flaggedAt ? toMs(data.flaggedAt) : null,
    flaggedBy: asNullable(data.flaggedBy),
  };
}

function mapMessage(d: QueryDocumentSnapshot<DocumentData>): ChatMessage {
  const data = d.data();
  return {
    id: d.id,
    senderId: asString(data.senderId),
    text: data.deletedAt ? '' : asString(data.text),
    createdAtMs: toMs(data.createdAt),
    deletedAtMs: data.deletedAt ? toMs(data.deletedAt) : null,
  };
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function asNullable(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function asNumber(v: unknown): number {
  return typeof v === 'number' ? v : 0;
}

function isStatus(v: unknown): v is ChatThread['status'] {
  return v === 'open' || v === 'closed' || v === 'flagged';
}

function toMs(v: unknown): number {
  if (!v) return 0;
  if (typeof v === 'number') return v > 1e10 ? v : v * 1000;
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if (typeof o.toMillis === 'function') {
      try { return Number((o.toMillis as () => unknown)()) || 0; } catch { return 0; }
    }
    if (typeof o.seconds === 'number') return o.seconds * 1000;
  }
  return 0;
}
