export type ReportReason = 'copyright' | 'inappropriate' | 'spam' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';
export type ReportActionTaken =
  | 'none'
  | 'listing_taken_down'
  | 'account_restricted'
  | 'account_suspended'
  | null;

export type AdminReport = {
  id: string;
  listingId: string;
  listingTitle: string;
  sellerId: string;
  reportedBy: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  createdAtMs: number;
  reviewedAtMs: number | null;
  reviewedBy: string | null;
  actionTaken: ReportActionTaken;
};

export type AdminUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: string;
  isRestricted: boolean;
  isSuspended: boolean;
  createdAtMs: number;
};
