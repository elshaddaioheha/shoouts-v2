import type {
  AppExperience,
  SubscriptionStatus,
  UserRole,
} from '@/src/features/access/access.types';

export type SellerVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'rejected';

export type AccountDocumentState = 'missing' | 'partial' | 'ready';

export type AccountDataHealth = {
  profileSource: 'fallback' | 'firestore';
  userDocState: AccountDocumentState;
  subscriptionDocState: AccountDocumentState;
  missingFields: string[];
  notes: string[];
};

export type AccountProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;

  role: UserRole;
  activeExperience: AppExperience;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: UserRole;
  isSubscribed: boolean;

  onboarding: {
    hasSeenOnboarding: boolean;
    needsRoleSelection: boolean;
    selectedRole: UserRole | null;
    studioSetupCompletedAt: string | null;
  };

  seller: {
    verificationStatus: SellerVerificationStatus;
    payoutsEnabled: boolean;
  };

  usage: {
    vaultStorageUsedBytes: number;
    vaultUploadCount: number;
  };

  dataHealth: AccountDataHealth;
};
