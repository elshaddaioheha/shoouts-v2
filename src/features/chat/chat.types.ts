export type ThreadStatus = 'open' | 'closed' | 'flagged';

export type ChatThread = {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  listingTitle: string;
  listingCoverUrl: string | null;
  participants: string[];
  createdAtMs: number;
  lastMessageAtMs: number;
  lastMessageText: string;
  lastMessageSenderId: string;
  unreadCountBuyer: number;
  unreadCountSeller: number;
  status: ThreadStatus;
  flaggedAtMs: number | null;
  flaggedBy: string | null;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAtMs: number;
  deletedAtMs: number | null;
};
